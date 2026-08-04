#!/usr/bin/env python3
"""Validate the dual-host plugin catalog and the standalone webapp skill mirror."""

from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PLUGIN_ROOT = ROOT / "plugins"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"{path.relative_to(ROOT)}: {exc}")


def file_snapshot(path: Path) -> dict[str, bytes]:
    return {
        str(file.relative_to(path)): file.read_bytes()
        for file in path.rglob("*")
        if file.is_file()
    }


def validate_plugin(name: str) -> None:
    plugin = PLUGIN_ROOT / name
    for host in (".codex-plugin", ".claude-plugin"):
        manifest_path = plugin / host / "plugin.json"
        manifest = load_json(manifest_path)
        if manifest.get("name") != name:
            fail(f"{manifest_path.relative_to(ROOT)}: name must be {name!r}")


def main() -> None:
    plugin_names = sorted(path.name for path in PLUGIN_ROOT.iterdir() if path.is_dir())
    if not plugin_names:
        fail("plugins/ must contain at least one plugin")

    codex = load_json(ROOT / ".agents" / "plugins" / "marketplace.json")
    claude = load_json(ROOT / ".claude-plugin" / "marketplace.json")
    codex_entries = {entry["name"]: entry for entry in codex.get("plugins", [])}
    claude_entries = {entry["name"]: entry for entry in claude.get("plugins", [])}

    if sorted(codex_entries) != plugin_names or sorted(claude_entries) != plugin_names:
        fail("both marketplaces must list every plugins/<name> directory exactly once")

    for name in plugin_names:
        validate_plugin(name)
        expected_path = f"./plugins/{name}"
        source = codex_entries[name].get("source", {})
        if source.get("source") != "local" or source.get("path") != expected_path:
            fail(f"Codex marketplace source for {name} must be {expected_path}")
        policy = codex_entries[name].get("policy", {})
        if policy.get("installation") != "AVAILABLE" or not policy.get("authentication"):
            fail(f"Codex marketplace policy for {name} is incomplete")
        if not codex_entries[name].get("category"):
            fail(f"Codex marketplace category for {name} is required")
        if claude_entries[name].get("source") != expected_path:
            fail(f"Claude Code marketplace source for {name} must be {expected_path}")

    if file_snapshot(ROOT / "skills") != file_snapshot(PLUGIN_ROOT / "webapp" / "skills"):
        fail("skills/ must exactly mirror plugins/webapp/skills")

    print("OK: plugin catalogs, manifests, and webapp skill mirror are coherent")


if __name__ == "__main__":
    main()
