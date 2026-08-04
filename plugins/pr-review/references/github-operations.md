# GitHub stack operations

Replace uppercase placeholders with inspected values. Use `--repo OWNER/REPO` on every `gh` command when the current checkout is ambiguous.

## Preflight

```bash
git status --short
git fetch --prune origin
gh auth status
gh stack --version
gh api repos/OWNER/REPO --jq '{default_branch,permissions}'
```

Require a same-repository source branch. Freeze its commit and tree, then create a temporary recovery ref:

```bash
source_sha=$(git rev-parse SOURCE)
source_tree=$(git rev-parse "${source_sha}^{tree}")
git update-ref "refs/pr-review/safety/${source_sha}" "$source_sha"
```

## Primary PR

Locate every open or closed PR whose head is the source branch. Select the open PR to the requested destination when unique. Preserve all metadata when it exists.

Create only when absent:

```bash
git push -u origin SOURCE
gh pr create --repo OWNER/REPO --base DESTINATION --head SOURCE --title TITLE --body-file BODY
```

If creation defaults to draft, use `gh pr ready NUMBER`. Never use that command on an existing primary.

## Reconstruct layers

Start the first generated branch at `origin/DESTINATION`; start each later branch at the previous generated branch. Apply only the coherent slice for that layer, stage exact paths, and create one descriptive commit. Never cherry-pick source commits merely to mimic the original history.

For each generated branch:

```bash
git switch --create GENERATED BASE
# Apply the exact slice.
git diff --check
git add -- PATHS
git commit -m "QUESTION"
git push -u origin GENERATED
gh pr create --repo OWNER/REPO --draft --base BASE_BRANCH --head GENERATED --title TITLE --body-file BODY
gh pr edit NUMBER --repo OWNER/REPO --add-label MANAGED_LABEL
```

Before continuing, verify the PR is draft, its base/head are exact, its body has all identity markers, and its label exists.

After the final content layer, prove the tree matches the frozen source:

```bash
reconstructed_tree=$(git rev-parse 'GENERATED^{tree}')
test "$reconstructed_tree" = "$source_tree"
```

## Attach the source structurally

Switch to the source branch and merge the internal top with `ours`. This records ancestry without changing the source tree:

```bash
git switch SOURCE
before_tree=$(git rev-parse 'HEAD^{tree}')
git merge --no-ff -s ours GENERATED -m "Attach review reconstruction"
test "$(git rev-parse 'HEAD^{tree}')" = "$before_tree"
git push origin SOURCE
```

Create a second PR from that same source branch to the internal top. Mark it draft explicitly even if GitHub reuses defaults:

```bash
gh pr create --repo OWNER/REPO --draft --base GENERATED --head SOURCE --title TITLE --body-file BODY
gh pr ready --undo NUMBER --repo OWNER/REPO
gh pr edit NUMBER --repo OWNER/REPO --add-label MANAGED_LABEL
```

Verify the primary and stack-source PR have the same head SHA. Verify the stack-source PR reports `isDraft: true` and zero files:

```bash
gh pr view NUMBER --repo OWNER/REPO --json isDraft,headRefOid,files
```

## Link native stack membership

Pass PR numbers bottom-to-top to the official extension:

```bash
gh stack link PR1 PR2 PR3 STACK_SOURCE
```

Read the resulting stack through the REST API and compare the ordered PR numbers with the intended chain:

```bash
gh api "repos/OWNER/REPO/stacks?pull_request=STACK_SOURCE"
```

If a command fails, inspect the remote state before retrying. A reported error may follow a successful remote mutation.

## Insert feedback below stack-source

Preserve every published PR and internal branch. Record the existing stack order, unstack the native container, retarget only the stack-source PR to the final new feedback branch, and link all original PRs plus the new PRs plus stack-source:

```bash
gh stack unstack STACK_NUMBER
gh pr edit STACK_SOURCE --repo OWNER/REPO --base FINAL_FEEDBACK_BRANCH
gh stack link ORIGINAL_BOTTOM ... NEW_FEEDBACK ... STACK_SOURCE
```

The stack number may change; PR numbers, comments, reviews, commits, and original internal branches remain stable. Confirm the new order through the API.

## Remove transient local refs

After all remote checks pass, switch to the source branch and remove every generated local branch created during this run. Use `git branch -d` where ancestry permits and `git update-ref -d refs/heads/NAME` only after confirming its remote PR and commit. Then remove the safety ref:

```bash
git update-ref -d "refs/pr-review/safety/${source_sha}"
```

Success requires `git for-each-ref refs/heads/review refs/heads/feedback` to show no branch created by the run. Preserve unrelated local branches.
