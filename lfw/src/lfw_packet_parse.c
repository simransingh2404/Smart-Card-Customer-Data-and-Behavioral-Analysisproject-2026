// SPDX-License-Identifier: GPL-3.0-only

#include "lfw_packet_parse.h"

#define IPV4_MIN_HEADER_LEN 20
#define IPV6_MIN_HEADER_LEN 40

lfw_status_t lfw_parse_packet(const uint8_t *data,
                              size_t len,
                              lfw_direction_t direction,
                              lfw_packet_t *out_packet)
{
    if (!data || !out_packet)
        return LFW_ERR_INVALID;

    if (len < 1)
        return LFW_ERR_INVALID;

    uint8_t version = data[0] >> 4;
    memset(out_packet, 0, sizeof(*out_packet));
    out_packet->direction = direction;
    out_packet->length = (lfw_u32)len;

    if (version == 4) {
        if (len < IPV4_MIN_HEADER_LEN)
            return LFW_ERR_INVALID;

        uint8_t ihl = data[0] & 0x0F;
        size_t ip_header_len = ihl * 4;

        if (ip_header_len < IPV4_MIN_HEADER_LEN || ip_header_len > len)
            return LFW_ERR_INVALID;

        out_packet->is_v6 = false;
        out_packet->ip.src.ip_version = 4;
        memcpy(&out_packet->ip.src.v4.addr, &data[12], 4);
        out_packet->ip.dst.ip_version = 4;
        memcpy(&out_packet->ip.dst.v4.addr, &data[16], 4);

        uint8_t proto = data[9];
        out_packet->protocol = (lfw_proto_t)proto;

        if (out_packet->protocol == LFW_PROTO_TCP || out_packet->protocol == LFW_PROTO_UDP) {
            if (len < ip_header_len + 4)
                return LFW_ERR_INVALID;

            out_packet->l4.src_port.port = htons(((lfw_u16)data[ip_header_len] << 8) |
                                                 ((lfw_u16)data[ip_header_len + 1]));
            out_packet->l4.dst_port.port = htons(((lfw_u16)data[ip_header_len + 2] << 8) |
                                                 ((lfw_u16)data[ip_header_len + 3]));

            if (out_packet->protocol == LFW_PROTO_TCP) {
                if (len < ip_header_len + 14)
                    return LFW_ERR_INVALID;

                uint8_t tcp_flags = data[ip_header_len + 13];
                out_packet->tcp_flags = tcp_flags;
                bool syn = (tcp_flags & 0x02) != 0;
                bool ack = (tcp_flags & 0x10) != 0;
                out_packet->is_new_connection = syn && !ack;
            } else {
                out_packet->is_new_connection = true;
            }
        } else {
            out_packet->is_new_connection = false;
        }
    } else if (version == 6) {
        if (len < IPV6_MIN_HEADER_LEN)
            return LFW_ERR_INVALID;

        out_packet->is_v6 = true;
        out_packet->ip.src.ip_version = 6;
        memcpy(out_packet->ip.src.v6.addr, &data[8], 16);
        out_packet->ip.dst.ip_version = 6;
        memcpy(out_packet->ip.dst.v6.addr, &data[24], 16);

        uint8_t proto = data[6];
        size_t ip_header_len = IPV6_MIN_HEADER_LEN;

        // Skip IPv6 Extension Headers
        for (int i = 0; i < 6; i++) {
            if (proto == 0 || proto == 43 || proto == 60) {
                // Hop-by-Hop, Routing, Destination Options
                if (len < ip_header_len + 2)
                    return LFW_ERR_INVALID;
                size_t ext_len = (data[ip_header_len + 1] + 1) * 8;
                if (len < ip_header_len + ext_len)
                    return LFW_ERR_INVALID;
                proto = data[ip_header_len];
                ip_header_len += ext_len;
            } else if (proto == 44) {
                // Fragment Header (8 bytes)
                if (len < ip_header_len + 8)
                    return LFW_ERR_INVALID;
                proto = data[ip_header_len];
                ip_header_len += 8;
            } else if (proto == 51) {
                // Authentication Header (AH)
                if (len < ip_header_len + 2)
                    return LFW_ERR_INVALID;
                size_t ext_len = (data[ip_header_len + 1] + 2) * 4;
                if (len < ip_header_len + ext_len)
                    return LFW_ERR_INVALID;
                proto = data[ip_header_len];
                ip_header_len += ext_len;
            } else {
                break;
            }
        }

        out_packet->protocol = (lfw_proto_t)proto;

        if (out_packet->protocol == LFW_PROTO_TCP || out_packet->protocol == LFW_PROTO_UDP) {
            if (len < ip_header_len + 4)
                return LFW_ERR_INVALID;

            out_packet->l4.src_port.port = htons(((lfw_u16)data[ip_header_len] << 8) |
                                                 ((lfw_u16)data[ip_header_len + 1]));
            out_packet->l4.dst_port.port = htons(((lfw_u16)data[ip_header_len + 2] << 8) |
                                                 ((lfw_u16)data[ip_header_len + 3]));

            if (out_packet->protocol == LFW_PROTO_TCP) {
                if (len < ip_header_len + 14)
                    return LFW_ERR_INVALID;

                uint8_t tcp_flags = data[ip_header_len + 13];
                out_packet->tcp_flags = tcp_flags;
                bool syn = (tcp_flags & 0x02) != 0;
                bool ack = (tcp_flags & 0x10) != 0;
                out_packet->is_new_connection = syn && !ack;
            } else {
                out_packet->is_new_connection = true;
            }
        } else {
            out_packet->is_new_connection = false;
        }
    } else {
        return LFW_ERR_INVALID;
    }

    return LFW_OK;
}
