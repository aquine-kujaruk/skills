---
name: feedback
description: Apply PR review feedback when new human comments on a primary or auxiliary PR need source-first corrections in the active stack.
---

# Apply PR review feedback

## 1. Resolve the active generation

Read [`review-contract.md`](../../references/review-contract.md) completely. Read [`configuration.md`](../../references/configuration.md) for the activation gate, [`feedback-discovery.md`](../../references/feedback-discovery.md) before classifying comments, and [`github-operations.md`](../../references/github-operations.md) before mutation. Resolve an input primary or auxiliary PR to exactly one open primary and active generation.

Complete when configuration passes and every PR, branch, marker, label, base, stack position, source SHA, and tree in the active generation is verified.

## 2. Discover new feedback

Scan the primary PR and every auxiliary PR in the active generation across all surfaces in `feedback-discovery.md`. Compare stable IDs with every active feedback marker. Classify each human item and show exclusions when ambiguity affects scope.

If no actionable new ID exists, make no mutation and report the inspected PRs and evidence.

Complete when every human item is classified and every actionable ID is either previously marked or assigned to one coherent correction group.

## 3. Correct the source

Check out the user-owned source branch, create a temporary safety ref, and implement all correction groups. Add focused commits with proportionate validation. Push the source branch normally so both source-headed PR views advance. Preserve all primary metadata and every published internal branch.

Complete when the complete correction is committed, validated, pushed, and visible in the unchanged primary PR.

## 4. Publish correction layers

Starting from the previous final internal tree, reconstruct only the new source delta into configured feedback branches. For each coherent group, create one draft PR with the managed label, identity markers, visible source-comment URLs, stable feedback-ID markers, and verification evidence.

Follow `github-operations.md` to replace only native stack membership, retarget only the stack-source PR to the final feedback branch, and relink the preserved old PRs plus new feedback PRs plus the same stack-source PR.

Complete when every new correction PR is draft and marked, old PR identities and branches are unchanged, stack order is verified, source and reconstruction trees match, and stack-source again has zero changed files.

## 5. Link feedback and remove local branches

Reply to each original comment with its correction PR and commit URLs, preserving thread resolution. Reinspect all remote evidence, then remove only generated local feedback branches and the temporary safety ref.

Complete when every new stable ID has exactly one correction marker and navigable reply, and no managed local branch from this run remains.

## 6. Report

Return the primary PR URL first, then the complete auxiliary stack bottom-to-top. Identify new correction PRs and their source comments, include validation/tree/zero-file evidence, and list any informational or ambiguous items left unchanged.

Complete when reviewers can verify every correction without reconstructing the agent's local work.
