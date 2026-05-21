## Context

The `novaraworks/openspec-nova` fork closely tracks upstream `Fission-AI/OpenSpec`. All fork-side changes must satisfy the rebase-friendly constraint: avoid editing upstream files; concentrate fork additions in dedicated files.

The apply template is iterated on frequently in upstream (recent history shows multiple updates to `apply-change.ts` over the past months). Editing that file directly would create rebase conflicts on every upstream sync.

## Decision: Wrapper Pattern

```
upstream (never edited)
  src/core/templates/workflows/apply-change.ts
  src/core/templates/workflows/archive-change.ts
  src/core/templates/workflows/bulk-archive-change.ts
                            ▲
                            │ imports upstream factories
                            │
fork (private)
  src/core/templates/workflows/_nova-step0.ts
    export const STEP_0 = '**Step 0:** Assess whether to spawn subagents ...'

  src/core/templates/workflows/apply-change.nova.ts
  src/core/templates/workflows/archive-change.nova.ts
  src/core/templates/workflows/bulk-archive-change.nova.ts
    // Same shape per file:
    import { STEP_0 } from './_nova-step0.js'
    import { getXxxSkillTemplate as upstreamSkill,
             getOpsxXxxCommandTemplate as upstreamCommand } from './xxx-change.js'
    export function getXxxSkillTemplate() {
      const t = upstreamSkill()
      return { ...t, instructions: STEP_0 + '\n\n' + t.instructions }
    }
    export function getOpsxXxxCommandTemplate() {
      const t = upstreamCommand()
      return { ...t, content: STEP_0 + '\n\n' + t.content }
    }

  src/core/templates/workflows/_nova-overrides.ts
    // Re-export wrappers; new upstream templates do not affect this file.
    export { ... } from './apply-change.nova.js'
    export { ... } from './archive-change.nova.js'
    export { ... } from './bulk-archive-change.nova.js'

modified
  src/core/templates/skill-templates.ts
  - export { ... } from './workflows/apply-change.js'
  - export { ... } from './workflows/archive-change.js'
  - export { ... } from './workflows/bulk-archive-change.js'
  + export { ... } from './workflows/_nova-overrides.js'   // x3 lines
```

## Why this shape

- **Minimal conflict surface**: upstream content edits to `apply-change.ts` flow through automatically because we import rather than copy.
- **Centralized entry**: all fork-side overrides land in `_nova-overrides.ts`; future overrides for `archive`, `continue`, `propose` need not touch the barrel again.
- **Signatures preserved**: the return types of `getApplyChangeSkillTemplate` and `getOpsxApplyCommandTemplate` are unchanged, so downstream consumers (e.g. `skill-generation.ts`) need no adjustments.

## Step 0 content design

Final form is a single line:

```
**Step 0:** Assess whether to spawn subagents and/or switch to a cheaper model (e.g., sonnet) before proceeding.
```

Two hard constraints drove the wording:

1. **No decision rules** — do not write thresholds like "spawn subagents if there are more than 5 tasks". The LLM judges based on the change content.
2. **Single line** — earlier drafts listed three dimensions and an explicit escape hatch over ~12 lines. Field-tested and rejected: a verbose prelude crowded the upstream template body and prompted the LLM to over-narrate trivial changes. One sentence is enough — the LLM can dismiss it silently when nothing is worth delegating.

## Upstream signature changes

If upstream changes the signature of any wrapped factory (return type, added parameters):

- TypeScript fails at build time.
- The fix is localized to the corresponding `*-change.nova.ts` file.
- No other fork modules are affected.

## Test Strategy

- Unit tests, one per wrapper (`apply-change.nova.test.ts`, `archive-change.nova.test.ts`, `bulk-archive-change.nova.test.ts`), each asserting:
  - The skill template `instructions` starts with `**Step 0:`.
  - The command template `content` starts with `**Step 0:`.
  - The upstream template body is preserved as a substring of the wrapper return value.
- Hash-pin parity test (`skill-templates-parity.test.ts`) catches unintended drift in any wrapped factory output.
- E2E: in a scratch project, run `openspec init --tools claude` and inspect the generated `.claude/commands/opsx/{apply,archive,bulk-archive}.md` for the Step 0 prelude on the first body line.

## Alternatives Considered

| Approach | Why rejected |
|---|---|
| Edit `apply-change.ts` directly | Permanent rebase conflict every time upstream touches the file |
| Build-time string patching | Relies on regex against upstream content; fragile |
| Submit a hook/extension PR upstream first | Requires upstream review; fork-side needs should not block on upstream |
| Have the CLI emit metadata that the template reads | The template already has access to change content; an extra CLI hop adds nothing |
