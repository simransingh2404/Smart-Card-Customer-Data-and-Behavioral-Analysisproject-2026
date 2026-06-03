#include "lfw_bpf.h"
#include "lfw_bpf_shared.h"
#include "lfw_log.h"
#include <bpf/bpf.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>

lfw_status_t lfw_bpf_sync_rules(const lfw_rule_t *rules, lfw_u32 rule_count, lfw_action_t default_action)
{
    int rules_fd = lfw_bpf_get_rules_map_fd();
    int config_fd = lfw_bpf_get_config_map_fd();

    if (rules_fd < 0 || config_fd < 0) {
        lfw_log_error("BPF maps not initialized");
        return LFW_ERR_GENERIC;
    }

    // 1. Update config map
    __u32 idx_def = 0;
    __u32 val_def = (default_action == LFW_ACTION_ACCEPT) ? 1 : 2;
    if (bpf_map_update_elem(config_fd, &idx_def, &val_def, BPF_ANY) != 0) {
        lfw_log_error("Failed to update config default action: %s", strerror(errno));
        return LFW_ERR_GENERIC;
    }

    __u32 idx_cnt = 1;
    __u32 val_cnt = rule_count > 256 ? 256 : rule_count;
    if (bpf_map_update_elem(config_fd, &idx_cnt, &val_cnt, BPF_ANY) != 0) {
        lfw_log_error("Failed to update config rule count: %s", strerror(errno));
        return LFW_ERR_GENERIC;
    }

    // 2. Update rules map
    for (__u32 i = 0; i < val_cnt; i++) {
        const lfw_rule_t *rule = &rules[i];
        struct bpf_rule b_rule = {};

        b_rule.src_ip = rule->match.src_ip.addr;
        b_rule.src_mask = rule->match.src_mask.addr;
        b_rule.dst_ip = rule->match.dst_ip.addr;
        b_rule.dst_mask = rule->match.dst_mask.addr;
        b_rule.src_port = rule->match.src_port.port;
        b_rule.dst_port = rule->match.dst_port.port;

        b_rule.match_src_ip = rule->match.match_src_ip ? 1 : 0;
        b_rule.match_dst_ip = rule->match.match_dst_ip ? 1 : 0;
        b_rule.protocol = (rule->match.protocol == LFW_PROTO_TCP) ? 1 :
                          (rule->match.protocol == LFW_PROTO_UDP) ? 2 :
                          (rule->match.protocol == LFW_PROTO_ICMP) ? 3 : 0;
        b_rule.match_src_port = rule->match.match_src_port ? 1 : 0;
        b_rule.match_dst_port = rule->match.match_dst_port ? 1 : 0;
        b_rule.action = (rule->action == LFW_ACTION_ACCEPT) ? 1 : 2;

        // hit_count and byte_count start at 0 (or we preserve them if doing a reload)
        // Wait, on SIGHUP config reload, lfw reloads rules from file. It's fine to reset counts.
        b_rule.hit_count = 0;
        b_rule.byte_count = 0;

        if (bpf_map_update_elem(rules_fd, &i, &b_rule, BPF_ANY) != 0) {
            lfw_log_error("Failed to write BPF rule #%u: %s", i + 1, strerror(errno));
            return LFW_ERR_GENERIC;
        }
    }

    return LFW_OK;
}

static void format_rule(const struct bpf_rule *rule, char *buf, size_t buf_len)
{
    int offset = 0;
    offset += snprintf(buf + offset, buf_len - offset, "%s",
                       rule->action == 1 ? "allow" : "deny");

    const char *proto = "any";
    if (rule->protocol == 1) proto = "tcp";
    else if (rule->protocol == 2) proto = "udp";
    else if (rule->protocol == 3) proto = "icmp";

    if (rule->protocol != 0) {
        offset += snprintf(buf + offset, buf_len - offset, " %s", proto);
    }

    if (rule->match_dst_port) {
        offset += snprintf(buf + offset, buf_len - offset, " %u", ntohs(rule->dst_port));
    }

    if (rule->match_src_ip) {
        char ip_str[32];
        struct in_addr in;
        in.s_addr = rule->src_ip;
        inet_ntop(AF_INET, &in, ip_str, sizeof(ip_str));

        lfw_u32 mask = ntohl(rule->src_mask);
        int prefix = 0;
        for (int b = 31; b >= 0; b--) {
            if ((mask >> b) & 1) prefix++;
            else break;
        }

        if (prefix == 32) {
            offset += snprintf(buf + offset, buf_len - offset, " from %s", ip_str);
        } else {
            offset += snprintf(buf + offset, buf_len - offset, " from %s/%d", ip_str, prefix);
        }
    } else {
        offset += snprintf(buf + offset, buf_len - offset, " from any");
    }

    if (rule->match_dst_ip) {
        char ip_str[32];
        struct in_addr in;
        in.s_addr = rule->dst_ip;
        inet_ntop(AF_INET, &in, ip_str, sizeof(ip_str));

        lfw_u32 mask = ntohl(rule->dst_mask);
        int prefix = 0;
        for (int b = 31; b >= 0; b--) {
            if ((mask >> b) & 1) prefix++;
            else break;
        }

        if (prefix == 32) {
            offset += snprintf(buf + offset, buf_len - offset, " to %s", ip_str);
        } else {
            offset += snprintf(buf + offset, buf_len - offset, " to %s/%d", ip_str, prefix);
        }
    } else {
        offset += snprintf(buf + offset, buf_len - offset, " to any");
    }
}

void lfw_bpf_dump_stats(const lfw_rule_t *orig_rules, lfw_u32 orig_rule_count, lfw_action_t default_action)
{
    (void)orig_rules; // We read hits/bytes live from BPF rules_map

    int conntrack_fd = lfw_bpf_get_conntrack_map_fd();
    int rules_fd = lfw_bpf_get_rules_map_fd();
    int config_fd = lfw_bpf_get_config_map_fd();

    if (conntrack_fd < 0 || rules_fd < 0 || config_fd < 0) {
        lfw_log_error("BPF maps not initialized for stats dump");
        return;
    }

    // 1. Count active conntrack connections
    lfw_u32 conn_count = 0;
    struct conntrack_key key = {}, next_key = {};
    
    // We pass NULL to get the first key
    while (bpf_map_get_next_key(conntrack_fd, &key, &next_key) == 0) {
        conn_count++;
        key = next_key;
    }

    // 2. Read actual rule count
    __u32 idx_cnt = 1;
    __u32 rule_count = 0;
    if (bpf_map_lookup_elem(config_fd, &idx_cnt, &rule_count) != 0) {
        rule_count = orig_rule_count;
    }

    lfw_log_info("=== eBPF/TC Firewall Statistics ===");
    lfw_log_info("Active Connections Table Count: %u", conn_count);
    lfw_log_info("Default Policy Verdict: %s",
                 default_action == LFW_ACTION_ACCEPT ? "ACCEPT" : "DROP");
    lfw_log_info("Installed Rules Count: %u", rule_count);

    // 3. Print rules with hits/bytes
    for (__u32 i = 0; i < rule_count && i < 256; i++) {
        struct bpf_rule b_rule = {};
        if (bpf_map_lookup_elem(rules_fd, &i, &b_rule) == 0) {
            char rule_str[256];
            format_rule(&b_rule, rule_str, sizeof(rule_str));
            lfw_log_info("  Rule #%u [%s]: hits=%lu, bytes=%lu",
                         i + 1, rule_str, (unsigned long)b_rule.hit_count, (unsigned long)b_rule.byte_count);
        }
    }

    lfw_log_info("===========================");
}
