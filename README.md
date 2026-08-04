# Aquine plugins and skills

Public repository for distributing plugins and standalone skills. Each plugin is a self-contained
package for Codex and Claude Code. A skill only appears outside a plugin when it is published
independently.

## Catalog

| Plugin | Purpose | Documentation |
| --- | --- | --- |
| `webapp` | Guides a non-technical person from an idea or existing application to deployed, verified changes. | [Install and use](plugins/webapp/README.md) |
| `pr-review` | Keeps one primary merge PR and a parallel draft stack for reviewing the change in layers. | [Install and use](plugins/pr-review/README.md) |

## Quick installation

### Codex

Register the catalog once, then install only the plugin you need:

```bash
codex plugin marketplace add aquine-kujaruk/skills --ref main
codex plugin add webapp@aquine-skills
codex plugin add pr-review@aquine-skills
```

You can also install them from `/plugins` after registering the catalog.

### Claude Code

```text
/plugin marketplace add aquine-kujaruk/skills
/plugin install webapp@aquine-skills
/plugin install pr-review@aquine-skills
```

Run `/reload-plugins` if Claude Code requests it. Start a new task after installing or updating a
plugin.

## Structure

```text
plugins/webapp/      # self-contained plugin
plugins/pr-review/   # self-contained plugin
.agents/plugins/     # Codex catalog
.claude-plugin/      # Claude Code catalog
```

Future plugins will use `plugins/<name>/`. Future standalone skills will use `skills/<name>/` and
will not duplicate plugin content.
