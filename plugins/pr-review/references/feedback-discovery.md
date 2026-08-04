# Feedback discovery

Inspect the primary PR and every auxiliary PR carrying the active generation marker. Collect four GitHub surfaces:

1. review threads and inline comments through GraphQL;
2. submitted reviews and their bodies;
3. issue-style PR conversation comments;
4. existing feedback PR bodies and source-comment replies.

Use stable node IDs when available and REST database IDs otherwise. Store each item with its URL, author, PR number, path/line when present, timestamp, body, thread state, and current code context.

## Classification

An item is actionable when a human asks for a code, documentation, test, behavior, or review-presentation change. Resolved threads may still be actionable if no correction marker exists; thread resolution is reviewer state, not implementation evidence.

Exclude bot output, approvals without requested changes, acknowledgements, status-only discussion, and the agent's own correction replies. General comments have no native resolution state; classify them by content.

An item is already handled only when an active feedback PR contains its exact marker:

```html
<!-- pr-review:feedback-id=STABLE_ID -->
```

Do not infer handling from similar wording, a closed historical generation, a reply, or a commit message.

## Coherent corrections

Group items that need the same implementation and verification. Split unrelated concerns. Each feedback PR body includes:

```markdown
## Review question

Does this correction address …?

## Source feedback

- COMMENT_URL — short paraphrase

## Verification

- command or observable result

<!-- pr-review:primary=123 -->
<!-- pr-review:generation=PR-123-0123456789ab -->
<!-- pr-review:role=feedback -->
<!-- pr-review:feedback-id=STABLE_ID -->
```

After publication, reply at the original surface with the feedback PR URL and correcting commit URL. Use the matching REST or GraphQL reply operation for inline comments; use a normal PR comment for general feedback. Keep the source thread's resolution unchanged.

Completion requires every newly actionable stable ID to appear exactly once across the new correction bodies and every source item to have a navigable correction reply.
