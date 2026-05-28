#include "lfw_nfqueue.h"
#include "lfw_packet_parse.h"
#include "lfw_log.h"

#include <arpa/inet.h>
#include <linux/netfilter.h>
#include <libnetfilter_queue/libnetfilter_queue.h>

#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>

// Global stop flag for graceful shutdown
static volatile sig_atomic_t g_running = 1;
static volatile sig_atomic_t g_reload_requested = 0;
static volatile sig_atomic_t g_dump_requested = 0;

// ------------------------------
// Signal handlers
// ------------------------------

static void handle_signal(int sig)
{
    (void)sig;
    g_running = 0;
}

static void handle_sighup(int sig)
{
    (void)sig;
    g_reload_requested = 1;
}

static void handle_sigusr1(int sig)
{
    (void)sig;
    g_dump_requested = 1;
}

// ------------------------------
// NFQUEUE callback
// ------------------------------

static int nfqueue_callback(struct nfq_q_handle *qh,
                             struct nfgenmsg *nfmsg,
                             struct nfq_data *nfa,
                             void *data)
{
    (void)nfmsg;

    lfw_engine_t *engine = (lfw_engine_t *)data;

    struct nfqnl_msg_packet_hdr *ph;
    unsigned char *payload = NULL;
    int payload_len;
    uint32_t packet_id = 0;

    lfw_packet_t packet;
    lfw_verdict_t verdict = LFW_VERDICT_DROP;

    ph = nfq_get_msg_packet_hdr(nfa);
    if (ph)
        packet_id = ntohl(ph->packet_id);

    payload_len = nfq_get_payload(nfa, &payload);
    if (payload_len < 0 || !payload)
        goto out;

    lfw_direction_t direction = LFW_DIR_UNKNOWN;

    if (ph) {
        switch (ph->hook) {
            case NF_INET_PRE_ROUTING:
            case NF_INET_LOCAL_IN:
                direction = LFW_DIR_INBOUND;
                break;

            case NF_INET_LOCAL_OUT:
                direction = LFW_DIR_OUTBOUND;
                break;

            default:
                direction = LFW_DIR_UNKNOWN;
                break;
        }
    }

    if (lfw_parse_ipv4_packet(payload,
                              (size_t)payload_len,
                              direction,
                              &packet) != LFW_OK)
        goto out;

    verdict = lfw_engine_evaluate(engine, &packet);

    lfw_log_packet(&packet, verdict);

out:
    return nfq_set_verdict(
        qh,
        packet_id,
        (verdict == LFW_VERDICT_ACCEPT) ? NF_ACCEPT : NF_DROP,
        0,
        NULL
    );
}

// ------------------------------
// Main NFQUEUE loop
// ------------------------------

lfw_status_t lfw_nfqueue_run(
    lfw_engine_t *engine,
    unsigned int queue_num)
{
    if (!engine)
        return LFW_ERR_INVALID;

    signal(SIGINT, handle_signal);
    signal(SIGTERM, handle_signal);
    signal(SIGHUP, handle_sighup);
    signal(SIGUSR1, handle_sigusr1);

    struct nfq_handle *h = nfq_open();
    if (!h)
        return LFW_ERR_GENERIC;

    if (nfq_unbind_pf(h, AF_INET) < 0 ||
        nfq_bind_pf(h, AF_INET) < 0)
    {
        nfq_close(h);
        return LFW_ERR_GENERIC;
    }

    struct nfq_q_handle *qh =
        nfq_create_queue(h,
                        queue_num,
                        &nfqueue_callback,
                        (void *)engine);

    if (!qh) {
        nfq_close(h);
        return LFW_ERR_GENERIC;
    }

    if (nfq_set_mode(qh,
                    NFQNL_COPY_PACKET,
                    0xffff) < 0)
    {
        nfq_destroy_queue(qh);
        nfq_close(h);
        return LFW_ERR_GENERIC;
    }

    int fd = nfq_fd(h);
    char buf[4096] __attribute__((aligned));

    while (g_running) {
        if (g_reload_requested) {
            g_reload_requested = 0;
            lfw_status_t reload_st = lfw_engine_reload_rules(engine);
            if (reload_st == LFW_OK) {
                lfw_log_info("Rules configuration reloaded successfully");
            } else {
                lfw_log_error("Failed to reload rules configuration");
            }
        }

        if (g_dump_requested) {
            g_dump_requested = 0;
            lfw_engine_dump_stats(engine);
        }

        int rv = recv(fd, buf, sizeof(buf), 0);

        if (rv > 0) {
            nfq_handle_packet(h, buf, rv);
        } else if (rv == 0) {
            lfw_log_error("nfqueue socket closed");
            break;
        } else {
            if (errno == EINTR) {
                continue;
            }
            if (g_running) {
                break;
            }
        }
    }

    nfq_destroy_queue(qh);
    nfq_close(h);

    return LFW_OK;
}
