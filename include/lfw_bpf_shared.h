#ifndef LFW_BPF_SHARED_H
#define LFW_BPF_SHARED_H

#include <linux/types.h>

// 5-tuple for connection tracking key
struct conntrack_key {
    __be32 src_ip;
    __be32 dst_ip;
    __be16 src_port;
    __be16 dst_port;
    __u8   proto;
    __u8   pad[3]; // Align to 4 bytes boundary
};

// Value stored in conntrack map
struct conntrack_val {
    __u64 last_seen;
    __u64 bytes;
    __u64 packets;
    __u32 action;  // LFW_ACTION_ACCEPT (1) or LFW_ACTION_DROP (2)
    __u32 pad;     // Keep 8-byte alignment
};

// Rule structure for BPF rules map
struct bpf_rule {
    __be32 src_ip;
    __be32 src_mask;
    __be32 dst_ip;
    __be32 dst_mask;
    __be16 src_port;
    __be16 dst_port;
    __u8   match_src_ip;
    __u8   match_dst_ip;
    __u8   protocol;
    __u8   match_src_port;
    __u8   match_dst_port;
    __u8   action;
    __u8   pad[3];
    __u64  hit_count;
    __u64  byte_count;
};

#endif
