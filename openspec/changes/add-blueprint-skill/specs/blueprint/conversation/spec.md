# Spec Delta

## Purpose

Defines how `blueprint` behaves across a review conversation: where the temporary package lives, which turns only answer, how corrections change the package, and how decisions reach the reviewer.

## ADDED Requirements

### Requirement: The skill runs on request and writes a temporary package

The skill SHALL run only when the reviewer invokes it by name. It SHALL write the package to a temporary directory (`<tmp>/blueprint/<flow>/`) and tell the reviewer where it is. It SHALL offer to copy the package into the project only when the reviewer wants to use it as context for changing or writing code. The skill SHALL write code for no system.

#### Scenario: Write outside the project
- **WHEN** the reviewer asks how a flow of a repository is built
- **THEN** the package is written under the temporary directory, no file of the repository changes, and the reply gives the package path

### Requirement: Questions about the design get answers and leave the package unchanged

Two kinds of turn write the package: a request to represent ("how is this flow built", "design this flow", "how does the flow handle this failure") and a correction. Any other question SHALL be answered in the reply, and every package file SHALL stay unchanged. This covers the following kinds of question:

- **Overview**: the main parts and how they connect, the inputs, branches and secondary events.
- **Worked example**: the components, connections and order along the successful path of a run, with representative orders of magnitude rather than exact tallies.
- **Zoom**: the sub-components and processes of one component, which run in sequence and which in parallel.
- **Modeling question**: where a retry, a limit or a piece of orchestration belongs, or whether a unit should be split.
- **"How would X be modeled"**: a worked example applied to the design.
- **Time distribution**: a named symbol for each measured time, a legend that composes them into the total, and each part as an estimated percentage between 0 and 100 of its enclosing time. The legend multiplies per-item times by generic counts, not by those of one run, and sums only the critical path, without counting overlapping work twice.

#### Scenario: Answer a modeling question
- **WHEN** the reviewer asks where "the provider accepts at most 4 simultaneous calls" and "chapters are processed one after another" belong
- **THEN** the reply places the first in the repository and the second in the saga, and no package file changes

#### Scenario: Show how a choice would be modeled
- **WHEN** the reviewer asks how a choice between audio-only and audiovisual processing would be modeled
- **THEN** the reply shows a worked example with one saga per variant and no choice element, and no package file changes

#### Scenario: Estimate where the time goes
- **WHEN** the flow waits for pending evidence, processes each pending chapter one after another, then publishes, and it was explored with a run where 4 of 7 chapters were done
- **THEN** the legend reads like `T = t_wait + n_pending × t_ch + t_pub`, does not fix `n_pending` at 3, and states shares such as chapter synthesis as a percentage of `t_ch`

### Requirement: The reply reports normalizations, suggestions and deltas

When the package normalizes something the code does against a rule, the reply SHALL list each deviation. Examples are a use case calling another, a query that writes state, and a command named like a query. When the agent sees something the reviewer may want but the code and the request lack, such as a batch, a buffer, a rate limit, or a split of a context whose repository grew too wide, the reply SHALL suggest it without drawing it until the reviewer accepts. When an iteration changes the package, the reply SHALL summarize what changed.

#### Scenario: Report a misnamed query
- **WHEN** the code calls `prepareImages` a command but it changes no state
- **THEN** the package places it in `queries/` and the reply names the deviation

### Requirement: Corrections reach the whole package

A correction SHALL be applied to every affected occurrence across use cases, repositories, domain, DTOs, sagas and the sequence diagram, leaving every link and import resolving. A term the reviewer dictates SHALL be read as the design term it transcribes ("CTO" as DTO, "Share" as `shared`). An iteration SHALL replace the package in place.

#### Scenario: Replace an element everywhere
- **WHEN** the reviewer asks to replace `ProcessChapterUseCase` with `ProcessChapterSaga`
- **THEN** no file refers to `ProcessChapterUseCase` and every saga node link resolves

#### Scenario: Read a dictated term
- **WHEN** the reviewer says "rename the image CTO in Share"
- **THEN** the correction applies to `ImageDTO` in `shared/dtos.ts` and its imports

### Requirement: A correction's principle is applied beyond its example

When the reviewer rejects an element because of a principle, every element that the principle clearly covers SHALL be corrected too. An element that matches the principle only under an interpretation the reviewer has not confirmed SHALL be kept and presented as a pending decision.

#### Scenario: Remove a clearly covered case
- **WHEN** the reviewer rejects "a delay of 1000 ms" because configuration values are not pseudocode, and the package also has "a retry count of 2"
- **THEN** neither value remains

#### Scenario: Flag an unconfirmed case
- **WHEN** the reviewer rejects `scoreGrid` because grids are how the provider is fed, and the package also transcribes audio in fragments
- **THEN** `scoreGrid` is gone and transcribing in fragments is presented as a pending decision

### Requirement: Decisions go to the reviewer one at a time

When work leaves decisions to the reviewer, the agent SHALL ask exactly one question per turn, listing the recommended option first with its reason. The package SHALL keep its state for that decision until the reviewer answers. When a correction contradicts an earlier accepted rule, the agent SHALL name both and ask which governs before changing the package.

#### Scenario: Ask one of two open decisions
- **WHEN** a correction leaves two decisions open
- **THEN** the reply asks exactly one question with the recommended option first and why

#### Scenario: Surface a contradiction
- **WHEN** the reviewer asks to move `SummarizeSession` to commands because it calls a paid model, contradicting "an expensive query is still a query"
- **THEN** the agent names both rules, asks which governs, and leaves the package unchanged
