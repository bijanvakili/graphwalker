#!/bin/sh

set -e

git diff --name-only --cached --relative | xargs yarn run lint-prettier
git diff --name-only --cached --relative | grep '\.tsx\?$' | xargs yarn run lint-ts
git diff --name-only --cached --relative | grep '\.md$' | xargs yarn run lint-md
