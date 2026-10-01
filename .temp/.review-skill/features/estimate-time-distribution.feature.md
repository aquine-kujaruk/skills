`@ai`
# Feature: Estimate where the time of a flow goes

The reviewer asks where the time of a flow goes, to see at a glance which step
dominates. The agent names each measured time, composes them in a legend, and
states each part as an estimated share of its enclosing time.

Open decisions:
- Whether these annotations belong in the design package (saga diagrams, use
  cases) or only in the answer.
- Whether work that overlaps another measured time is left out of the total
  to avoid counting it twice.

## Rule: Each measured time has a named symbol, and a legend composes the symbols into the total

### Scenario Outline: Compose the total time from a symbol for one `<item>`

* Given the flow waits for pending evidence, then processes each `<item>` one after another, then publishes
* When the reviewer asks where the time of the flow goes
* Then the answer defines a named symbol for the time of one `<item>`
* And the answer defines a named symbol for the total time
* And the answer's legend expresses the total as the evidence wait, plus the time of one `<item>` for each pending `<item>`, plus publishing

#### Examples:

  | item    |
  | chapter |

## Rule: A share is an estimated percentage of its enclosing time

### Scenario Outline: Express `<part>` as a percentage of `<whole>`

* Given "`<whole>`" includes "`<part>`"
* When the reviewer asks where the time of the flow goes
* Then the share of "`<part>`" is an estimated percentage between 0 and 100 of "`<whole>`"

#### Examples:

  | part              | whole                     |
  | chapter synthesis | the time of one chapter   |
  | pending evidence  | the total time of the flow |

## Rule: The legend describes the generic flow, not the run that illustrated it

### Scenario Outline: Count pending chapters instead of the `<runPending>` of one run

* Given the flow was explored with a run in which `<runProcessed>` of `<runTotal>` chapters were processed when recording stopped
* When the reviewer asks where the time of the flow goes
* Then the legend multiplies the time of one chapter by the number of pending chapters
* And the legend does not fix the number of pending chapters at `<runPending>`

#### Examples:

  | runProcessed | runTotal | runPending |
  | 4            | 7        | 3          |
