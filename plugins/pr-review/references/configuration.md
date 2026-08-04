# Repository configuration

`config` installs three files on the repository default branch through one dedicated ready PR:

- `.github/pr-review.yml` — naming and identification policy;
- `.github/workflows/pr-review-close.yml` — automatic and manual cleanup entry point;
- `.github/scripts/pr-review-cleanup.sh` — idempotent cleanup implementation.

Use the plugin's own files at those paths as the default templates. Apply explicit repository instructions or another naming skill before defaults. Keep the supported schema keys even when values change.

## Supported schema

```yaml
version: 1
managed_label: stack-review:managed
identifier:
  title_pattern: '^\[([^]]+)\]'
  source_branch_pattern: '(?:^|/)([A-Z][A-Z0-9]+-[0-9]+)(?:[-/]|$)'
titles:
  primary: '[{id}] {title}'
  review: '[review][{id}] {title}'
  feedback: '[feedback][{id}] {title}'
  stack_source: '[stack-source][{id}] {title}'
branches:
  review: 'review/{id}/{index}-{slug}'
  feedback: 'feedback/{id}/{index}-{slug}'
```

`{id}`, `{title}`, `{index}`, and `{slug}` are the only placeholders. `index` is two digits and increases across every review and feedback branch in one generation. Generated path segments use lowercase letters, digits, and hyphens.

Auxiliary title templates may change, but each must begin with a literal bracketed role that makes the PR visibly non-mergeable. The managed label value must also be written to the cleanup workflow's `MANAGED_LABEL` environment variable.

## Dedicated configuration PR

Search open PRs by the exact configured branch before creating one. Reuse that PR and branch when they already exist; update only the three managed files and minimal README guidance needed by the consuming repository. Target the repository default branch.

The PR body states:

- purpose;
- installed files;
- validation evidence;
- expected automatic cleanup after primary closure;
- required Actions and token permissions;
- known public-preview dependency on GitHub stacked PRs.

Make the PR ready. Never merge it from `config`; activation begins only after a maintainer merges it.

## Activation checks

After the configuration commit is on the default branch:

```bash
gh api "repos/{owner}/{repo}/contents/.github/pr-review.yml?ref={default}"
gh workflow view pr-review-close.yml --repo OWNER/REPO
gh label view stack-review:managed --repo OWNER/REPO
```

Verify repository Actions are enabled. The workflow needs `contents: write`, `pull-requests: write`, and `issues: write`. Repository or organization policy may reduce `GITHUB_TOKEN`; treat that as a blocker rather than promising cleanup.

The workflow handles `pull_request_target: closed` and `workflow_dispatch`. Manual dispatch accepts a closed primary PR number and retries the same idempotent cleanup. Managed auxiliary closure events exit without work.
