# Webapp

An agentic workflow that lets a non-technical person create, adopt, and evolve a web application
through natural-language requests. The plugin keeps production operational, turns each request
into verifiable work, and guides the steps that require human intervention.

## Install in Codex

```bash
codex plugin marketplace add aquine-kujaruk/skills --ref main
codex plugin add webapp@aquine-skills
```

Start a new task with `$webapp:setup`, `$webapp:adopt`, or `$webapp:next`.

## Install in Claude Code

```text
/plugin marketplace add aquine-kujaruk/skills
/plugin install webapp@aquine-skills
```

Run `/reload-plugins` if requested. The main invocations are `/webapp:setup`, `/webapp:adopt`, and
`/webapp:next`.

## Main workflow

| Skill | Purpose |
| --- | --- |
| `setup` | Creates and deploys a new application. |
| `adopt` | Adopts an existing application without disrupting production. |
| `next` | Turns a request into a deployed, verified change. |
| `migrate` | Moves data with verification and rollback. |
| `gaps` | Identifies an important missing capability that nobody requested. |
| `graphify` | Builds a map of repository relationships. |

For a new application, install the plugin and ask it to set up the project. For an existing
application, open its repository and ask it to adopt the project. Then describe each change in your
own words; `next` organizes implementation, verification, and deployment.
