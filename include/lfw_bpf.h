#ifndef LFW_BPF_H
#define LFW_BPF_H

#include "lfw_types.h"
#include "lfw_rules.h"

// Initialize BPF subsystem, load program, and attach to interface TC hooks
lfw_status_t lfw_bpf_init(const char *ifname, const char *bpf_obj_path);

// Synchronize user-space rules to BPF maps
lfw_status_t lfw_bpf_sync_rules(const lfw_rule_t *rules, lfw_u32 rule_count, lfw_action_t default_action);

// Detach BPF filters and cleanup resources
void lfw_bpf_cleanup(void);

// Read statistics from BPF maps and dump to syslog
void lfw_bpf_dump_stats(const lfw_rule_t *orig_rules, lfw_u32 orig_rule_count, lfw_action_t default_action);

// Map file descriptor getters
int lfw_bpf_get_conntrack_map_fd(void);
int lfw_bpf_get_rules_map_fd(void);
int lfw_bpf_get_config_map_fd(void);

#endif
