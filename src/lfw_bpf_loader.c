#include "lfw_bpf.h"
#include "lfw_log.h"
#include <bpf/libbpf.h>
#include <bpf/bpf.h>
#include <net/if.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>

static struct bpf_object *g_bpf_obj = NULL;
static int g_ifindex = 0;
static struct bpf_tc_hook g_hook_ingress = {};
static struct bpf_tc_hook g_hook_egress = {};
static struct bpf_tc_opts g_opts_ingress = {};
static struct bpf_tc_opts g_opts_egress = {};
static bool g_ingress_attached = false;
static bool g_egress_attached = false;
static bool g_qdisc_created = false;

static int g_conntrack_map_fd = -1;
static int g_rules_map_fd = -1;
static int g_config_map_fd = -1;

int lfw_bpf_get_conntrack_map_fd(void) { return g_conntrack_map_fd; }
int lfw_bpf_get_rules_map_fd(void) { return g_rules_map_fd; }
int lfw_bpf_get_config_map_fd(void) { return g_config_map_fd; }

lfw_status_t lfw_bpf_init(const char *ifname, const char *bpf_obj_path)
{
    g_ifindex = if_nametoindex(ifname);
    if (g_ifindex == 0) {
        lfw_log_error("Invalid network interface: %s", ifname);
        return LFW_ERR_INVALID;
    }

    g_bpf_obj = bpf_object__open_file(bpf_obj_path, NULL);
    if (!g_bpf_obj) {
        lfw_log_error("Failed to open BPF object file: %s", bpf_obj_path);
        return LFW_ERR_GENERIC;
    }

    if (bpf_object__load(g_bpf_obj) != 0) {
        lfw_log_error("Failed to load BPF object file");
        bpf_object__close(g_bpf_obj);
        g_bpf_obj = NULL;
        return LFW_ERR_GENERIC;
    }

    struct bpf_program *prog = bpf_object__find_program_by_name(g_bpf_obj, "lfw_tc_filter");
    if (!prog) {
        lfw_log_error("Failed to find BPF program 'lfw_tc_filter'");
        lfw_bpf_cleanup();
        return LFW_ERR_GENERIC;
    }

    int prog_fd = bpf_program__fd(prog);
    if (prog_fd < 0) {
        lfw_log_error("Invalid BPF program descriptor");
        lfw_bpf_cleanup();
        return LFW_ERR_GENERIC;
    }

    g_conntrack_map_fd = bpf_object__find_map_fd_by_name(g_bpf_obj, "conntrack_map");
    g_rules_map_fd = bpf_object__find_map_fd_by_name(g_bpf_obj, "rules_map");
    g_config_map_fd = bpf_object__find_map_fd_by_name(g_bpf_obj, "config_map");

    if (g_conntrack_map_fd < 0 || g_rules_map_fd < 0 || g_config_map_fd < 0) {
        lfw_log_error("Failed to find required BPF maps");
        lfw_bpf_cleanup();
        return LFW_ERR_GENERIC;
    }

    // Set up hook for ingress
    g_hook_ingress.sz = sizeof(struct bpf_tc_hook);
    g_hook_ingress.ifindex = g_ifindex;
    g_hook_ingress.attach_point = BPF_TC_INGRESS;

    // Destroy any stale qdisc/filters from previous crashed runs to ensure a clean slate
    char cmd[256];
    snprintf(cmd, sizeof(cmd), "tc qdisc del dev %s clsact >/dev/null 2>&1", ifname);
    system(cmd);

    // Create clsact qdisc (this will create it for both ingress/egress hooks)
    int err = bpf_tc_hook_create(&g_hook_ingress);
    if (err && err != -EEXIST) {
        lfw_log_error("Failed to create clsact qdisc: %s", strerror(-err));
        lfw_bpf_cleanup();
        return LFW_ERR_GENERIC;
    }
    g_qdisc_created = true;

    // Attach to ingress
    g_opts_ingress.sz = sizeof(struct bpf_tc_opts);
    g_opts_ingress.prog_fd = prog_fd;
    g_opts_ingress.flags = BPF_TC_F_REPLACE;

    err = bpf_tc_attach(&g_hook_ingress, &g_opts_ingress);
    if (err) {
        lfw_log_error("Failed to attach BPF program to ingress: %s", strerror(-err));
        lfw_bpf_cleanup();
        return LFW_ERR_GENERIC;
    }
    g_ingress_attached = true;

    // Set up hook and attach for egress
    g_hook_egress.sz = sizeof(struct bpf_tc_hook);
    g_hook_egress.ifindex = g_ifindex;
    g_hook_egress.attach_point = BPF_TC_EGRESS;

    g_opts_egress.sz = sizeof(struct bpf_tc_opts);
    g_opts_egress.prog_fd = prog_fd;
    g_opts_egress.flags = BPF_TC_F_REPLACE;

    err = bpf_tc_attach(&g_hook_egress, &g_opts_egress);
    if (err) {
        lfw_log_error("Failed to attach BPF program to egress: %s", strerror(-err));
        lfw_bpf_cleanup();
        return LFW_ERR_GENERIC;
    }
    g_egress_attached = true;

    lfw_log_info("Successfully attached eBPF/TC program to %s (ingress & egress)", ifname);
    return LFW_OK;
}

void lfw_bpf_cleanup(void)
{
    if (g_ingress_attached) {
        g_opts_ingress.flags = 0;
        g_opts_ingress.prog_fd = 0;
        g_opts_ingress.prog_id = 0;
        int err = bpf_tc_detach(&g_hook_ingress, &g_opts_ingress);
        if (err) {
            lfw_log_error("Failed to detach ingress BPF program: %s", strerror(-err));
        }
        g_ingress_attached = false;
    }
    if (g_egress_attached) {
        g_opts_egress.flags = 0;
        g_opts_egress.prog_fd = 0;
        g_opts_egress.prog_id = 0;
        int err = bpf_tc_detach(&g_hook_egress, &g_opts_egress);
        if (err) {
            lfw_log_error("Failed to detach egress BPF program: %s", strerror(-err));
        }
        g_egress_attached = false;
    }
    if (g_qdisc_created) {
        int err = bpf_tc_hook_destroy(&g_hook_ingress);
        if (err) {
            lfw_log_error("Failed to destroy clsact qdisc: %s", strerror(-err));
        }
        g_qdisc_created = false;
    }
    if (g_bpf_obj) {
        bpf_object__close(g_bpf_obj);
        g_bpf_obj = NULL;
    }
    g_conntrack_map_fd = -1;
    g_rules_map_fd = -1;
    g_config_map_fd = -1;
}
