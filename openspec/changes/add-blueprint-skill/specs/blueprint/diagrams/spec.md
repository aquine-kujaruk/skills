# Spec Delta

## Purpose

Defines the closed diagram vocabulary of a `blueprint` package: Mermaid saga state diagrams and the root sequence diagram, readable at a glance like an indented call tree.

## ADDED Requirements

### Requirement: A saga is one Mermaid state diagram in a Markdown file

Each saga SHALL be a `.saga.md` file whose body is a legend line `Blue = command · Green = query` followed by one Mermaid `stateDiagram-v2`. A saga SHALL declare no executable step definitions and SHALL have no wait state.

#### Scenario: Render a previewable saga
- **WHEN** the flow of a session is diagrammed as a saga
- **THEN** the saga is a Markdown file with the legend and one Mermaid state diagram, not TypeScript, plain text or a standalone `.mmd` file

### Requirement: The diagrams use a closed vocabulary

The diagrams SHALL use exactly six primitives, each with one form per diagram:

| Primitive | Saga | Sequence |
| --- | --- | --- |
| step | linked node coloured as command or query | message from the saga lane to its context's lane |
| sub-saga | neutral node linked to its own saga file | grey translucent `rect` with a `Note` naming the sub-saga |
| parallel | composite state `Name (parallel)` with fork and join | `par` block |
| map | composite state `Name (map, concurrency: N)` | `loop` |
| catch | transition labelled `catch <Error>` | `break` block |
| entry and exit | start and end states | the trigger's message to the saga, and the result sent back |

Choices between variants, waits for approval and domain events SHALL NOT appear in either diagram. Saga transitions SHALL carry no data labels; the data crossing contexts appears in the sequence messages.

#### Scenario: Keep excluded constructs out
- **WHEN** the flow waits for the user to approve before `ImplementChange`
- **THEN** `ImplementChange` follows its previous step directly and no node or annotation represents the approval

#### Scenario: Contain a map
- **WHEN** each chapter is processed by `ProcessChapterSaga` one at a time
- **THEN** a composite state `ProcessChapters (map, concurrency: 1)` contains the `ProcessChapter` node

### Requirement: A saga has a single trunk, its successful path

A saga SHALL go from its start state through each step of the successful path once, in order, to its end state. A requested catch is a diversion off the trunk and does not count against it. Containers are named for the business action; a map takes the plural of its inner step.

#### Scenario: Draw each step once
- **WHEN** the flow runs `BuildTimeline`, `PlanChapters`, `GenerateChapters`, `SummarizeSession` and `PublishSession` in order
- **THEN** the diagram passes through each of them once, in that order

### Requirement: Variants are separate sagas

When the flow handles variants with different steps, each variant SHALL have its own saga file, and neither SHALL contain a condition that selects a variant; the entry point chooses which saga to run. A common segment of two or more steps before the variants diverge SHALL be a sub-saga that each variant saga runs first. A common segment of one step SHALL be that reused use case.

#### Scenario: Model audio-only and audiovisual sessions
- **WHEN** audio-only and audiovisual sessions share their first steps and then differ
- **THEN** there are three saga files: the shared sub-saga, and one saga per variant that starts with it

### Requirement: Fill colour tells a command from a query and nothing else

A step whose use case is a command SHALL use `fill:#4C8DF626,stroke:#4C8DF6,stroke-width:2px`. A query step SHALL use `fill:#009E7326,stroke:#009E73,stroke-width:2px`. Sub-saga nodes and composite states SHALL stay neutral. No other meaning SHALL use fill colour: a requested annotation (retry, buffer) or a highlighted risk SHALL be a one-line Mermaid note on its node, without configuration values.

#### Scenario: Colour a command and a query
- **WHEN** `PlanChapters` is a command and `LoadActivity` is a query
- **THEN** `PlanChapters` has the command fill, `LoadActivity` has the query fill, and the legend states which colour is which

#### Scenario: Highlight a risk without fill
- **WHEN** the reviewer asks to highlight the risk that the model returns an invalid summary at `SynthesizeChapter`
- **THEN** the node keeps the command fill and carries a one-line note

### Requirement: Each node is the step's name linked to its file

Each node SHALL be labelled with the step name without role suffix, as an HTML link to the use case or saga file, relative to the saga file (`state "<a href='…'>Name</a>" as Id`).

#### Scenario: Link a use case and a sub-saga
- **WHEN** the saga runs `PlanChaptersUseCase` and `ProcessChapterSaga`
- **THEN** the nodes read `PlanChapters` and `ProcessChapter`, and following them from the Markdown preview opens `chapters/application/commands/plan-chapters.use-case.ts` and `chapters/process-chapter.saga.md`

### Requirement: A sub-saga lives in its own file

A sub-saga SHALL be diagrammed in its own saga file and SHALL appear in its parent as a single node linked to that file.

#### Scenario: Extract chapter processing
- **WHEN** processing one chapter selects its frames and then synthesizes it, and repeating the selection after a synthesis failure is unacceptable
- **THEN** `ProcessChapterSaga` has its own file and the parent shows it as one node

### Requirement: Catch and retry appear only when asked or established

A catch SHALL appear only when the reviewer asks how a failure or finding is handled and the flow continues elsewhere after it. It is drawn as a transition labelled `catch <Error>` from the interrupted step to the alternative step. A step whose failure only fails the saga SHALL have no catch. A retry SHALL appear only when the proposal establishes it or the reviewer asks, and no named retry policy SHALL appear.

#### Scenario: Divert an invalid summary when asked
- **WHEN** the reviewer asks how an invalid summary is handled and the flow then summarizes with a template
- **THEN** a transition `catch InvalidSummary` leads from `SynthesizeChapter` to `SummarizeChapterWithTemplate`

#### Scenario: No catch on a terminal failure
- **WHEN** a failure of `PublishSession` only fails the saga
- **THEN** `PublishSession` has no catch

### Requirement: A saga flow gets one sequence diagram at the package root

A flow coordinated by a saga SHALL have exactly one sequence diagram for its main saga, at the package root. The lanes SHALL appear in this order: the actor that triggers the saga, which sends one message and receives the result; the saga lane, named without its suffix, which sends every message; and then one lane per context. Each use case SHALL be a message to its context's lane. Sub-sagas SHALL be unfolded inside grey `rect` groups with a `Note`. Every lane SHALL be a box with its own translucent fill and solid border, set through `themeCSS`. A flow that is a single use case SHALL have no sequence diagram and no saga.

#### Scenario: Draw the sequence of the session saga
- **WHEN** `ProcessAudiovisualSessionSaga` runs the sub-saga `ProcessChapterSaga` inside a map
- **THEN** the root sequence diagram has lanes for the trigger, `ProcessAudiovisualSession`, evidence, chapters and publication, shows the map as a loop with the sub-saga's steps unfolded inside it, and boxes every lane in colour

#### Scenario: No diagrams for a single use case
- **WHEN** an endpoint invokes a single use case
- **THEN** the package contains that use case, and no saga or sequence diagram
