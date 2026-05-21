## Why

`novaraworks/openspec-nova` is a fork of `Fission-AI/OpenSpec`. We want to publish it independently to npm as `@novaraworks/openspec` so that:

- External users can `npm install @novaraworks/openspec` to get the fork (with fork-side increments such as the apply delegation strategy)
- The fork can release on its own cadence, decoupled from upstream timing
- The npm scope matches the GitHub org name (`novaraworks`), minimizing cognitive overhead

The fork closely tracks upstream, so we keep the rebrand surface as small as possible — we want an independent identity, not a wholesale rename. Every additional changed field is a future rebase conflict.

## What Changes

### 1. Update identity fields in `package.json`

Only identity-related fields change. Runtime contract fields stay aligned with upstream:

| Field | Change | New value |
|---|---|---|
| `name` | yes | `@novaraworks/openspec` |
| `repository.url` | yes | `git@github.com:novaraworks/openspec-nova.git` |
| `homepage` | yes | `https://github.com/novaraworks/openspec-nova` |
| `bugs.url` | yes | `https://github.com/novaraworks/openspec-nova/issues` |
| `author` | yes | `NovaraWorks` |
| `version` | yes | reset to `0.1.0` (independent fork cadence) |
| `bin.openspec` | no | keep `./bin/openspec.js` — renaming the bin would force changes to all hardcoded `openspec status`-style shell command strings inside workflow templates, creating permanent rebase conflicts |
| `keywords / description / license / engines / files / dependencies / scripts` | no | keep upstream values |

### 2. Add a fork notice to README

Add a short notice block at the top of `README.md` (directly under the title) that:

- Declares this repo is a fork of `Fission-AI/OpenSpec`
- Lists the fork-side increments (apply delegation strategy; future ones append here)
- Links back to upstream
- States the sync policy ("closely tracks upstream")

The README body is not rewritten — upstream README updates flow through automatically.

### 3. Preserve user contract and data layout

- The `OPENSPEC_DIR_NAME` constant stays as `'openspec'` — user project layouts (`openspec/specs/`, `openspec/changes/`) remain compatible with upstream.
- `bin: openspec` stays — the CLI command name does not change.
- All workflow template strings (`openspec status`, `openspec instructions`, etc.) are untouched.
- The fork is **not** intended to coexist with `@fission-ai/openspec` on the same machine (both ship `bin: openspec`). This trade-off is accepted.

### 4. Release pipeline

- Reuse the existing upstream `changesets` setup (no new tooling required).
- Add or adjust `.github/workflows/release.yml` so a merge to `main` triggers `pnpm release` against `@novaraworks/openspec`.
- The workflow uses `NPM_TOKEN`, an automation token from the npm `novaraworks` user account.

### 5. Adapt `postinstall` and `pack-version-check` if needed

- If `scripts/postinstall.js` or `scripts/pack-version-check.mjs` hardcode `@fission-ai/openspec`, update them to the new name. If they read from `package.json#name`, no change is required.

## Constraints / Non-goals

- **Do not rename bin or directory** — preserve rebase friendliness
- **Do not coexist with the upstream package** — accepted trade-off
- **Do not rewrite README content or docs structure** — only add a fork notice at the top
- **Do not change any `src/` code** unless `postinstall` / `pack-version-check` scripts hardcode the package name

## Impact

- Modified files: `package.json`, `README.md` (notice block), possibly `scripts/postinstall.js` / `scripts/pack-version-check.mjs`
- New files: `.github/workflows/release.yml` (fork-only release workflow, if no equivalent exists upstream); fork-specific entries in changeset config if needed
- Rebase conflicts: `package.json` `dependencies` / `scripts` fields may conflict on upstream sync — fixed identity fields are always taken from the fork; other fields default to upstream
- Pre-release prerequisites: npm user `novaraworks` registered (already done) and `NPM_TOKEN` automation token configured in GitHub repo secrets
