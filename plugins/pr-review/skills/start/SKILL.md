---
name: start
description: Start PR review when a finished source branch or primary PR needs one merge target plus a parallel all-draft layered stack.
---

# Start PR review

## 1. Establish the contract

Read [`review-contract.md`](../../references/review-contract.md) completely. Read [`configuration.md`](../../references/configuration.md) for the activation gate and [`github-operations.md`](../../references/github-operations.md) before any GitHub mutation. Resolve arguments, repository, default branch, destination, source branch, primary PR, project naming policy, identifier, and active generation.

Complete when the configuration gate passes and each resolved identity is backed by local Git and GitHub evidence.

## 2. Freeze the source

Require a clean source-branch scope and same-repository head. Fetch remote state, verify every intended source commit is published or publishable, record the source SHA/tree, and create the temporary safety ref from `github-operations.md`. If a valid active generation already exists, verify it and return it rather than duplicating it.

Create the primary PR only when absent. Make a new primary ready and apply its known identifier at creation; preserve every field of an existing primary.

Complete when one ready primary PR points from the frozen source to the destination and its metadata contract is satisfied.

## 3. Design review layers

Partition the complete destination-to-source diff by reviewer bandwidth using `review-contract.md`. Start from concepts and dependency order, then assess conceptual breadth, human-authored churn, substantive files and subsystems, context closure, navigation cost, and intermediate-tree validity. Treat size measurements as warnings, never quotas or universal limits.

Recursively split a broad layer only when the result gives independently understandable, valid questions with less context to hold at once. Coalesce micro-layers that ask the same question. Stop when another split would fragment one conceptual unit, force cross-PR context reconstruction, or invalidate the intermediate tree; record that reason for any unusually broad layer. Do not target a preferred number of PRs.

Use configured titles and branches. Prepare bodies with identity markers, one explicit review question, and the resumption cue required by the contract: why this layer, what it depends on, and what validates it.

Complete when every changed line belongs to exactly one planned layer, every layer has one review question and resumption cue, each bandwidth warning is resolved by a coherent split or explicit stop reason, and the ordered plan reconstructs the complete source tree.

## 4. Publish the parallel stack

Follow `github-operations.md` to reconstruct and publish each internal layer. Make every auxiliary PR draft, label it with the single managed label, and verify its markers before continuing. Prove the final internal tree equals the frozen source tree.

Attach the internal top to the source branch with the verified structural merge. Create the distinct stack-source PR from that same source branch, explicitly make it draft, label it, and link all auxiliary PRs bottom-to-top with `gh stack`.

Complete when GitHub shows the intended all-draft order, every auxiliary PR is marked, the primary and stack-source heads match, their reconstructed/source tree IDs match, and the stack-source PR has zero changed files.

## 5. Remove local stack branches

Reinspect the complete remote state, then remove only the generated local branches and temporary safety ref created by this run. Preserve the source and unrelated branches.

Complete when no managed local branch from this generation remains and the source branch is checked out.

## 6. Report

Return the primary PR URL first, then auxiliary URLs bottom-to-top. Include one question and bandwidth summary per layer, any stop reason for a broad layer, identifier/generation, stack number, tree-equality evidence, zero-file evidence, and local-ref cleanup evidence. Make clear that only the primary PR is mergeable.

Complete when the GitHub review can proceed from the response alone.
