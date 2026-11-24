# Docs

Setup and code conventions are in the [repo README](../README.md). This folder
holds the plans and reference material behind the code. Code comments cite
these files by name (e.g. "see SIDE-ACCOUNTS-PLAN.md"); they live here.

## plans/ — what we're doing

| File | What it is |
|---|---|
| [PRE-DAKOTA-PLAN.md](plans/PRE-DAKOTA-PLAN.md) | **Start here.** Ordered work that doesn't wait on Dakota's sandbox, decisions D9–D19, progress log |
| [LAUNCH-READINESS-PLAN.md](plans/LAUNCH-READINESS-PLAN.md) | Master tick-list from demo to the first real customer; licensing decisions (§1b) and wording rules (§1c) |
| [SIDE-ACCOUNTS-PLAN.md](plans/SIDE-ACCOUNTS-PLAN.md) | Main + side accounts, each with its own wallet and card (Phase 1 done, Phase 2 needs the sandbox) |
| [NATIVE-APP-PLAN.md](plans/NATIVE-APP-PLAN.md) | Native app for one-tap Apple Pay / Google Pay |
| [ROADMAP.md](plans/ROADMAP.md) | Milestone view M0–M5 (July; the two plans above are current) |
| [BACKLOG.md](plans/BACKLOG.md) | Ideas, deferred work and known gaps |

## reference/ — how things work

| File | What it is |
|---|---|
| [DAKOTA-PLAN.md](reference/DAKOTA-PLAN.md) | Dakota integration: architecture, exact API sequences, webhook handling, gotchas |
| [DAKOTA-CARDS-SPEC.md](reference/DAKOTA-CARDS-SPEC.md) | Dakota Cards API and how Moneta uses it (cards are sandbox-only at Dakota) |
| [ORG-FOUNDATION-SPEC.md](reference/ORG-FOUNDATION-SPEC.md) | Orgs, roles and row-level security design |

## ops/ — running it

| File | What it is |
|---|---|
| [DR-RUNBOOK.md](ops/DR-RUNBOOK.md) | Backups and restore, secret rotation, losing the signer key |

Compliance policy drafts (F1–F9) are in [`compliance/`](../compliance/README.md).

## security/

| File | What it is |
|---|---|
| [SECURITY-REVIEW-PLAN.md](security/SECURITY-REVIEW-PLAN.md) | Adversarial review plan for the org/row-level-security work |
| [TEAM-ACCESS-SECURITY-REVIEW.md](security/TEAM-ACCESS-SECURITY-REVIEW.md) | Team invite and access review; Stage 0 shipped, Stages 1–2 open |

How to report a vulnerability: [SECURITY.md](../SECURITY.md).

## research/

| File | What it is |
|---|---|
| [NEOBANK-INDUSTRY-GUIDE-2026.md](research/NEOBANK-INDUSTRY-GUIDE-2026.md) | Industry analysis: revenue models, trust, features (its FDIC advice predates the USDC model) |
| [RESEARCH-REVOLUT.md](research/RESEARCH-REVOLUT.md) | Revolut breakdown |
| [INSTITUTIONAL-STRATEGY.md](research/INSTITUTIONAL-STRATEGY.md) | Brief on a possible institutional treasury direction |

The licensing report is in [`reports/`](../reports/), with its source notes in
[`research_notes/`](../research_notes/).

## archive/

Finished or superseded plans, kept for history. They may describe screens or
code that no longer exist (the classic dashboard, Stripe Issuing, loans) and
can contradict current rules. Don't treat them as current.
