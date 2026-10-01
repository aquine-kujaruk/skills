`@ai`
# Feature: Answer a modeling question about the design

Both use cases and sagas orchestrate. A use case coordinates domain objects and
its context's repository as one all-or-nothing unit. A saga coordinates use
cases and keeps durable progress between them in its own serialized state:
the output of each step. A save through a repository persists domain data; it
is not what makes a step resumable. The reviewer asks where a piece
of orchestration, a retry or a limit belongs, or how something would be
modeled; the agent answers from the design without changing it.

Open decisions:
- Whether cheap local recomputation, such as deriving frame candidates, stays
  inside the use case that needs it.
- Whether the design mirrors the save points of an existing implementation or
  derives them only from this rule.

## Rule: A unit is cut into saga steps where repeating its earlier work after a later failure is unacceptable

### Scenario Outline: Split `<useCase>` when repeating `<earlierWork>` is unacceptable

* Given the use case "`<useCase>`" performs "`<earlierWork>`" and then "`<laterWork>`"
* And repeating "`<earlierWork>`" after a failure of "`<laterWork>`" is unacceptable
* When the reviewer asks whether "`<useCase>`" should be split
* Then the answer is that "`<useCase>`" becomes two use cases joined by a saga transition
* And the design files remain unchanged

#### Examples:

  | useCase               | earlierWork              | laterWork               |
  | ProcessChapterUseCase | scoring images with Prem | summarizing with OpenAI |

### Scenario Outline: Keep `<useCase>` whole when repeating `<earlierWork>` is acceptable

* Given the use case "`<useCase>`" performs "`<earlierWork>`" and then "`<laterWork>`"
* And repeating "`<earlierWork>`" after a failure of "`<laterWork>`" is acceptable
* When the reviewer asks whether "`<useCase>`" should be split
* Then the answer is that "`<useCase>`" remains one use case
* And the design files remain unchanged

#### Examples:

  | useCase                    | earlierWork                  | laterWork                |
  | SelectChapterFramesUseCase | loading the chapter evidence | scoring images with Prem |

### Scenario Outline: Recognize `<composite>`, which runs `<inner>` for each `<item>`, as a saga

* Given the use case "`<composite>`" runs "`<inner>`" for each `<item>`
* When the reviewer asks whether "`<composite>`" is a use case
* Then the answer is that "`<composite>`" is a saga mapping "`<inner>`" over each `<item>`
* And the design files remain unchanged

#### Examples:

  | composite              | inner                 | item    |
  | ProcessChaptersUseCase | ProcessChapterUseCase | chapter |

## Rule: The saga's serialized state, not a repository save, makes a step resumable

### Scenario Outline: Accept `<useCase>`, which saves nothing, as a saga step

* Given the use case "`<useCase>`" returns "`<output>`" without saving it through a repository
* And "`<nextUseCase>`" needs "`<output>`"
* When the reviewer asks whether "`<useCase>`" is a valid saga step
* Then the answer is that "`<useCase>`" is a valid saga step
* And the answer states that the saga keeps "`<output>`" in its serialized state until "`<nextUseCase>`" runs
* And the design files remain unchanged

#### Examples:

  | useCase                 | output         | nextUseCase             |
  | PrepareNarrationUseCase | the narration  | BuildTimelineUseCase    |
  | SummarizeSessionUseCase | the summary    | PublishSessionUseCase   |

## Rule: A failure is handled where the information to decide its handling lives

### Scenario Outline: Place the handling of `<failure>` in the `<location>`

* Given the flow can meet the failure "`<failure>`"
* When the reviewer asks where handling "`<failure>`" belongs
* Then the answer places it in the `<location>` as `<handling>`

#### Examples:

  | failure                                                              | location   | handling                                 |
  | a provider rejects one repeatable call as temporarily unavailable    | repository | a repeated call                          |
  | processing a whole chapter fails                                     | saga       | a retry of that step alone               |
  | a model returns an invalid summary and a template alternative exists | saga       | a catch leading to the template use case |

## Rule: A provider's limits belong to the repository; the order of business units belongs to the saga

### Scenario Outline: Place `<limit>` in the `<location>`

* Given the flow is subject to "`<limit>`"
* When the reviewer asks where "`<limit>`" belongs
* Then the answer places it in the `<location>`

#### Examples:

  | limit                                             | location   |
  | the provider accepts at most 4 simultaneous calls | repository |
  | chapters are processed one after another          | saga       |

## Rule: A question about how something would be modeled is answered with a worked example

### Scenario Outline: Show how `<construct>` would be modeled without editing the design

* Given the design has no "`<construct>`"
* When the reviewer asks how "`<construct>`" would be modeled
* Then the answer shows a worked example of "`<construct>`" applied to the design
* And the design files remain unchanged

#### Examples:

  | construct                                              |
  | a choice between audio-only and audiovisual processing |
