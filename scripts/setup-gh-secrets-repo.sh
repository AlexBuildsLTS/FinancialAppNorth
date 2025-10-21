#!/usr/bin/env bash
set -euo pipefail

# Script: set GitHub Actions secrets for your repo using gh CLI.
# Usage:
#   1) gh auth login (browser)
#   2) Ensure .env.local exists in project root and contains SUPABASE_SERVICE_ROLE_KEY and EXPO_PUBLIC_SUPABASE_URL
#   3) Run:
#        chmod +x ./scripts/setup-gh-secrets-repo.sh
#        ./scripts/setup-gh-secrets-repo.sh
#
# This script will:
#  - infer project ref from EXPO_PUBLIC_SUPABASE_URL in .env.local (e.g. fniujrqxkhepevzvghja)
#  - read SUPABASE_SERVICE_ROLE_KEY from .env.local (do not commit this file)
#  - set three repo secrets: SUPABASE_PROJECT_REF, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_FUNCTIONS_URL
#  - target repo: AlexBuildsLTS/FinancialAppNorth (change REPO variable below if needed)

# --- CONFIG: change REPO if you want a different target ---
REPO="${REPO:-AlexBuildsLTS/FinancialAppNorth}"

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: GitHub CLI (gh) not found. Install from https://cli.github.com/ and run 'gh auth login'." >&2
  exit 1
fi

if [ ! -f ".env.local" ]; then
  echo "ERROR: .env.local not found in project root. Create it or copy your env file." >&2
  exit 1
fi

# derive project ref from EXPO_PUBLIC_SUPABASE_URL if possible
EXPO_URL=$(grep -E '^EXPO_PUBLIC_SUPABASE_URL=' .env.local | cut -d'=' -f2- | tr -d '\r\n' || true)
if [ -n "$EXPO_URL" ]; then
  HOST=$(echo "$EXPO_URL" | sed -E 's#https?://##' | cut -d/ -f1)
  PROJECT_REF=$(echo "$HOST" | sed -E 's/\.supabase\.co$//')
else
  PROJECT_REF=""
fi

# allow override by env
PROJECT_REF="${SUPABASE_PROJECT_REF:-${PROJECT_REF}}"
if [ -z "${PROJECT_REF}" ]; then
  echo "ERROR: Could not infer SUPABASE_PROJECT_REF. Export SUPABASE_PROJECT_REF or ensure EXPO_PUBLIC_SUPABASE_URL in .env.local." >&2
  exit 1
fi

# read service role key from .env.local (do not print it)
SERVICE_ROLE_KEY=$(grep -E '^SUPABASE_SERVICE_ROLE_KEY=' .env.local | cut -d'=' -f2- | tr -d '\r\n' || true)
if [ -z "${SERVICE_ROLE_KEY}" ]; then
  echo "ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env.local" >&2
  exit 1
fi

# infer functions url
FUNCTIONS_URL="${SUPABASE_FUNCTIONS_URL:-https://${PROJECT_REF}.functions.supabase.co}"

echo "Target repo: ${REPO}"
echo " - SUPABASE_PROJECT_REF -> ${PROJECT_REF}"
echo " - SUPABASE_FUNCTIONS_URL -> ${FUNCTIONS_URL}"
echo "Uploading SUPABASE_SERVICE_ROLE_KEY securely to GitHub (not displayed)..."

# set secrets via gh (encrypted)
gh secret set SUPABASE_PROJECT_REF --body "${PROJECT_REF}" --repo "${REPO}"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "${SERVICE_ROLE_KEY}" --repo "${REPO}"
gh secret set SUPABASE_FUNCTIONS_URL --body "${FUNCTIONS_URL}" --repo "${REPO}"

echo "Done. Confirm in GitHub: https://github.com/${REPO}/settings/secrets/actions"