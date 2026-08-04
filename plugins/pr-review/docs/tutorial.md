# Tutorial: run `pr-review` from start to finish

This walkthrough exercises the plugin's three use cases and automatic cleanup:

1. configure the repository;
2. implement an example change;
3. publish the primary PR and its review stack;
4. apply new and late feedback;
5. finish and clean up the generation.

Only the implementation step uses a detailed prompt. Invoke skills by name and pass an argument
only when the target is unclear from context.

## Before you begin

Open the repository in Codex or Claude Code. The agent needs authenticated GitHub access and the
official `github/gh-stack` extension. The source branch must belong to the same repository, not a
fork.

Equivalent invocations:

| Use case | Codex | Claude Code |
| --- | --- | --- |
| Configure | `$pr-review:config` | `/pr-review:config` |
| Publish | `$pr-review:start` | `/pr-review:start` |
| Apply feedback | `$pr-review:feedback` | `/pr-review:feedback` |

## Step 1: configure the repository

In a task with the repository open, invoke:

```text
$pr-review:config
```

The skill creates or reuses a ready PR to the default branch containing:

- `.github/pr-review.yml`;
- `.github/workflows/pr-review-close.yml`;
- `.github/scripts/pr-review-cleanup.sh`.

Review and merge that PR. `start` and `feedback` remain blocked until those files are on the default
branch, Actions is enabled, and the configured label exists.

If the repository is already configured, the skill verifies it without creating another PR.

### Custom conventions

The skill first reads `AGENTS.md`, other project instructions, and the existing configuration. A
short invocation is enough to request explicit conventions:

```text
$pr-review:config roles [inspection], [response], [proof]; branches checks/{id}/{index}-{slug}
```

The configuration PR remains the only surface merged to activate that policy.

## Step 2: implement the demonstration

This is not a `pr-review` command. Paste this prompt into the agent to create the source change:

> In the current repository, switch to `main`, update it with `git pull --ff-only`, and create the
> branch `agent/tutorial-pr-review` from that point. If the branch already exists, first integrate
> the current `main` without deleting its commits. Modify only `tutorial/order.md` and create three
> small commits. In the first, add an order with product "Mug", price €20, total €20, and status
> "draft". In the second, add a €5 discount and write the total as `€20 - €5 = €15`. In the third,
> change the status to "ready for review" and add a two-line checklist: price verified and discount
> verified. Each commit must be understandable from its diff. Run `git diff --check`. Do not push,
> open a PR, or merge. Leave the created branch active and return the three commits in order with
> one sentence per change.

When finished, you should have:

- `agent/tutorial-pr-review` as the active branch;
- the current default-branch history plus any previous commits if the source branch already existed;
- three consecutive demonstration commits;
- a clean working tree;
- no new PR.

## Step 3: publish the review

In the same task, with the source branch active:

```text
$pr-review:start
```

If the branch is in another checkout or a PR already exists, select the target:

```text
$pr-review:start agent/tutorial-pr-review
$pr-review:start 123
$pr-review:start https://github.com/OWNER/REPO/pull/123
```

If you know the identifier before creating the primary PR:

```text
$pr-review:start --id DEMO-123
```

The response must show the primary PR first, followed by the auxiliary PRs from bottom to top.

### What to verify on GitHub

- The primary PR is ready, targets `main`, and is the only PR to merge.
- The `[review][ID]` layers are drafts and each asks one question.
- Every auxiliary PR has only the `stack-review:managed` label as its managed identity.
- The `[stack-source][ID]` PR is also a draft.
- The primary PR and `stack-source` use `agent/tutorial-pr-review` and share the same head SHA.
- `stack-source` uses the last internal layer as its base and shows zero changed files.
- The agent provides both equal tree IDs, not only equal SHAs.
- Internal branches no longer exist locally; the source branch does.

Invoking `start` again for the same generation must reuse it instead of duplicating it.

## Step 4: leave human feedback

On the layer that introduces the discount, comment on the total line:

> Add a separate line explaining why the discount is €5.

You can also comment on the primary PR. Keep the thread open: resolution belongs to the reviewer.

## Step 5: apply the feedback

You can pass the primary PR or any auxiliary PR:

```text
$pr-review:feedback 123
```

```text
$pr-review:feedback https://github.com/OWNER/REPO/pull/123
```

If the task already contains the URL or the PR is selected:

```text
$pr-review:feedback
```

### What to verify

- The complete correction reaches `agent/tutorial-pr-review` first and updates the same primary PR.
- The primary PR keeps its title, body, base, labels, reviewers, and state.
- A draft `[feedback][ID]` layer appears immediately below `stack-source`.
- Its body links the original comment and contains the verification evidence.
- The original comment receives a reply with the correcting PR and commit.
- The thread remains open.
- Previous layers keep their numbers, branches, commits, and comments.
- `stack-source` again shows zero files and the same head as the primary PR.
- The local feedback branch disappears after publication is verified.

## Step 6: late feedback and multiple reviewers

After the first correction, leave a new comment on the first layer:

> The product must include a `MUG-DEMO` reference so it can be identified.

Another reviewer can comment on the primary PR at the same time:

> Add a checklist line confirming the product reference.

Invoke again:

```text
$pr-review:feedback
```

The skill must rescan the primary PR and all open layers, including old ones. Comments already
marked as handled do not produce another correction. New comments are grouped by coherence, not by
reviewer or "round".

Invoking `feedback` with no new actionable comments must not mutate branches or PRs.

## Step 7: finish the generation

When review is complete, merge only the primary PR. To discard the demonstration, close it without
merging. Both actions end the generation and trigger `Close PR review stack`.

The Action must:

1. remove native stack membership;
2. close all auxiliary PRs;
3. delete their remote internal branches;
4. preserve the source branch, primary PR, and complete review history.

There is no `close` skill.

### Manual retry

If the Action fails, open **Actions → Close PR review stack → Run workflow**, enter the number of
the closed primary PR, and run it again. Cleanup is idempotent.

## Step 8: reopen a closed PR

An unmerged primary PR can be reopened. Then invoke:

```text
$pr-review:start PRIMARY_PR_URL
```

The skill creates a new generation and leaves the previous one closed. A merged PR cannot start
another generation.

## Quick diagnostics

| Symptom | Action |
| --- | --- |
| `start` or `feedback` is blocked | Merge the PR created by `config` first and check Actions. |
| Publication failed partway through | Repeat the same invocation; the skill inspects and reuses what was already published. |
| New feedback does not appear | Check that the comment is human and actionable, then invoke `feedback` again on any active PR. |
| An auxiliary PR appears mergeable | It must remain a draft and start with a visible role; do not merge it. |
| Local internal branches remain | Execution is incomplete; the skill must verify GitHub and remove them. |
| You closed the primary PR but auxiliaries remain | Retry the workflow manually with the primary PR number. |

## Expected final result

You have used `config`, `start`, and `feedback`; tested new and late comments from multiple
reviewers; verified both views of the same branch; and closed the generation without turning the
auxiliary stack into a second merge path.
