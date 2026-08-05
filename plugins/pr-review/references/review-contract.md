# PR review contract

This file is the single source of truth shared by `config`, `start`, and `feedback`.

## Views

- The **primary PR** compares the user-owned source branch with the destination. It is ready for review and is the only merge target.
- The **review stack** is a parallel, all-draft chain. Its internal PRs explain coherent questions; its top **stack-source PR** uses the same source branch and head SHA as the primary PR.
- The stack-source PR compares the source branch with the highest internal layer and has zero changed files. Equal commit SHAs are insufficient; compare tree object IDs and the GitHub file list.
- One source branch therefore heads two PRs. GitHub cannot give one PR two bases.

Treat an existing primary PR as immutable metadata. Preserve its number, title, body, base, labels, assignees, milestone, review state, and draft state. Feedback may only advance its source branch with new commits. When creating a primary PR, make it ready and point it directly at the destination.

## Reviewer bandwidth

Reviewability outranks minimizing the number of layers. There is no preferred layer count and no universal limit based on changed lines, files, or review time.

Design each internal layer as one complete review question that a reviewer can understand and answer in a focused pass without repeatedly opening sibling PRs. Assess proposed layers with all of these signals:

- conceptual breadth: independent behaviors or decisions belong in separate layers when each remains meaningful alone;
- diff breadth: human-authored churn, substantive files, and affected subsystems are warnings, not quotas; generated files, lockfiles, mechanical rewrites, and large deletions need different judgment;
- context closure: include the implementation, tests, rationale, and dependencies needed to answer the question;
- intermediate validity: every layer ends in a buildable or otherwise repository-valid tree and preserves the dependencies below it;
- navigation cost: prefer an adjacent, coherent story over smaller layers that make the reviewer reconstruct one concept across PRs.

Split a broad layer again when doing so reduces the context held at once and produces independently understandable, valid layers. Stop splitting when another boundary would fragment one conceptual unit, increase cross-PR switching, or invalidate the intermediate tree. Coalesce trivial adjacent layers that ask the same question. If a layer remains unusually broad, record the applicable stop reason instead of forcing a mechanical split.

Every review-layer body provides a resumption cue: why the layer exists, what it depends on, what the reviewer should decide, and what validation makes the intermediate tree trustworthy.

## Configuration gate

Read `.github/pr-review.yml` and `.github/workflows/pr-review-close.yml` from the repository default branch, not merely from the working tree. `start` and `feedback` proceed only when:

1. the configuration version is supported;
2. the cleanup workflow is active on the default branch;
3. the workflow permissions can close PRs and delete managed refs;
4. the configured managed label exists;
5. GitHub CLI is authenticated and the official `github/gh-stack` extension works.

Report one concrete blocker when any gate fails. `config` owns installation and changes to this gate.

## Identifier and names

Resolve one stable review identifier in this order:

1. a configured leading token in the primary title;
2. a configured token in the source branch;
3. `PR-<primary-number>`.

An explicit `--id` argument wins when creating a new primary. Normalize only for generated branch paths; preserve the visible identifier in titles.

Apply project naming policy before plugin defaults. Another project skill or repository instruction may choose title and branch templates. The invariant is visible role: every auxiliary title starts with a short non-merge marker such as `[review]`, `[feedback]`, or `[stack-source]` followed by the identifier.

The defaults are:

- primary, only when its identifier is known before creation: `[{id}] {title}`;
- initial layer: `[review][{id}] {question}`;
- correction layer: `[feedback][{id}] {question}`;
- equality proof: `[stack-source][{id}] {title}`;
- initial branch: `review/{id}/{index}-{slug}`;
- correction branch: `feedback/{id}/{index}-{slug}`.

If a new primary needs its PR number as fallback, create it with the requested title unchanged. Use the resulting `PR-<number>` only in auxiliary artifacts.

## Managed identity

Apply exactly one machine label to every auxiliary PR: the configured `stack-review:managed` label. Keep it after closure as historical evidence. Roles and review state belong in titles and topology, not labels.

Every auxiliary PR body contains these exact hidden markers:

```html
<!-- pr-review:primary=123 -->
<!-- pr-review:generation=PR-123-0123456789ab -->
<!-- pr-review:role=review -->
```

Valid roles are `review`, `feedback`, and `stack-source`. The generation value is fixed when `start` freezes the initial source SHA. These markers let cleanup recover after a partial GitHub operation.

## Branch lifecycle

The source branch is user-owned. Preserve its name and remote ref through publication, cleanup, merge, closure, and reopening.

Generated internal branches are managed. Their local refs are transient: create them only while reconstructing or publishing a layer, then remove them after the complete remote topology and trees are verified. Their remote refs remain while the stack is open because its PRs depend on them. Cleanup deletes those remote refs after closing the auxiliary PRs.

Use a temporary local ref under `refs/pr-review/safety/` while mutating topology. Remove it after verified success; retain it on failure and report its exact name.

## Review generation

There is at most one active review generation for a primary PR. `start` reuses a valid active generation rather than duplicating it.

Closing or merging the primary ends the generation. The cleanup Action unstacks it, closes all marked auxiliary PRs, and deletes managed remote branches. It never deletes the source branch or the primary PR history.

When proving native stack membership during cleanup, compare every PR marked with the generation, including PRs GitHub has already closed or marked merged. GitHub can retain those PRs in the native stack response after the primary merges.

Reopening a closed, unmerged primary starts a new generation with new auxiliary PRs. Closed generations remain historical. A merged primary cannot start again.

## Feedback identity

Review state is non-linear. Keep all auxiliary PRs draft and open until cleanup; do not model `pending`, `reviewed`, or numbered rounds.

On every `feedback` run, scan the primary PR and every PR in the active generation, including old layers. A human comment is new when its stable GitHub node or REST ID is absent from correction markers in every active feedback PR.

Each feedback PR body shows source comment URLs and contains one marker per handled item:

```html
<!-- pr-review:feedback-id=PRRC_kwDO... -->
```

Group related comments into coherent correction layers. Reply to each source comment with its correction PR and commit URL. Leave review threads open for the reviewer.

## Publication evidence

GitHub mutations are non-atomic. After any failure, inspect remote branches, PRs, labels, bases, stack membership, and trees before retrying. Reuse confirmed objects and avoid duplicate PRs.

A successful run reports:

1. the primary PR URL first;
2. auxiliary URLs from bottom to top;
3. one review question per new layer;
4. source SHA, reconstructed tree ID, source tree ID, and zero changed files on the stack-source PR;
5. confirmation that no managed local branch remains.
