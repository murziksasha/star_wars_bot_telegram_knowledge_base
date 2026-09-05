#!/usr/bin/env bash
# Recreate .vercel/project.json from GitHub secrets and fail with the real
# Vercel API error instead of the CLI's "remove the .vercel directory" message.
set -euo pipefail

trim() {
  local s="${1-}"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

TOKEN="$(trim "${VERCEL_TOKEN-}")"
ORG="$(trim "${VERCEL_ORG_ID-}")"
PRJ="$(trim "${VERCEL_PROJECT_ID-}")"

if [ -z "$TOKEN" ] || [ -z "$ORG" ] || [ -z "$PRJ" ]; then
  echo "Missing Vercel secrets; cannot link the project." >&2
  echo "Set repository secrets VERCEL_TOKEN, VERCEL_ORG_ID, and VERCEL_PROJECT_ID." >&2
  exit 1
fi

if [ -n "${GITHUB_ENV-}" ]; then
  {
    echo "VERCEL_TOKEN=$TOKEN"
    echo "VERCEL_ORG_ID=$ORG"
    echo "VERCEL_PROJECT_ID=$PRJ"
  } >> "$GITHUB_ENV"
fi

export VERCEL_TOKEN="$TOKEN"
export VERCEL_ORG_ID="$ORG"
export VERCEL_PROJECT_ID="$PRJ"

rm -rf .vercel
mkdir -p .vercel
node -e '
  const fs = require("fs");
  fs.writeFileSync(
    ".vercel/project.json",
    JSON.stringify({
      orgId: process.env.VERCEL_ORG_ID,
      projectId: process.env.VERCEL_PROJECT_ID,
    }) + "\n"
  );
'

echo "Wrote .vercel/project.json (orgId length=${#ORG}, projectId length=${#PRJ})"

user_code="$(curl -sS -o /tmp/vercel-user.json -w "%{http_code}" \
  -H "Authorization: Bearer ${TOKEN}" \
  https://api.vercel.com/v2/user || true)"

if [ "$user_code" != "200" ]; then
  echo "VERCEL_TOKEN is invalid or expired (GET /v2/user HTTP ${user_code})." >&2
  echo "Create a new token at https://vercel.com/account/tokens and update the GitHub secret." >&2
  cat /tmp/vercel-user.json >&2 || true
  echo >&2
  exit 1
fi

proj_code="$(curl -sS -o /tmp/vercel-project.json -w "%{http_code}" \
  -H "Authorization: Bearer ${TOKEN}" \
  "https://api.vercel.com/v9/projects/${PRJ}?teamId=${ORG}" || true)"

if [ "$proj_code" != "200" ]; then
  proj_code="$(curl -sS -o /tmp/vercel-project.json -w "%{http_code}" \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://api.vercel.com/v9/projects/${PRJ}" || true)"
fi

if [ "$proj_code" != "200" ]; then
  echo "Could not retrieve Vercel project settings (HTTP ${proj_code})." >&2
  echo "The CLI error about removing .vercel is a red herring: this repo does not commit .vercel." >&2
  echo "Fix the GitHub secrets:" >&2
  echo "  VERCEL_ORG_ID     = Team ID (team_...) or Hobby User ID from Vercel Settings, not the slug/name" >&2
  echo "  VERCEL_PROJECT_ID = Project ID (prj_...) from Project Settings → General, not the project name" >&2
  echo "  VERCEL_TOKEN      = token for an account that can access that team/project" >&2
  cat /tmp/vercel-project.json >&2 || true
  echo >&2
  exit 1
fi

echo "Vercel project settings reachable."
