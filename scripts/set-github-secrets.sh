#!/usr/bin/env bash
set -euo pipefail

# Smooth helper to push secrets to the current GitHub repo via gh CLI.
# Requires: gh (GitHub CLI) installed and authenticated (gh auth login).

print_usage() {
  cat <<EOF
Usage: ./scripts/set-github-secrets.sh [options]

Options:
  --repo owner/repo    Optional. If omitted, the script auto-detects the repo via 'gh repo view'.
  --no-prompt          Do not prompt; require SUPABASE_PROJECT_REF and SUPABASE_SERVICE_ROLE_KEY env vars to be set.
  -h|--help            Show this help.
EOF
}

REPO=""
NO_PROMPT=0

while [[ ${#} -gt 0 ]]; do
  case "$1" in
    --repo) REPO="$2"; shift 2;;
    --no-prompt) NO_PROMPT=1; shift;;
    -h|--help) print_usage; exit 0;;
    *) echo "Unknown arg: $1"; print_usage; exit 1;;
  esac
done

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) not found. Install from https://cli.github.com/ and run 'gh auth login'." >&2
  exit 1
fi

# detect repo if not supplied
if [ -z "${REPO}" ]; then
  REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)
  if [ -z "${REPO}" ]; then
    echo "Could not auto-detect repository. Provide --repo owner/repo or run this inside a git repo with gh access." >&2
    exit 1
  fi
fi

echo "Target repo: ${REPO}"

# helper to read or validate an env var
read_secret_env() {
  local varname="$1"
  local prompt="$2"
  local value="${!varname:-}"
  if [ -n "${value}" ]; then
    echo "${value}"
    return 0
  fi
  if [ "${NO_PROMPT}" -eq 1 ]; then
    echo ""
    return 1
  fi
  # prompt
  read -r -p "${prompt}: " input_val
  echo "${input_val}"
}

# Gather values (either from env or prompt)
SUPABASE_PROJECT_REF=$(read_secret_env "SUPABASE_PROJECT_REF" "Enter SUPABASE_PROJECT_REF (project ref)")
SUPABASE_SERVICE_ROLE_KEY=$(read_secret_env "SUPABASE_SERVICE_ROLE_KEY" "Enter SUPABASE_SERVICE_ROLE_KEY (service role key)")

# Optionally accept other secrets
SUPABASE_FUNCTIONS_URL="${SUPABASE_FUNCTIONS_URL:-}"
if [ -z "${SUPABASE_FUNCTIONS_URL}" ] && [ "${NO_PROMPT}" -eq 0 ]; then
  read -r -p "Optional: SUPABASE_FUNCTIONS_URL (press Enter to skip): " tmp && SUPABASE_FUNCTIONS_URL="${tmp:-}"
fi
ADMIN_API_KEY="${ADMIN_API_KEY:-}"
if [ -z "${ADMIN_API_KEY}" ] && [ "${NO_PROMPT}" -eq 0 ]; then
  read -r -p "Optional: ADMIN_API_KEY (press Enter to skip): " tmp && ADMIN_API_KEY="${tmp:-}"
fi

# Validate required
if [ -z "${SUPABASE_PROJECT_REF}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY}" ]; then
  echo "ERROR: SUPABASE_PROJECT_REF and SUPABASE_SERVICE_ROLE_KEY are required." >&2
  exit 1
fi

echo "Storing secrets in GitHub repo ${REPO}..."

gh secret set SUPABASE_PROJECT_REF --body "${SUPABASE_PROJECT_REF}" --repo "${REPO}"
echo " -> SUPABASE_PROJECT_REF set"

gh secret set SUPABASE_SERVICE_ROLE_KEY --body "${SUPABASE_SERVICE_ROLE_KEY}" --repo "${REPO}"
echo " -> SUPABASE_SERVICE_ROLE_KEY set"

if [ -n "${SUPABASE_FUNCTIONS_URL}" ]; then
  gh secret set SUPABASE_FUNCTIONS_URL --body "${SUPABASE_FUNCTIONS_URL}" --repo "${REPO}"
  echo " -> SUPABASE_FUNCTIONS_URL set"
fi

if [ -n "${ADMIN_API_KEY}" ]; then
  gh secret set ADMIN_API_KEY --body "${ADMIN_API_KEY}" --repo "${REPO}"
  echo " -> ADMIN_API_KEY set"
fi

echo "All done. GitHub repository secrets updated."
