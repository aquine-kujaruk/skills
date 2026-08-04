# Claude Code project instructions

Read and follow `AGENTS.md` before changing this repository. It is the canonical contributor contract.

Claude-specific notes:

- The plugin loads the canonical skills from `skills/`; do not copy them into `.claude/skills` inside this repository.
- A root `CLAUDE.md` guides development of this repository but is not runtime context when the directory is installed as a plugin. Runtime behaviour must live in the appropriate skill.
- Keep plugin invocations namespaced as `/pr-review:config`, `/pr-review:start`, and `/pr-review:feedback` in user documentation.
- Claude dynamic context injection with ``!`command` `` is allowed only for read-only environment discovery. Preserve the written fallback for Codex and other Agent Skills hosts.
- After local plugin changes, validate the plugin and use `/reload-plugins` before a fresh behavioural test.
