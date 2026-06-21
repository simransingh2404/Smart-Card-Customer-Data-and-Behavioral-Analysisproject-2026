// SPDX-License-Identifier: GPL-3.0-only

#include "lfw_rules.h"
#include <arpa/inet.h>

// Match IPv4
static inline bool match_ip4(const lfw_ipv4_t *rule_ip,
                             const lfw_ipv4_t *rule_mask,
                             const lfw_ipv4_t *pkt_ip,
                             bool enabled)
{
    if (!enabled)
        return true;

    return (pkt_ip->addr & rule_mask->addr) == (rule_ip->addr & rule_mask->addr);
}

// Match IPv6
static inline bool match_ip6(const lfw_ipv6_t *rule_ip,
                             const lfw_ipv6_t *rule_mask,
                             const lfw_ipv6_t *pkt_ip,
                             bool enabled)
{
    if (!enabled)
        return true;

    for (int i = 0; i < 16; i++) {
        if ((pkt_ip->addr[i] & rule_mask->addr[i]) != (rule_ip->addr[i] & rule_mask->addr[i]))
            return false;
    }
    return true;
}

// Match IP (wrapper)
static inline bool match_ip(const lfw_ip_t *rule_ip,
                            const lfw_ip_t *rule_mask,
                            const lfw_ip_t *pkt_ip,
                            bool enabled)
{
    if (!enabled)
        return true;

    if (pkt_ip->ip_version == 4) {
        return match_ip4(&rule_ip->v4, &rule_mask->v4, &pkt_ip->v4, enabled);
    } else if (pkt_ip->ip_version == 6) {
        return match_ip6(&rule_ip->v6, &rule_mask->v6, &pkt_ip->v6, enabled);
    }
    return false;
}

// Match port
static inline bool match_port(const lfw_port_range_t *rule_port,
                            const lfw_port_t *pkt_port,
                            bool enabled)
{
    if (!enabled)
        return true;

    lfw_u16 port = ntohs(pkt_port->port);
    return port >= rule_port->min && port <= rule_port->max;
}

// Match protocol
static inline bool match_proto(lfw_proto_t rule_proto,
                                lfw_proto_t pkt_proto)
{
    if (rule_proto == LFW_PROTO_ANY)
        return true;

    return rule_proto == pkt_proto;
}

bool lfw_rule_match(const lfw_rule_t *rule,
                    const lfw_packet_t *packet)
{
    if (!rule || !packet)
        return false;

    // Check version compatibility first
    if (rule->match.ip_version != 0 && rule->match.ip_version != packet->ip.src.ip_version)
        return false;

    // Protocol check
    if (!match_proto(rule->match.protocol,
                    packet->protocol))
        return false;

    // IP match
    if (!match_ip(&rule->match.src_ip,
                &rule->match.src_mask,
                &packet->ip.src,
                rule->match.match_src_ip))
        return false;

    if (!match_ip(&rule->match.dst_ip,
                &rule->match.dst_mask,
                &packet->ip.dst,
                rule->match.match_dst_ip))
        return false;

    // Ports only relevant for TCP/UDP
    if (packet->protocol == LFW_PROTO_TCP ||
        packet->protocol == LFW_PROTO_UDP)
    {
        if (!match_port(&rule->match.src_port,
                        &packet->l4.src_port,
                        rule->match.match_src_port))
            return false;

        if (!match_port(&rule->match.dst_port,
                        &packet->l4.dst_port,
                        rule->match.match_dst_port))
            return false;
    }

    return true;
}
