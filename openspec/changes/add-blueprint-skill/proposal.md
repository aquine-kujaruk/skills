# Proposal

## Why

Code built with AI, often vibe-coded, hides its architecture. An architect who has to review it alone needs to see quickly how one flow is built, and then iterate on improvements. Two hand-made design packages (`.review`, `.review-openspec`) and seven acceptance Features show that a closed set of representation rules gives that view. Today those rules exist only in one long conversation, so each package depends on that conversation and drifts from the others. Capturing the rules as a skill makes every package read the same, whatever the agent and whatever the target.

## What Changes

- New standalone skill **`blueprint`** (user-invoked, like `show-me`). Pointed at existing code, an endpoint, a use case or an imagined flow, it writes a pseudocode design package (use cases split into commands and queries, one repository per context, minimal domain, DTOs between contexts, Mermaid sagas and one sequence view) and then iterates on it under the same rules. The skill writes code for no system and does not depend on OpenSpec.
- `SKILL.md` built on first principles, short and in English: closed universe, layers, the saga/use-case cut, locality, no infrastructure leak, visibility, command/query by essence, a closed diagram vocabulary, and the conversation contract (questions get answers, corrections change the package).
- One disclosed reference, `NOTATION.md`: minimal Mermaid templates for the saga state diagram and the sequence diagram. It earns its place because the exact colours, links, containers and lane boxes are what the model gets wrong without a template.
- Codex interface file `agents/openai.yaml`, with implicit invocation disabled.
- An eval suite derived from the seven Features (`evals/evals.json`), run on three versioned fixtures: the capture-context package, the OpenSpec package, and a pinned snapshot of `m1guelpf/auto-subtitle` as the new "how is this flow built?" case.
- Repository plumbing: a "Standalone skills" entry in `README.md`, and `.gitignore` for the eval workspace.
- The packages the skill produces are **temporary explorations**. They go to a temporary directory, an iteration replaces the package in place, and the agent offers to copy it into the project only when the reviewer wants it as context for changing or writing code.

## Capabilities

### New Capabilities

- `blueprint/representation`: the design package. Its layout, layers, the saga/use-case cut, locality, no infrastructure leak, visibility, command/query classification, contexts and DTOs, naming, fidelity to code with normalization into the universe, and inventing nothing.
- `blueprint/diagrams`: the closed diagram vocabulary. A saga as a Mermaid state diagram with a single trunk, steps, sub-sagas, parallel, map, a catch only when asked, and entry/exit; colour and links; variant sagas; and the root sequence diagram with contexts as lanes.
- `blueprint/conversation`: how the agent behaves across turns. It answers questions (overview and zoom, time estimates, modeling questions, worked examples) without touching the package. It applies corrections everywhere and beyond their example, asks pending decisions one at a time with a recommendation first, and reports code incoherences and iteration deltas in the reply. It also covers the temporary lifecycle of the package.
- `blueprint/evals`: the eval suite that verifies the skill against the Features on the versioned fixtures.

### Modified Capabilities

(none; `openspec/specs/` is empty)

## Impact

- New: `skills/blueprint/` (`SKILL.md`, `NOTATION.md`, `agents/openai.yaml`, `evals/evals.json`, `evals/fixtures/**`). This is the first use of the `skills/<name>/` convention the README announces.
- Edited: `README.md` (catalog entry and install line for standalone skills) and `.gitignore` (`skills/*-workspace/`).
- Published: the fixtures become public. These are the pseudocode design of capture-context's processing flow, the OpenSpec flow package, and 249 MIT-licensed lines of `auto-subtitle` with its license. The reviewer approved this.
- Install footprint: about 60 KB of eval fixtures travel with each install of the skill; only `SKILL.md` loads at runtime.
- No changes to the `webapp` or `pr-review` plugins or to the marketplace catalogs. No new runtime dependencies.
