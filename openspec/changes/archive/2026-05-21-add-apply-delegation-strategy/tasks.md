## 1. Implement the apply wrapper

- [x] 1.1 Create `src/core/templates/workflows/apply-change.nova.ts` that imports upstream `getApplyChangeSkillTemplate` and `getOpsxApplyCommandTemplate` and prepends the Step 0 string to their returned `instructions` / `content`
- [x] 1.2 Extract the Step 0 string into a shared module `src/core/templates/workflows/_nova-step0.ts` (originally inlined; promoted to shared when archive/bulk-archive wrappers were added)
- [x] 1.3 Pass through all other fields (name, description, metadata, etc.) from the upstream template values unchanged

## 2. Establish the fork override entry point

- [x] 2.1 Create `src/core/templates/workflows/_nova-overrides.ts` that re-exports the wrapper factories
- [x] 2.2 Modify `src/core/templates/skill-templates.ts` to import the apply, archive, and bulk-archive factories from `./workflows/_nova-overrides.js` instead of their upstream paths

## 3. Step 0 content

- [x] 3.1 Author the Step 0 string — list dimensions only (subagent / cheaper model), no prescriptive rules, leave the decision to the LLM
- [x] 3.2 Keep it to a single line so the prelude does not crowd the upstream template body
- [x] 3.3 Author the content in English (everything committed to the repo is in English)

## 4. Apply tests

- [x] 4.1 Add `test/core/templates/workflows/apply-change.nova.test.ts` asserting:
  - The skill template `instructions` starts with `**Step 0:`
  - The command template `content` starts with `**Step 0:`
  - The upstream body is contained in the wrapper output
- [x] 4.2 Run `pnpm test` to confirm no regressions
- [x] 4.3 In a temporary sample project, run `openspec init --tools claude` and verify the generated `.claude/commands/opsx/apply.md` contains the Step 0 prelude

## 5. Implement the archive wrappers

- [x] 5.1 Create `src/core/templates/workflows/archive-change.nova.ts` mirroring the apply wrapper for `getArchiveChangeSkillTemplate` and `getOpsxArchiveCommandTemplate`
- [x] 5.2 Create `src/core/templates/workflows/bulk-archive-change.nova.ts` mirroring the apply wrapper for `getBulkArchiveChangeSkillTemplate` and `getOpsxBulkArchiveCommandTemplate`
- [x] 5.3 Extend `_nova-overrides.ts` to re-export the archive and bulk-archive factories
- [x] 5.4 Update `skill-templates.ts` archive and bulk-archive import lines to point at `_nova-overrides.js`

## 6. Archive tests

- [x] 6.1 Add `test/core/templates/workflows/archive-change.nova.test.ts` (same three assertions as the apply test)
- [x] 6.2 Add `test/core/templates/workflows/bulk-archive-change.nova.test.ts` (same three assertions)
- [x] 6.3 Refresh hash pins in `test/core/templates/skill-templates-parity.test.ts` for `getApplyChangeSkillTemplate`, `getOpsxApplyCommandTemplate`, `getArchiveChangeSkillTemplate`, `getOpsxArchiveCommandTemplate`, `getBulkArchiveChangeSkillTemplate`, `getOpsxBulkArchiveCommandTemplate`, `openspec-apply-change`, `openspec-archive-change`, `openspec-bulk-archive-change`
- [x] 6.4 In the same E2E sample project, verify `.claude/commands/opsx/archive.md` and `.claude/commands/opsx/bulk-archive.md` also contain the Step 0 prelude

## 7. Documentation

- [x] 7.1 In the `README.md` fork notice section (shared with the rebrand change), list the delegation prelude as one of the fork-side increments
