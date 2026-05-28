#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <string.h>
#include "lfw_log.h"

#include "lfw_config.h"
#include "lfw_engine.h"
#include "lfw_nfqueue.h"
#include "lfw_state.h"

static int rules_installed = 0;

static void add_iptables_rules()
{
    system("iptables -I PREROUTING -t mangle ! -i lo -j NFQUEUE --queue-num 0");
    system("iptables -I OUTPUT -t mangle ! -o lo -j NFQUEUE --queue-num 0");

    rules_installed = 1;
}

static void remove_iptables_rules()
{
    if (!rules_installed)
        return;

    system("iptables -D PREROUTING -t mangle ! -i lo -j NFQUEUE --queue-num 0");
    system("iptables -D OUTPUT -t mangle ! -o lo -j NFQUEUE --queue-num 0");

    rules_installed = 0;
}

static void cleanup()
{
    lfw_log_info("removing iptables rules...");
    remove_iptables_rules();
}

static void signal_handler(int sig)
{
    (void)sig;
    exit(0);  // triggers atexit cleanup
}

int main(int argc, char **argv)
{
    // Root privilege check
    if (geteuid() != 0) {
        fprintf(stderr, "[lfw] run as root\n");
        return 1;
    }

    lfw_log_init(LFW_LOG_SYSLOG);

    signal(SIGINT, signal_handler);
    signal(SIGTERM, signal_handler);

    atexit(cleanup);

    const char *config_path = "/etc/lfw/lfw.rules";

    if (argc > 1)
        config_path = argv[1];

    lfw_rule_t *rules = NULL;
    lfw_u32 rule_count = 0;
    lfw_action_t default_action = LFW_ACTION_DROP;

    lfw_status_t st = lfw_config_load_file(
        config_path,
        &default_action,
        &rules,
        &rule_count
    );

    if (st != LFW_OK) {
        lfw_log_error("failed to load config: %s", config_path);
        lfw_log_close();
        return 1;
    }

    lfw_state_t *state = lfw_state_create();
    if (!state) {
        lfw_log_error("failed to create state table");
        free(rules);
        lfw_log_close();
        return 1;
    }

    lfw_engine_t engine = {
        .config = {
            .default_action = default_action
        },
        .ruleset = {
            .rules = rules,
            .rule_count = rule_count
        },
        .connection_state = state
    };

    if (pthread_rwlock_init(&engine.rules_lock, NULL) != 0) {
        lfw_log_error("failed to initialize engine rwlock");
        lfw_state_destroy(state);
        free(rules);
        lfw_log_close();
        return 1;
    }

    strncpy(engine.config_path, config_path, sizeof(engine.config_path) - 1);

    lfw_log_info("inserting iptables rules...");
    add_iptables_rules();

    lfw_log_info("daemon starting");
    lfw_log_info("config: %s, rules: %u, default: %s",
            config_path,
            rule_count,
            default_action == LFW_ACTION_ACCEPT ? "ACCEPT" : "DROP");

    st = lfw_nfqueue_run(&engine, 0);

    pthread_rwlock_destroy(&engine.rules_lock);
    lfw_state_destroy(state);
    lfw_config_free_rules(rules);

    if (st != LFW_OK) {
        lfw_log_close();
        return 1;
    }

    lfw_log_info("shutdown complete");
    lfw_log_close();

    return 0;
}

