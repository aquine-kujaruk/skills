`@ai`
# Feature: Diagram a business flow as a saga

A saga coordinates use cases, possibly from several contexts, to complete a
business flow. It sits above the application and domain layers. Its diagram
borrows the primitives of state machines such as AWS Step Functions — task,
parallel, map, choice, retry and catch — without building an executable
definition. Its readability bar is an indented call tree: a human grasps the
flow at a glance.

Open decisions:
- How an established retry is annotated in the diagram.
- How a choice between sagas is drawn, and whether the steps before a fork
  form a saga of their own ("3 sagas" for 2 branches).
- Whether a catch edge counts against the single trunk.
- Who decides that a batch, buffer, rate limit or concurrency is needed
  without an explicit request: "make evident what is obviously necessary"
  versus "only when needed". Retry and catch follow the rules below.
- Which context hosts a saga that runs use cases of several contexts (the
  worked example uses the context owning the saga's outcome).
- How composite states are named, and whether transitions show the data
  passed between steps.

## Rule: A saga is a Mermaid state diagram inside a Markdown file

### Scenario: Render the saga as a previewable Mermaid state diagram

* Given the proposal's flow prepares evidence, plans and processes chapters, and publishes the session
* When the saga of the flow is diagrammed
* Then the saga is a Markdown file containing one Mermaid state diagram
* And the saga is not written as TypeScript, plain text or a standalone Mermaid file
* And the saga declares no executable step definitions
* And the saga has no wait state

## Rule: A saga has a single trunk, its successful path

### Scenario: Draw each step once along the successful path

* Given the proposal's flow runs these steps in order:
  | step                    |
  | BuildTimelineUseCase    |
  | PlanChaptersUseCase     |
  | GenerateChaptersUseCase |
  | SummarizeSessionUseCase |
  | PublishSessionUseCase   |
* When the saga of the flow is diagrammed
* Then the diagram goes from its start state through each step once, in that order, to its end state

### Scenario Outline: Give `<firstVariant>` and `<secondVariant>` sagas of their own

* Given the proposal handles "`<firstVariant>`" and "`<secondVariant>`" with different steps
* When the sagas of the flow are diagrammed
* Then the saga of "`<firstVariant>`" and the saga of "`<secondVariant>`" are separate files
* And neither saga contains a condition that selects between "`<firstVariant>`" and "`<secondVariant>`"
* And each saga reuses the use cases both variants share

#### Examples:

  | firstVariant          | secondVariant       |
  | audio-only session    | audiovisual session |
  | business customer     | individual customer |

### Scenario Outline: Leave the approval of `<approver>` before `<nextStep>` out of the successful path

* Given the flow waits for "`<approver>`" to approve before "`<nextStep>`"
* When the saga of the flow is diagrammed
* Then "`<nextStep>`" follows its previous step directly
* And no node or annotation represents the approval

#### Examples:

  | approver | nextStep        |
  | the user | ImplementChange |

## Rule: Parallel and map steps are containers holding their inner steps

### Scenario Outline: Contain `<firstStep>`, `<secondStep>` and `<thirdStep>` in a parallel state

* Given the proposal runs "`<firstStep>`", "`<secondStep>`" and "`<thirdStep>`" independently before "`<nextStep>`"
* When the saga of the flow is diagrammed
* Then a composite state marked as parallel contains "`<firstStep>`", "`<secondStep>`" and "`<thirdStep>`"
* And "`<nextStep>`" follows the composite state

#### Examples:

  | firstStep            | secondStep              | thirdStep           | nextStep             |
  | PrepareImagesUseCase | PrepareNarrationUseCase | LoadActivityUseCase | BuildTimelineUseCase |

### Scenario Outline: Contain the per-item step in a map state with concurrency `<concurrency>`

* Given the proposal processes each "`<item>`" with "`<perItemStep>`", `<concurrency>` at a time
* When the saga of the flow is diagrammed
* Then a composite state marked as a map with concurrency `<concurrency>` contains "`<perItemStep>`"

#### Examples:

  | item    | perItemStep        | concurrency |
  | chapter | ProcessChapterSaga | 1           |

## Rule: A catch appears only where something interrupts a step and diverts it to another flow — a failure or a finding — and only when the reviewer asks about it

### Scenario Outline: Divert `<failure>` from `<failingStep>` to `<alternativeStep>`

* Given "`<failingStep>`" can fail with "`<failure>`"
* And after that failure the flow continues with "`<alternativeStep>`"
* And the reviewer asked how "`<failure>`" is handled
* When the saga of the flow is diagrammed
* Then a transition identified as the catch of "`<failure>`" leads from "`<failingStep>`" to "`<alternativeStep>`"

#### Examples:

  | failingStep              | failure        | alternativeStep                     |
  | SynthesizeChapterUseCase | InvalidSummary | SummarizeChapterWithTemplateUseCase |
  | ImplementTasks           | DesignIssueDiscovered | AbsorbDiscoverySaga            |

### Scenario Outline: Leave `<step>` without a catch when its failure only fails the saga

* Given a failure of "`<step>`" only makes the saga fail
* When the saga of the flow is diagrammed
* Then "`<step>`" has no catch annotation

#### Examples:

  | step                  |
  | PublishSessionUseCase |

### Scenario Outline: Leave `<step>` without a retry the proposal does not establish

* Given the proposal establishes no retry for "`<step>`"
* When the saga of the flow is diagrammed
* Then "`<step>`" has no retry annotation
* And no named retry policy appears in the diagram

#### Examples:

  | step                     |
  | SynthesizeChapterUseCase |

### Scenario Outline: Annotate `<annotation>` on `<step>` when the reviewer asks for it

* Given the reviewer asks to show that "`<step>`" is subject to `<annotation>`
* When the saga of the flow is diagrammed
* Then the node of "`<step>`" carries the `<annotation>` annotation
* And no use case or domain type expresses `<annotation>`

#### Examples:

  | step                 | annotation |
  | ProcessChapterSaga   | buffer     |

## Rule: A node's fill colour tells a command from a query, and no other meaning uses fill colour

### Scenario Outline: Fill the node of `<stepName>` with the `<kind>` colour

* Given the step "`<stepName>`" runs a use case that is a `<kind>`
* When the saga of the flow is diagrammed
* Then the node of "`<stepName>`" has the `<kind>` fill colour
* And the diagram tells which colour means command and which means query

#### Examples:

  | stepName     | kind    |
  | PlanChapters | command |
  | LoadActivity | query   |

### Scenario: Leave sub-sagas and composite states without a command or query colour

* Given the saga runs the sub-saga "ProcessChapterSaga" inside a map and two use cases inside a parallel state
* When the saga of the flow is diagrammed
* Then the node of the sub-saga has neither the command nor the query fill colour
* And neither composite state has the command or the query fill colour

### Scenario: Express a highlighted risk without changing the fill colour

* Given the step "SynthesizeChapter" runs a command
* And the reviewer asked to highlight the risk that the model returns an invalid summary
* When the saga of the flow is diagrammed
* Then the node of "SynthesizeChapter" keeps the command fill colour
* And the risk is not expressed through fill colour

## Rule: Each node shows the step's name, without a role suffix, and links to its use case or saga file

### Scenario Outline: Label the node `<stepName>` and link it to `<file>`

* Given the saga runs the step "`<name>`" declared in "`<file>`"
* When the saga of the flow is diagrammed
* Then the node is labeled "`<stepName>`"
* And following the label of the node from the Markdown preview opens "`<file>`"

#### Examples:

  | name                | stepName       | file                                                    |
  | PlanChaptersUseCase | PlanChapters   | chapters/application/commands/plan-chapters.use-case.ts |
  | ProcessChapterSaga  | ProcessChapter | chapters/process-chapter.saga.md                        |

## Rule: A sub-saga lives in its own file and appears in its parent as one node

### Scenario: Extract the chapter processing into a sub-saga

* Given processing one chapter selects its frames and then synthesizes it
* And repeating the frame selection after a synthesis failure is unacceptable
* When the saga of the flow is diagrammed
* Then "ProcessChapterSaga" is diagrammed in its own file
* And the parent saga shows chapter processing as a single node linked to that file

## Rule: A saga lives in one context and may run use cases of other contexts

### Scenario: Host a saga that runs use cases of several contexts in one of them

* Given the saga "ProcessAudiovisualSessionSaga" runs use cases of these contexts:
  | context     |
  | evidence    |
  | chapters    |
  | publication |
* When the saga of the flow is diagrammed
* Then the file of "ProcessAudiovisualSessionSaga" is in the folder of exactly 1 of those contexts
* And its nodes link to use cases of all 3 contexts

## Rule: A flow with a saga also gets one sequence diagram at the package root, with contexts as lanes

### Scenario Outline: Draw the sequence of `<saga>` with its sub-sagas unfolded

* Given the flow is coordinated by "`<saga>`", which runs the sub-saga "`<subSaga>`"
* When the saga of the flow is diagrammed
* Then the package root contains one sequence diagram for "`<saga>`"
* And the first lane is the actor that triggers "`<saga>`", which sends it one message and receives its result
* And the second lane is named after "`<saga>`" without its role suffix and sends every message to the contexts
* And each context is a lane and each use case is a message to its context's lane
* And the steps of "`<subSaga>`" appear unfolded inside it
* And maps appear as loops and parallel states as parallel blocks
* And every lane is a box with its own translucent fill and solid border colour

#### Examples:

  | saga                          | subSaga            |
  | ProcessAudiovisualSessionSaga | ProcessChapterSaga |

### Scenario: Draw no sequence diagram for a flow that is a single use case

* Given an endpoint invokes a single use case without a saga
* When the design of the flow is produced
* Then the package contains no sequence diagram for that flow

## Rule: The diagrams use a closed vocabulary of six primitives

### Scenario Outline: Draw a `<primitive>` as `<sagaForm>` in the saga and as `<sequenceForm>` in the sequence

* Given the flow contains a `<primitive>`
* When the saga of the flow is diagrammed
* Then the saga diagram shows it as `<sagaForm>`
* And the sequence diagram shows it as `<sequenceForm>`

#### Examples:

  | primitive       | sagaForm                                         | sequenceForm                                                  |
  | step            | a linked node coloured as command or query       | a message from the saga lane to its context's lane            |
  | sub-saga        | a neutral node linked to its own saga file       | a translucent group labelled with the sub-saga's name         |
  | parallel        | a composite state with a fork and a join         | a parallel block                                              |
  | map             | a composite state marked as a map with its concurrency | a loop                                                 |
  | catch           | a transition identified as the catch of an error | a break block                                                 |
  | entry and exit  | the start and end states                         | the trigger's message to the saga and the result sent back    |

### Scenario Outline: Keep `<excluded>` out of the diagrams

* Given the flow involves `<excluded>`
* When the saga of the flow is diagrammed
* Then neither diagram has an element for `<excluded>`

#### Examples:

  | excluded                                   |
  | a choice between variants                  |
  | a wait for an approval                     |
  | a domain event                             |
