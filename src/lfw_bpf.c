#define __KERNEL__
#include <linux/bpf.h>
#include <linux/pkt_cls.h>
#include <linux/if_ether.h>
#include <linux/ip.h>
#include <linux/in.h>
#include <linux/tcp.h>
#include <linux/udp.h>
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>

#include "lfw_bpf_shared.h"

// Connection tracking timeouts in nanoseconds
#define TCP_TIMEOUT_NS (300ULL * 1000000000ULL)
#define UDP_TIMEOUT_NS (60ULL * 1000000000ULL)

struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 4096);
    __type(key, struct conntrack_key);
    __type(value, struct conntrack_val);
} conntrack_map SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(max_entries, 256);
    __type(key, __u32);
    __type(value, struct bpf_rule);
} rules_map SEC(".maps");

struct {
    __uint(type, BPF_MAP_TYPE_ARRAY);
    __uint(max_entries, 2);
    __type(key, __u32);
    __type(value, __u32);
} config_map SEC(".maps");

SEC("tc")
int lfw_tc_filter(struct __sk_buff *skb)
{
    void *data_end = (void *)(long)skb->data_end;
    void *data     = (void *)(long)skb->data;

    // Parse ethernet header
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return TC_ACT_OK;

    if (bpf_ntohs(eth->h_proto) != ETH_P_IP)
        return TC_ACT_OK; // Only process IPv4

    // Parse IP header
    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end)
        return TC_ACT_OK;

    // Check minimum IPv4 header length
    __u32 ip_hdr_len = ip->ihl * 4;
    if ((void *)((__u8 *)ip + ip_hdr_len) > data_end)
        return TC_ACT_OK;

    __u8 proto = ip->protocol;
    __be32 src_ip = ip->saddr;
    __be32 dst_ip = ip->daddr;

    __be16 src_port = 0;
    __be16 dst_port = 0;
    __u8 lfw_proto = 0; // matching lfw_proto_t enum values (0: ANY, 1: TCP, 2: UDP, 3: ICMP)

    if (proto == IPPROTO_TCP) {
        lfw_proto = 1;
        struct tcphdr *tcp = (void *)((__u8 *)ip + ip_hdr_len);
        if ((void *)(tcp + 1) > data_end)
            return TC_ACT_OK;
        src_port = tcp->source;
        dst_port = tcp->dest;
    } else if (proto == IPPROTO_UDP) {
        lfw_proto = 2;
        struct udphdr *udp = (void *)((__u8 *)ip + ip_hdr_len);
        if ((void *)(udp + 1) > data_end)
            return TC_ACT_OK;
        src_port = udp->source;
        dst_port = udp->dest;
    } else if (proto == IPPROTO_ICMP) {
        lfw_proto = 3;
    }

    // Prepare conntrack key
    struct conntrack_key key = {};
    if (src_ip < dst_ip || (src_ip == dst_ip && src_port <= dst_port)) {
        key.src_ip   = src_ip;
        key.dst_ip   = dst_ip;
        key.src_port = src_port;
        key.dst_port = dst_port;
    } else {
        key.src_ip   = dst_ip;
        key.dst_ip   = src_ip;
        key.src_port = dst_port;
        key.dst_port = src_port;
    }
    key.proto = lfw_proto;

    __u64 now = bpf_ktime_get_ns();
    __u64 pkt_len = skb->len;

    // Conntrack check (only for TCP/UDP)
    if (lfw_proto == 1 || lfw_proto == 2) {
        struct conntrack_val *val = bpf_map_lookup_elem(&conntrack_map, &key);
        if (val) {
            __u64 timeout = (lfw_proto == 1) ? TCP_TIMEOUT_NS : UDP_TIMEOUT_NS;
            if (now - val->last_seen <= timeout) {
                // Connection is established/active
                val->last_seen = now;
                val->bytes    += pkt_len;
                val->packets  += 1;
                __u32 act = val->action;
                if (act == 1) // LFW_ACTION_ACCEPT
                    return TC_ACT_OK;
                else
                    return TC_ACT_SHOT;
            }
        }
    }

    // Rules evaluation
    __u32 config_idx_cnt = 1;
    __u32 *p_rule_count = bpf_map_lookup_elem(&config_map, &config_idx_cnt);
    __u32 rule_count = p_rule_count ? *p_rule_count : 0;

    __u8 decision_action = 0; // 0: undecided, 1: accept, 2: drop
    struct bpf_rule *matched_rule = NULL;

    #pragma clang loop unroll(disable)
    for (__u32 i = 0; i < 256; i++) {
        if (i >= rule_count)
            break;

        __u32 rule_idx = i;
        struct bpf_rule *rule = bpf_map_lookup_elem(&rules_map, &rule_idx);
        if (!rule)
            break;

        // Protocol check
        if (rule->protocol != 0 && rule->protocol != lfw_proto)
            continue;

        // Source IP check
        if (rule->match_src_ip) {
            if ((src_ip & rule->src_mask) != (rule->src_ip & rule->src_mask))
                continue;
        }

        // Destination IP check
        if (rule->match_dst_ip) {
            if ((dst_ip & rule->dst_mask) != (rule->dst_ip & rule->dst_mask))
                continue;
        }

        // Ports check (only relevant for TCP/UDP)
        if (lfw_proto == 1 || lfw_proto == 2) {
            if (rule->match_src_port && rule->src_port != src_port)
                continue;
            if (rule->match_dst_port && rule->dst_port != dst_port)
                continue;
        }

        // Match found
        decision_action = rule->action;
        matched_rule = rule;
        break;
    }

    // Fallback to default action
    if (decision_action == 0) {
        __u32 config_idx_def = 0;
        __u32 *p_default_action = bpf_map_lookup_elem(&config_map, &config_idx_def);
        decision_action = p_default_action ? (__u8)*p_default_action : 2; // Default to drop (2)
    }

    // Update rule hit/byte metrics
    if (matched_rule) {
        __sync_fetch_and_add(&matched_rule->hit_count, 1);
        __sync_fetch_and_add(&matched_rule->byte_count, pkt_len);
    }

    // Add to conntrack if accepted and protocol is TCP/UDP
    if (decision_action == 1 && (lfw_proto == 1 || lfw_proto == 2)) {
        struct conntrack_val new_val = {
            .last_seen = now,
            .bytes     = pkt_len,
            .packets   = 1,
            .action    = 1,
        };
        bpf_map_update_elem(&conntrack_map, &key, &new_val, BPF_ANY);
    }

    if (decision_action == 1)
        return TC_ACT_OK;
    else
        return TC_ACT_SHOT;
}

char _license[] SEC("license") = "GPL";
