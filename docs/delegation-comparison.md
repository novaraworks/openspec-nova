# Delegation Cost: Measured Effect of Step 0

The fork's delegation Step 0 nudges the LLM to consider spawning subagents and/or switching to a cheaper model before starting work. This page records a small empirical measurement of what that nudge buys.

## Setup

A single representative `/opsx:apply`-style exploration task, prompted three different ways:

> Trace the full propagation path of `STEP_0` from its declaration in `_nova-step0.ts` through the template wrappers, barrel re-export, `skill-templates.ts`, `update.ts`, the command generator, and the Claude adapter to the final on-disk slash command file.

The task requires reading several TypeScript files across `src/core/templates/` and `src/core/command-generation/` and reasoning about a multi-hop chain — exactly the shape of work `/opsx:apply` does on real changes.

Three execution paths:

1. **Main thread (Opus 4.7) does it itself.** Projected from the observed file/content token counts; not actually run, since doing so would pollute the measurement session.
2. **Delegated to an `Explore` subagent on Haiku 4.5.**
3. **Delegated to an `Explore` subagent on Sonnet 4.x.**

Token counts come from the Claude Code session JSONL transcripts at:

```
~/.claude/projects/<project>/<session>.jsonl
~/.claude/projects/<project>/<session>/subagents/agent-*.jsonl
```

Each `assistant` row carries a `usage` object with `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, and `cache_read_input_tokens`.

Costs use Anthropic public list pricing per million tokens:

| Tier | Input | Output | Cache write | Cache read |
|---|---:|---:|---:|---:|
| Opus 4.x | $15.00 | $75.00 | $18.75 | $1.50 |
| Sonnet 4.x | $3.00 | $15.00 | $3.75 | $0.30 |
| Haiku 4.5 | $1.00 | $5.00 | $1.25 | $0.10 |

## Result 1: main-context compression

| Path | Tokens added to main thread |
|---|---:|
| Main does it itself | ~8,623 (≈8,304 file-content reads + ≈320 prompt/output) |
| Delegated to subagent | ~870 (319 prompt sent in + 550 summary returned) |

**Roughly 10× compression of main-thread context.** The savings compound: those tokens get cached and re-read on every subsequent turn, so the per-turn delta on a long session multiplies the gain.

## Result 2: per-task billed cost

| Subagent tier | Turns | Tools used | Self cost | Same workload on Opus | Saving |
|---|---:|---:|---:|---:|---:|
| Haiku 4.5 | 46 | 25 (Read ×16, Bash ×9) | **$0.282** | $4.236 | ~15× |
| Sonnet 4.x | 20 | 19 | **$0.563** | $2.814 | ~5× |

Both runs returned summaries of comparable quality (~550–620 tokens of output covering the same chain end-to-end).

Notable: Sonnet finished in less than half the turns Haiku needed. Haiku is cheaper per token but less efficient per task; "use the cheapest model" is not a universal rule.

## What this does and does not prove

**Does prove:**

- The delegation mechanism is real and measurable. For this task: ~10× main-context compression, ~5–15× per-task billed savings versus running the same work on Opus directly.
- Quality cost is negligible at the task scale tested — the summary returned to the main thread covers the same information either tier produces.

**Does not prove:**

- Generality. This is N=1 on a small read-heavy exploration task. Implementation-heavy `/opsx:apply` runs that touch many files and emit diffs will have a different ratio — sometimes worse, because the subagent has to round-trip findings before the main thread acts on them.
- That every task should be delegated. Tasks small enough that the subagent's own system-prompt overhead exceeds the work being done will lose money on delegation.

The Step 0 prompt is intentionally rule-free for this reason: the LLM weighs task size against delegation overhead at runtime instead of following a fixed threshold.

## Reproducing

1. Run any task using the `Agent` tool, optionally pinning `subagent_type: "Explore"` and `model: "sonnet"` (or `"haiku"`).
2. Locate the subagent transcript under `~/.claude/projects/<project>/<session>/subagents/agent-*.jsonl`.
3. Sum `usage.input_tokens`, `usage.output_tokens`, `usage.cache_creation_input_tokens`, and `usage.cache_read_input_tokens` across all `assistant` rows.
4. Apply tier pricing from the table above.
5. Compute the projected cost of the same usage at Opus pricing for the counter-factual.
