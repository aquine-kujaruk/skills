#!/usr/bin/env bash
set -euo pipefail

primary_number=${1:?primary PR number is required}
managed_label=${2:?managed label is required}
repo=${GH_REPO:?GH_REPO is required}
api="repos/${repo}"
primary_marker="<!-- pr-review:primary=${primary_number} -->"

primary=$(gh api "${api}/pulls/${primary_number}")
if [[ $(jq -r '.state' <<<"$primary") != closed ]]; then
  echo "Primary PR #${primary_number} is open; cleanup skipped."
  exit 1
fi

if jq -e --arg managed "$managed_label" '.labels[]?.name == $managed' <<<"$primary" >/dev/null; then
  echo "PR #${primary_number} is managed auxiliary; cleanup skipped."
  exit 0
fi

source_ref=$(jq -r '.head.ref' <<<"$primary")
source_repo=$(jq -r '.head.repo.full_name // empty' <<<"$primary")
if [[ "$source_repo" != "$repo" ]]; then
  echo "Primary source is not in ${repo}; no managed same-repository stack can be cleaned."
  exit 1
fi

all_managed=$(gh pr list \
  --repo "$repo" \
  --state all \
  --label "$managed_label" \
  --limit 500 \
  --json number,body,isDraft,state,headRefName,headRefOid,headRepositoryOwner,baseRefName,createdAt)

for_primary=$(jq --arg marker "$primary_marker" \
  '[.[] | select((.body // "") | contains($marker))]' <<<"$all_managed")

open_for_primary=$(jq '[.[] | select(.state == "OPEN")]' <<<"$for_primary")
if [[ $(jq 'length' <<<"$open_for_primary") -eq 0 ]]; then
  echo "No open managed auxiliary PR remains for primary #${primary_number}."
  exit 0
fi

open_top=$(jq \
  '[.[] | select((.body // "") | contains("<!-- pr-review:role=stack-source -->"))]' \
  <<<"$open_for_primary")

if [[ $(jq 'length' <<<"$open_top") -gt 1 ]]; then
  echo "More than one open stack-source PR targets primary #${primary_number}."
  exit 1
fi

if [[ $(jq 'length' <<<"$open_top") -eq 1 ]]; then
  generation=$(jq -r '.[0].body | capture("<!-- pr-review:generation=(?<id>[^ ]+) -->").id' <<<"$open_top")
else
  generation=$(jq -r \
    'sort_by(.createdAt) | last | .body | capture("<!-- pr-review:generation=(?<id>[^ ]+) -->").id' \
    <<<"$open_for_primary")
fi

generation_marker="<!-- pr-review:generation=${generation} -->"
generation_prs=$(jq --arg marker "$generation_marker" \
  '[.[] | select((.body // "") | contains($marker))]' <<<"$for_primary")
open_generation=$(jq '[.[] | select(.state == "OPEN")]' <<<"$generation_prs")

if jq -e 'any(.[]; ((.body // "") | test("<!-- pr-review:role=(review|feedback|stack-source) -->")) | not)' \
  <<<"$generation_prs" >/dev/null; then
  echo "A managed PR has no valid role marker."
  exit 1
fi

stack_source_number=$(jq -r \
  '[.[] | select((.body // "") | contains("<!-- pr-review:role=stack-source -->"))] | first | .number // empty' \
  <<<"$open_generation")

if [[ -n "$stack_source_number" ]]; then
  stack_source_ref=$(jq -r --argjson number "$stack_source_number" \
    '.[] | select(.number == $number) | .headRefName' <<<"$open_generation")
  if [[ "$stack_source_ref" != "$source_ref" ]]; then
    echo "Stack-source PR head does not match the preserved source branch."
    exit 1
  fi

  stack_json=$(gh api "${api}/stacks?pull_request=${stack_source_number}")
  stack_count=$(jq 'length' <<<"$stack_json")
  if [[ "$stack_count" -gt 1 ]]; then
    echo "Stack-source PR belongs to more than one open stack."
    exit 1
  fi
  if [[ "$stack_count" -eq 1 ]]; then
    # GitHub can mark a bottom PR merged while retaining it in the native stack.
    expected=$(jq -c '[.[].number] | sort' <<<"$generation_prs")
    actual=$(jq -c '.[0].pull_requests | [.[].number] | sort' <<<"$stack_json")
    if [[ "$expected" != "$actual" ]]; then
      echo "Native stack membership differs from the marked generation."
      exit 1
    fi
    stack_number=$(jq -r '.[0].number' <<<"$stack_json")
    gh stack unstack "$stack_number"
    remaining_stack=$(gh api "${api}/stacks?pull_request=${stack_source_number}")
    if [[ $(jq 'length' <<<"$remaining_stack") -ne 0 ]]; then
      echo "Stack #${stack_number} remains active; cleanup stopped before closing PRs."
      exit 1
    fi
  fi
fi

while IFS=$'\t' read -r number role head_ref head_sha owner; do
  [[ -n "$number" ]] || continue
  if [[ "$role" == stack-source ]]; then
    continue
  fi
  if [[ "$owner" != "${repo%%/*}" || "$head_ref" == "$source_ref" ]]; then
    echo "PR #${number} does not identify a deletable managed branch."
    exit 1
  fi

  state=$(jq -r --argjson number "$number" '.[] | select(.number == $number) | .state' <<<"$generation_prs")
  if [[ "$state" == OPEN ]]; then
    gh pr close "$number" --repo "$repo"
  fi

  open_uses=$(gh api --method GET "${api}/pulls" \
    -f state=open -f "head=${owner}:${head_ref}" -f per_page=100 --jq 'length')
  if [[ "$open_uses" -ne 0 ]]; then
    echo "Branch ${head_ref} still heads an open PR; deletion stopped."
    exit 1
  fi

  remote_sha=$(gh api "${api}/git/ref/heads/${head_ref}" --jq '.object.sha' 2>/dev/null || true)
  if [[ -n "$remote_sha" && "$remote_sha" != "$head_sha" ]]; then
    echo "Branch ${head_ref} advanced after publication; deletion stopped."
    exit 1
  fi
  if [[ -n "$remote_sha" ]]; then
    gh api --method DELETE "${api}/git/refs/heads/${head_ref}"
  fi
done < <(jq -r '
  .[]
  | select((.body // "") | contains("<!-- pr-review:role=stack-source -->") | not)
  | [
      (.number | tostring),
      (.body | capture("<!-- pr-review:role=(?<role>[^ ]+) -->").role),
      .headRefName,
      .headRefOid,
      (.headRepositoryOwner.login // .headRepositoryOwner)
    ]
  | @tsv' <<<"$generation_prs")

if [[ -n "$stack_source_number" ]]; then
  gh pr close "$stack_source_number" --repo "$repo"
fi

echo "Cleaned review generation ${generation}; preserved source branch ${source_ref}."
