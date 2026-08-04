#!/usr/bin/env python3
"""Dependency-free structural validator for the pr-review plugin."""

from __future__ import annotations

import json
import re
import stat
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SKILLS = ("config", "start", "feedback")
PLUGIN_NAME = "pr-review"
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(f"{path.relative_to(ROOT)}: {exc}")


def parse_frontmatter(path: Path) -> tuple[dict[str, str], str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        fail(f"{path.relative_to(ROOT)}: missing YAML frontmatter")
    try:
        raw, body = text[4:].split("\n---\n", 1)
    except ValueError:
        fail(f"{path.relative_to(ROOT)}: unterminated YAML frontmatter")
    fields: dict[str, str] = {}
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            fail(f"{path.relative_to(ROOT)}: unsupported frontmatter line {line!r}")
        key, value = line.split(":", 1)
        fields[key.strip()] = value.strip().strip('"').strip("'")
    return fields, body


def validate_manifests() -> None:
    codex = load_json(ROOT / ".codex-plugin" / "plugin.json")
    claude = load_json(ROOT / ".claude-plugin" / "plugin.json")
    marketplace = load_json(ROOT / ".claude-plugin" / "marketplace.json")
    versions = {codex.get("version"), claude.get("version")}
    if codex.get("name") != PLUGIN_NAME or claude.get("name") != PLUGIN_NAME:
        fail("both plugin manifests must use the pr-review namespace")
    if len(versions) != 1 or not re.fullmatch(
        r"\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?", next(iter(versions), "")
    ):
        fail("plugin manifest versions must match and use semver")
    entries = marketplace.get("plugins", [])
    if len(entries) != 1 or entries[0].get("name") != PLUGIN_NAME:
        fail("Claude marketplace must expose exactly the pr-review plugin")
    if entries[0].get("version") not in versions:
        fail("Claude marketplace version must match both manifests")
    expected_prompts = [f"$pr-review:{name}" for name in SKILLS]
    if codex.get("interface", {}).get("defaultPrompt") != expected_prompts:
        fail("Codex starter prompts must be the three minimal pr-review invocations")


def validate_skill(name: str) -> None:
    folder = ROOT / "skills" / name
    skill = folder / "SKILL.md"
    metadata = folder / "agents" / "openai.yaml"
    if not skill.is_file() or not metadata.is_file():
        fail(f"skills/{name}: SKILL.md and agents/openai.yaml are required")
    fields, body = parse_frontmatter(skill)
    if fields.get("name") != name or not NAME_RE.fullmatch(name):
        fail(f"skills/{name}/SKILL.md: invalid or mismatched name")
    if len(fields.get("description", "")) < 40:
        fail(f"skills/{name}/SKILL.md: human description is too short")
    if fields.get("disable-model-invocation") not in (None, "false"):
        fail(f"skills/{name}/SKILL.md: Codex plugins require model invocation enabled")
    if len(skill.read_text(encoding="utf-8").splitlines()) > 500:
        fail(f"skills/{name}/SKILL.md: keep the skill under 500 lines")
    if "../../references/review-contract.md" not in body:
        fail(f"skills/{name}/SKILL.md: shared contract pointer is required")
    if body.count("Complete when") < 3:
        fail(f"skills/{name}/SKILL.md: each major step needs a completion criterion")
    ui = metadata.read_text(encoding="utf-8")
    if f'default_prompt: "$pr-review:{name}"' not in ui:
        fail(f"skills/{name}/agents/openai.yaml: default prompt must be minimal")
    if "allow_implicit_invocation: false" not in ui:
        fail(f"skills/{name}/agents/openai.yaml: invocation must remain explicit")


def validate_project_skill_link(name: str) -> None:
    link = ROOT / ".agents" / "skills" / name
    expected_target = Path("../../skills") / name
    if not link.is_symlink() or link.readlink() != expected_target:
        fail(f".agents/skills/{name}: expected symlink to {expected_target}")
    if link.resolve() != (ROOT / "skills" / name).resolve():
        fail(f".agents/skills/{name}: target does not resolve to canonical skill")


def yaml_scalar(text: str, key: str) -> str:
    match = re.search(rf"(?m)^{re.escape(key)}:\s*([^#\n]+?)\s*$", text)
    if not match:
        fail(f".github/pr-review.yml: missing {key}")
    return match.group(1).strip("'\"")


def validate_repository_config() -> None:
    config = ROOT / ".github" / "pr-review.yml"
    workflow = ROOT / ".github" / "workflows" / "pr-review-close.yml"
    cleanup = ROOT / ".github" / "scripts" / "pr-review-cleanup.sh"
    for path in (config, workflow, cleanup):
        if not path.is_file():
            fail(f"{path.relative_to(ROOT)} is required")
    config_text = config.read_text(encoding="utf-8")
    workflow_text = workflow.read_text(encoding="utf-8")
    cleanup_text = cleanup.read_text(encoding="utf-8")
    if yaml_scalar(config_text, "version") != "1":
        fail(".github/pr-review.yml: unsupported version")
    label = yaml_scalar(config_text, "managed_label")
    if f"MANAGED_LABEL: {label}" not in workflow_text:
        fail("cleanup workflow label must match repository configuration")
    for event in ("pull_request_target:", "workflow_dispatch:"):
        if event not in workflow_text:
            fail(f"cleanup workflow is missing {event}")
    mode = cleanup.stat().st_mode
    if not mode & stat.S_IXUSR:
        fail(".github/scripts/pr-review-cleanup.sh must be executable")
    membership_check = (
        "expected=$(jq -c '[.[].number] | sort' <<<\"$generation_prs\")"
    )
    if membership_check not in cleanup_text:
        fail("cleanup must compare every marked PR with native stack membership")


def validate_skill_set() -> None:
    expected = set(SKILLS)
    actual_skills = {
        path.name for path in (ROOT / "skills").iterdir() if path.is_dir()
    }
    actual_links = {
        path.name for path in (ROOT / ".agents" / "skills").iterdir()
        if path.is_symlink()
    }
    if actual_skills != expected:
        fail(f"canonical skill set must be exactly {sorted(expected)}")
    if actual_links != expected:
        fail(f"project skill links must be exactly {sorted(expected)}")

    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    claude = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
    for name in SKILLS:
        if f"$pr-review:{name}" not in readme:
            fail(f"README.md: missing Codex invocation for {name}")
        if f"/pr-review:{name}" not in readme or f"/pr-review:{name}" not in claude:
            fail(f"documentation: missing Claude invocation for {name}")


def validate_placeholders() -> None:
    unresolved = []
    for path in ROOT.rglob("*"):
        if not path.is_file() or ".git" in path.parts or path == Path(__file__):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if "[TODO:" in text:
            unresolved.append(str(path.relative_to(ROOT)))
    if unresolved:
        fail("unresolved scaffold placeholders: " + ", ".join(unresolved))


def main() -> None:
    validate_manifests()
    for skill_name in SKILLS:
        validate_skill(skill_name)
        validate_project_skill_link(skill_name)
    validate_repository_config()
    validate_skill_set()
    validate_placeholders()
    print("OK: pr-review manifests, skills, links, configuration, and cleanup are valid")


if __name__ == "__main__":
    main()
