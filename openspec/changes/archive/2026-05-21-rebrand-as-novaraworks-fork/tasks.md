## 1. npm account preparation (manual, prerequisite)

- [ ] 1.1 npm user `novaraworks` is registered (personal account scope; package name is `@novaraworks/openspec`)
- [ ] 1.2 Generate an Automation token in npm Profile → Access Tokens (Publish + Read scope)
- [ ] 1.3 Configure the token as a GitHub repo secret named `NPM_TOKEN`
- [ ] 1.4 (Future option) If multi-person collaboration is needed, follow npm's "Convert user to organization" flow — no republishing required

## 2. Update `package.json`

- [x] 2.1 Set `name` to `@novaraworks/openspec`
- [x] 2.2 Set `repository.url` to `git@github.com:novaraworks/openspec-nova.git` (or the https form, matching upstream style)
- [x] 2.3 Set `homepage` to `https://github.com/novaraworks/openspec-nova`
- [x] 2.4 Set `bugs.url` to `https://github.com/novaraworks/openspec-nova/issues`
- [x] 2.5 Set `author` to `NovaraWorks` (license remains unchanged)
- [x] 2.6 Reset `version` to `0.1.0`
- [x] 2.7 **Do not change** `bin.openspec`, `description`, `keywords`, `license`, `engines`, `files`, `dependencies`, `devDependencies`, `scripts`

## 3. README fork notice

- [x] 3.1 Add a fork notice block immediately under the title in `README.md`:
  - Declare this is a fork of `Fission-AI/OpenSpec`
  - List fork-side increments (apply delegation strategy; append more over time)
  - Link to upstream
  - State the sync policy ("closely tracks upstream")
- [x] 3.2 Do not rewrite the rest of README

## 4. Adapt release scripts

- [x] 4.1 Inspect `scripts/postinstall.js` for hardcoded `@fission-ai/openspec` references and replace with the new name (or refactor to read `package.json#name`)
- [x] 4.2 Same check for `scripts/pack-version-check.mjs`
- [x] 4.3 Run `pnpm run check:pack-version` to verify

## 5. CI release workflow

- [x] 5.1 Inspect existing `.github/workflows/` for a release workflow; if present, confirm it can run as-is on the fork repo with the configured `NPM_TOKEN`
- [x] 5.2 If the upstream workflow conflicts with fork needs (e.g., references fission-ai-only resources), add a fork-only workflow `.github/workflows/release.yml`
- [x] 5.3 Run `npm publish --dry-run` locally to verify the artifact contents (`dist/`, `bin/`, `schemas/`) — confirmed 319 files including `dist/`, `bin/openspec.js`, `schemas/`, `LICENSE`, `README.md`, `package.json`

## 6. First release

- [ ] 6.1 Create a changeset describing the initial fork release: `pnpm changeset` — skipped for the initial release; first publish was done manually via `npm publish --access public --ignore-scripts --registry https://registry.npmjs.org/`. Future releases should use changesets.
- [ ] 6.2 Merge to `main` and let CI publish — deferred until the GitHub `NPM_TOKEN` secret is configured (tasks 1.2 / 1.3); manual publish was used for the initial release
- [x] 6.3 Verify with `npm view @novaraworks/openspec` that `0.1.0` is published — confirmed on `https://registry.npmjs.org/`, maintainer `novaraworks`, shasum matches local pack
- [x] 6.4 In a scratch project, `npm install @novaraworks/openspec` and `npx openspec --version` should print `0.1.0` — verified at `/tmp/openspec-e2e`; `openspec init --tools claude` also generated `.claude/commands/opsx/{apply,archive,bulk-archive}.md` with the Step 0 prelude on the first body line

## 7. Documentation and collaboration

- [x] 7.1 In the README fork notice, include a one-or-two-line "how to rebase from upstream" pointer (or link to internal notes)
- [ ] 7.2 All commit messages and PR descriptions are in English
