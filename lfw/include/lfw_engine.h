// SPDX-License-Identifier: GPL-3.0-only

#ifndef LFW_ENGINE_H
#define LFW_ENGINE_H

#include "lfw_types.h"
#include "lfw_packet.h"
#include "lfw_rules.h"
#include <pthread.h>

struct lfw_state;

// Engine config
typedef struct {
    lfw_action_t default_action;
} lfw_engine_config_t;

// Ruleset
typedef struct {
    const lfw_rule_t *rules;
    lfw_u32           rule_count;
} lfw_ruleset_t;

// Engine context
typedef struct {
    lfw_engine_config_t config;
    lfw_ruleset_t       ruleset;
    struct lfw_state   *connection_state;
    pthread_rwlock_t    rules_lock;
    char                config_path[256];
} lfw_engine_t;

// Evaluate packet (thread-safe)
lfw_verdict_t lfw_engine_evaluate(
    lfw_engine_t *engine,
    lfw_packet_t *packet
);

// Reload rules dynamically from config_path (thread-safe)
lfw_status_t lfw_engine_reload_rules(lfw_engine_t *engine);

// Dump ruleset hit statistics via syslog (thread-safe)
void lfw_engine_dump_stats(const lfw_engine_t *engine);

#endif
