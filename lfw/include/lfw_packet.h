// SPDX-License-Identifier: GPL-3.0-only

#ifndef LFW_PACKET_H
#define LFW_PACKET_H

#include <stdbool.h>
#include "lfw_types.h"

// IP header abstraction
typedef struct {
    lfw_ip_t src;
    lfw_ip_t dst;
} lfw_ip_hdr_t;

// Transport ports
typedef struct {
    lfw_port_t src_port;
    lfw_port_t dst_port;
} lfw_l4_ports_t;

// Normalized firewall packet
typedef struct {
    lfw_direction_t direction;
    lfw_proto_t     protocol;

    lfw_ip_hdr_t    ip;
    lfw_l4_ports_t  l4;

    bool is_new_connection;
    bool is_established;
    lfw_u8       tcp_flags;
    lfw_u32      length;
    bool         is_v6;
} lfw_packet_t;

#endif
