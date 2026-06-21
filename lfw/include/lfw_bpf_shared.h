// SPDX-License-Identifier: GPL-3.0-only

#ifndef LFW_BPF_SHARED_H
#define LFW_BPF_SHARED_H

#include <linux/types.h>
#include <linux/in6.h>

// 5-tuple for connection tracking key (IPv4)
struct conntrack_key {
    __be32 src_ip;
    __be32 dst_ip;
    __be16 src_port;
    __be16 dst_port;
    __u8   proto;
    __u8   pad[3]; // Align to 4 bytes boundary
};

// 5-tuple for connection tracking key (IPv6)
struct conntrack_key_v6 {
    struct in6_addr src_ip;
    struct in6_addr dst_ip;
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
    __u8  state;   // TCP connection state
    __u8  pad2[3]; // Keep 8-byte alignment
};

#define LFW_TCP_STATE_NONE 0
#define LFW_TCP_STATE_SYN_SENT 1
#define LFW_TCP_STATE_SYN_RECV 2
#define LFW_TCP_STATE_ESTABLISHED 3
#define LFW_TCP_STATE_FIN_WAIT 4
#define LFW_TCP_STATE_CLOSED 5


// Rule structure for BPF rules map
struct bpf_rule {
    union {
        struct {
            __be32 ip;
            __be32 mask;
        } v4;
        struct {
            struct in6_addr ip;
            struct in6_addr mask;
        } v6;
    } src;
    union {
        struct {
            __be32 ip;
            __be32 mask;
        } v4;
        struct {
            struct in6_addr ip;
            struct in6_addr mask;
        } v6;
    } dst;
    __u16  src_port_min; // Host byte order for range comparison
    __u16  src_port_max; // Host byte order for range comparison
    __u16  dst_port_min; // Host byte order for range comparison
    __u16  dst_port_max; // Host byte order for range comparison
    __u8   match_src_ip;
    __u8   match_dst_ip;
    __u8   protocol;
    __u8   match_src_port;
    __u8   match_dst_port;
    __u8   action;
    __u8   ip_version; // 0: any, 4: IPv4, 6: IPv6
    __u8   pad;
    __u64  hit_count;
    __u64  byte_count;
};

// LPM Key for BPF LPM Trie map (IPv4)
struct lpm_key {
    __u32 prefixlen;
    __be32 ip;
};

// LPM Key for BPF LPM Trie map (IPv6)
struct lpm6_key {
    __u32 prefixlen;
    struct in6_addr ip;
};

// Rule mask supporting up to 256 rules
struct rule_mask {
    __u64 bits[4];
};

// Telemetry event for Ring Buffer
struct lfw_event {
    union {
        __be32          v4;
        struct in6_addr v6;
    } src_ip;
    union {
        __be32          v4;
        struct in6_addr v6;
    } dst_ip;
    __be16 src_port;
    __be16 dst_port;
    __u8   proto;
    __u8   action; // 1: ALLOW, 2: DROP
    __u8   ip_version; // 4: IPv4, 6: IPv6
    __u8   pad;
    __u64  pkt_len;
    __u64  timestamp;
};

#endif
