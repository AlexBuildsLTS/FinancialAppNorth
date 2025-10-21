#!/usr/bin/env bash
set -euo pipefail

if [ -z "${SUPABASE_PROJECT_REF:-}" ]; then
  echo "ERROR: SUPABASE_PROJECT_REF environment variable is required"
  exit 1
fi

echo "Deploying Supabase Edge Functions for project ${SUPABASE_PROJECT_REF}..."
for d in supabase/functions/* ; do
  if [ -d "$d" ]; then
    name=$(basename "$d")
    echo "-> deploying $name"
    supabase functions deploy "$name" --project-ref "${SUPABASE_PROJECT_REF}" --no-verify
  fi
done
echo "Done."
