## Why

`/opsx:apply`, `/opsx:archive`, and `/opsx:bulk-archive` are the workflows where token cost and conversation context fill up fastest. The default templates leave model-and-concurrency decisions implicit, which leads to:

- Mechanical sub-tasks (template fills, deterministic merges, single-file edits) run on the main conversation's expensive model
- Independent sub-tasks run sequentially even when they could be parallelized
- Each user invocation requires a manual "should I switch to sonnet / spawn subagents" pre-amble

Claude Code's Task tool accepts `model: "opus" | "sonnet" | "haiku"` and supports parallel subagents — meaning the LLM itself can delegate to a cheaper model without asking the user to switch and retry. The friction we initially worried about does not exist.

The change is intentionally small: prepend a one-line Step 0 to each of the three command templates that asks the LLM to **assess** whether to delegate. No decision rules — only the prompt to consider.

## What Changes

### 1. Inject Step 0 at the top of three command templates

A single line is prepended to the upstream `instructions` / `content` strings returned by:

- `getApplyChangeSkillTemplate()` / `getOpsxApplyCommandTemplate()`
- `getArchiveChangeSkillTemplate()` / `getOpsxArchiveCommandTemplate()`
- `getBulkArchiveChangeSkillTemplate()` / `getOpsxBulkArchiveCommandTemplate()`

The injected line:

```
**Step 0:** Assess whether to spawn subagents and/or switch to a cheaper model (e.g., sonnet) before proceeding.
```

No decision rules, no thresholds, no examples. The LLM decides at runtime whether the change in front of it is worth delegating.

### 2. Implement via wrapper files (do not edit upstream templates)

Editing `apply-change.ts`, `archive-change.ts`, or `bulk-archive-change.ts` directly would create permanent rebase conflict points. Instead, three new files mirror the upstream factory shape:

- `src/core/templates/workflows/apply-change.nova.ts`
- `src/core/templates/workflows/archive-change.nova.ts`
- `src/core/templates/workflows/bulk-archive-change.nova.ts`

Each imports the upstream factories, prepends the Step 0 string to `instructions` / `content`, and re-exports under the same names.

### 3. Single source of truth for the Step 0 string

`src/core/templates/workflows/_nova-step0.ts` exports a single `STEP_0` constant. The three wrapper files import it. Future wording adjustments are one-line edits.

### 4. Fork override entry point

`src/core/templates/workflows/_nova-overrides.ts` is a re-export barrel for all fork-side template overrides. `skill-templates.ts` imports apply, archive, and bulk-archive factories from this barrel instead of their upstream paths.

## Constraints / Non-goals

- **No decision rules** — delegation is decided by the LLM at runtime; the template only prompts the consideration
- **No CLI changes** — the `openspec` binary and subcommands are untouched
- **No user contract changes** — the `openspec/` directory layout, `/opsx:*` slash command names, and shell command strings are unchanged
- Fully decoupled from upstream template files — upstream content edits flow through automatically (function signatures aside)

## Impact

- Modified files: three import lines in `src/core/templates/skill-templates.ts`
- New files: `_nova-step0.ts`, `apply-change.nova.ts`, `archive-change.nova.ts`, `bulk-archive-change.nova.ts`, `_nova-overrides.ts`, plus three wrapper test files
- User-visible: after `openspec update` (or first install), AI tools receive a Step 0 prelude in `/opsx:apply`, `/opsx:archive`, `/opsx:bulk-archive` prompts and the corresponding skills
- Risk: an over-eager Step 0 wastes a turn analyzing trivial changes. Mitigated by keeping the prelude to a single line — the LLM can dismiss it in one sentence if nothing is worth delegating

## Scope History

The original scope covered `/opsx:apply` only. During implementation, the user observed that `/opsx:archive` and `/opsx:bulk-archive` also benefit (cheap-model delegation saves tokens; bulk-archive can parallelize across changes). The wrappers and tests were extended in the same change. The change slug `add-apply-delegation-strategy` is retained for continuity even though the final scope spans three commands.
