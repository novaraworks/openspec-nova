## Context

The fork closely tracks upstream. The goal of "publish independently" is to have our own npm identity and release channel — **not** a wholesale rename. Every extra changed field is a permanent rebase conflict point.

## Decision: separate identity from contract

Split fork-side modifications into two layers:

```
Identity layer (always fork)              Contract layer (always upstream)
────────────────────────────              ────────────────────────────
package.json                              bin name = openspec
  name = @novaraworks/openspec            OPENSPEC_DIR_NAME = "openspec"
  repository / homepage / bugs            shell command strings in workflow templates
  author = NovaraWorks                    CLI subcommand names / args / JSON schemas
  version (independent cadence)           postinstall behavior (unless it references the package name)
README fork notice                        all of src/ and the directory structure
.github/workflows/release.yml
```

Identity-layer conflicts are always resolved with "ours". Contract-layer conflicts are always resolved with "theirs". This separation makes rebases nearly mechanical.

## Why bin name stays `openspec`

Two options were considered:

| | Keep `openspec` | Rename to `nova-spec` |
|---|---|---|
| Coexists with upstream package | no | yes |
| Workflow template edits required | 0 | **20+ files** (every `openspec status`-style hardcoded shell command) |
| Conflicts on every upstream template edit | none (auto-passthrough) | guaranteed |
| User muscle memory | unchanged | requires relearning |

Coexistence is something nobody actually needs (who installs two OpenSpec CLIs side by side?), and it is not worth giving up rebase friendliness for. Decision: keep `openspec`.

## Why directory name stays `openspec/`

- `openspec/specs/` and `openspec/changes/` are checked-in user data
- Renaming would force fork users into a migration and break specs sharing with upstream-following projects
- All path handling routes through the `OPENSPEC_DIR_NAME` constant; changing the constant is effectively a code-wide refactor

## Versioning policy

- **Reset version to `0.1.0`** to mark independent fork cadence
- Do not reuse upstream's `1.3.1` — avoids "which 1.3.1?" confusion
- Follow semver going forward: fork-side increments use minor (e.g., apply delegation = `0.2.0`); upstream syncs use patch or minor depending on size

## Release pipeline

- Reuse upstream's existing `changesets`: the `pnpm release:ci` flow stays unchanged
- Add (or adjust) `.github/workflows/release.yml` to run only on the fork's `main` branch using the fork's `NPM_TOKEN` secret
- Required secrets:
  - `NPM_TOKEN`: an automation token from npm user `novaraworks` (Publish + Read scope)
  - `GITHUB_TOKEN`: default suffices

## Rebase Playbook

For each `git fetch upstream && git rebase upstream/main`:

1. **`package.json`**: identity fields (`name`, `repository`, `homepage`, `bugs`, `author`) — take ours; other fields (`dependencies`, `devDependencies`, `scripts`, `engines`, `files`) — generally take theirs
2. **`README.md`**: fork notice block at top — take ours; body — take theirs
3. **`.github/workflows/release.yml`**: take ours (if upstream has a same-named workflow, inspect and merge as needed)
4. **`src/core/templates/skill-templates.ts`** (from `add-apply-delegation-strategy`): keep our import path, but merge any new exports added upstream
5. **`src/core/templates/workflows/_nova-overrides.ts` / `apply-change.nova.ts`**: fork-only files, no conflicts expected
6. **Everything else**: default to theirs

## Test Strategy

- `pnpm run check:pack-version`: verifies package name and version consistency
- Local `npm pack`: verifies the produced tarball includes `dist/`, `bin/`, `schemas/`
- `npm publish --dry-run`: pre-flight rehearsal
- Install verification: in a scratch project, `npm install @novaraworks/openspec` and `npx openspec --version` should report the new version

## Alternatives Considered

| Approach | Why rejected |
|---|---|
| Rename bin and directory | Permanent rebase pain; the only benefit (coexistence) is unneeded |
| Continue with `1.3.x` versions | Confuses users about which `1.3.1` they have |
| Skip changesets, use manual `npm version` | Upstream already wires changesets; reuse is cheaper |
| Fully detach from upstream | Conflicts with the "closely tracks upstream" decision |
