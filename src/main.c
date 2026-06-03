#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <string.h>
#include <pthread.h>
#include <time.h>
#include <errno.h>
#include <bpf/bpf.h>

#include "lfw_log.h"
#include "lfw_config.h"
#include "lfw_rules.h"
#include "lfw_bpf.h"
#include "lfw_bpf_shared.h"

// Timeouts in nanoseconds (matching kernel BPF)
#define TCP_TIMEOUT_NS (300ULL * 1000000000ULL)
#define UDP_TIMEOUT_NS (60ULL * 1000000000ULL)

static volatile sig_atomic_t g_running = 1;
static volatile sig_atomic_t g_reload_requested = 0;
static volatile sig_atomic_t g_dump_requested = 0;

static lfw_rule_t *g_rules = NULL;
static lfw_u32 g_rule_count = 0;
static lfw_action_t g_default_action = LFW_ACTION_DROP;
static char g_config_path[256] = "/etc/lfw/lfw.rules";

static pthread_t g_gc_thread;
static bool g_gc_running = false;

static void handle_signal(int sig)
{
    if (sig == SIGINT || sig == SIGTERM) {
        g_running = 0;
    } else if (sig == SIGHUP) {
        g_reload_requested = 1;
    } else if (sig == SIGUSR1) {
        g_dump_requested = 1;
    }
}

static void *conntrack_gc_loop(void *arg)
{
    (void)arg;
    while (g_running) {
        for (int i = 0; i < 10 && g_running; i++) {
            sleep(1);
        }
        if (!g_running)
            break;

        int fd = lfw_bpf_get_conntrack_map_fd();
        if (fd < 0)
            continue;

        struct conntrack_key key = {}, next_key = {};
        struct conntrack_val val = {};
        struct timespec ts;
        __u64 now = 0;

        if (clock_gettime(CLOCK_MONOTONIC, &ts) == 0) {
            now = (__u64)ts.tv_sec * 1000000000ULL + ts.tv_nsec;
        } else {
            continue;
        }

        int has_more = bpf_map_get_next_key(fd, NULL, &next_key) == 0;
        while (has_more) {
            key = next_key;
            has_more = bpf_map_get_next_key(fd, &key, &next_key) == 0;

            if (bpf_map_lookup_elem(fd, &key, &val) == 0) {
                __u64 timeout = (key.proto == 1) ? TCP_TIMEOUT_NS : UDP_TIMEOUT_NS;
                if (now - val.last_seen > timeout) {
                    bpf_map_delete_elem(fd, &key);
                }
            }
        }
    }
    return NULL;
}

static void cleanup(void)
{
    lfw_log_info("cleaning up BPF subsystem...");
    g_running = 0;
    
    if (g_gc_running) {
        pthread_join(g_gc_thread, NULL);
        g_gc_running = false;
    }
    
    lfw_bpf_cleanup();
    
    if (g_rules) {
        lfw_config_free_rules(g_rules);
        g_rules = NULL;
    }
    lfw_log_close();
}

int main(int argc, char **argv)
{
    // Root privilege check
    if (geteuid() != 0) {
        fprintf(stderr, "[lfw] run as root\n");
        return 1;
    }

    if (argc < 2) {
        fprintf(stderr, "Usage: %s <interface> [rules_file_path]\n", argv[0]);
        return 1;
    }

    const char *ifname = argv[1];
    if (argc > 2) {
        strncpy(g_config_path, argv[2], sizeof(g_config_path) - 1);
    }

    lfw_log_init(LFW_LOG_SYSLOG);

    // Register signal handlers
    struct sigaction sa = {};
    sa.sa_handler = handle_signal;
    sigemptyset(&sa.sa_mask);
    sigaction(SIGINT, &sa, NULL);
    sigaction(SIGTERM, &sa, NULL);
    sigaction(SIGHUP, &sa, NULL);
    sigaction(SIGUSR1, &sa, NULL);

    atexit(cleanup);

    // 1. Load config rules
    lfw_status_t st = lfw_config_load_file(
        g_config_path,
        &g_default_action,
        &g_rules,
        &g_rule_count
    );

    if (st != LFW_OK) {
        lfw_log_error("failed to load config: %s", g_config_path);
        return 1;
    }

    // 2. Initialize BPF subsystem
    const char *bpf_obj_path = "build/lfw_bpf.o";
    st = lfw_bpf_init(ifname, bpf_obj_path);
    if (st != LFW_OK) {
        lfw_log_error("failed to initialize BPF on interface %s", ifname);
        return 1;
    }

    // 3. Sync initial rules to BPF maps
    st = lfw_bpf_sync_rules(g_rules, g_rule_count, g_default_action);
    if (st != LFW_OK) {
        lfw_log_error("failed to sync rules to BPF maps");
        return 1;
    }

    // 4. Spawn connection tracking garbage collector thread
    if (pthread_create(&g_gc_thread, NULL, conntrack_gc_loop, NULL) == 0) {
        g_gc_running = true;
    } else {
        lfw_log_error("failed to spawn conntrack GC thread");
        return 1;
    }

    lfw_log_info("daemon starting on interface %s", ifname);
    lfw_log_info("config: %s, rules: %u, default: %s",
                 g_config_path,
                 g_rule_count,
                 g_default_action == LFW_ACTION_ACCEPT ? "ACCEPT" : "DROP");

    // Main event loop
    while (g_running) {
        if (g_reload_requested) {
            g_reload_requested = 0;
            lfw_rule_t *new_rules = NULL;
            lfw_u32 new_rule_count = 0;
            lfw_action_t new_default_action = LFW_ACTION_DROP;

            lfw_status_t reload_st = lfw_config_load_file(
                g_config_path,
                &new_default_action,
                &new_rules,
                &new_rule_count
            );

            if (reload_st == LFW_OK) {
                // Sync new rules to BPF
                if (lfw_bpf_sync_rules(new_rules, new_rule_count, new_default_action) == LFW_OK) {
                    lfw_config_free_rules(g_rules);
                    g_rules = new_rules;
                    g_rule_count = new_rule_count;
                    g_default_action = new_default_action;
                    lfw_log_info("Rules configuration reloaded successfully");
                } else {
                    lfw_config_free_rules(new_rules);
                    lfw_log_error("Failed to sync reloaded rules to BPF");
                }
            } else {
                lfw_log_error("Failed to reload rules configuration file: %s", g_config_path);
            }
        }

        if (g_dump_requested) {
            g_dump_requested = 0;
            lfw_bpf_dump_stats(g_rules, g_rule_count, g_default_action);
        }

        pause();
    }

    lfw_log_info("shutdown complete");

    return 0;
}
