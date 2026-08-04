---
name: config
description: Configure PR review when a repository needs naming policy, managed identity, or automatic cleanup installed through a ready PR.
---

# Configure PR review

## 1. Resolve policy

Read [`review-contract.md`](../../references/review-contract.md) and [`configuration.md`](../../references/configuration.md) completely. Inspect repository instructions and any explicitly named naming skill before applying plugin defaults. Resolve the repository, default branch, configuration branch, managed label, and templates.

Complete when one supported policy is explicit and every auxiliary title template begins with a visible bracketed non-merge role.

## 2. Inspect activation

Read the three managed files from the remote default branch and inspect the GitHub Actions and label state. Distinguish active configuration, an open configuration PR, and no configuration. Preserve unrelated working-tree changes.

Complete when every existing managed artifact and its remote status are accounted for.

## 3. Publish configuration

When configuration is already active and matches the requested policy, create only a missing label and report success. Otherwise create or reuse the dedicated configuration branch and ready PR described in `configuration.md`. Copy this plugin's `.github` files as defaults, then apply the resolved policy consistently to the YAML and workflow environment. Update only minimal consumer documentation when needed.

Validate exact files, stage them explicitly, commit, push, and create or update the ready PR. Keep this PR separate from product or tutorial stacks.

Complete when the label exists and one ready PR to the default branch contains all three valid managed files with consistent label values.

## 4. Hand off activation

Return the configuration PR URL, exact files, policy summary, validation evidence, and the checks that will become active after merge. State that `start` and `feedback` remain blocked until this PR is merged and its workflow is enabled.

Complete when the maintainer can inspect and merge the configuration PR without running a command.
