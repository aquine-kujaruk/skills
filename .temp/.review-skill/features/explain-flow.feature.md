`@ai`
# Feature: Explain a flow at the requested zoom

Before or while designing, the reviewer builds an understanding of a flow by
zooming in progressively: the whole flow, then a worked example, then one
component. The agent answers at the requested level without producing the
design package.

Open decision:
- Whether this exploration is part of the skill or a separate, preceding one.

## Rule: The overview shows the whole flow with its main parts, inputs, branches and secondary events

### Scenario: Explain the whole recording flow

* Given the flow runs from recording to the agent reading the result
* When the reviewer asks to explain the whole flow
* Then the explanation names the main parts of the flow and how they connect
* And the explanation names the inputs of the flow
* And the explanation names the branches and secondary events of the flow
* And the design package remains unchanged

## Rule: A worked example follows the successful path of a real run with representative, not exact, figures

### Scenario Outline: Walk through a run of `<duration>` with representative counts

* Given a real run lasted `<duration>` and made `<modelCalls>` model calls
* When the reviewer asks for the successful path of that run as a worked example
* Then the explanation shows the components, their connections and the order of their interactions
* And it states counts as representative orders of magnitude rather than an exhaustive tally of `<modelCalls>` calls

#### Examples:

  | duration  | modelCalls |
  | 28 min    | 267        |

## Rule: A zoom lists the sub-components and processes of one component, their relations and their order

### Scenario Outline: Zoom into `<component>`

* Given the overview named the component "`<component>`"
* When the reviewer asks to zoom into "`<component>`"
* Then the explanation lists the sub-components and processes of "`<component>`"
* And it states which processes run in sequence and which run in parallel

#### Examples:

  | component |
  | processor |
