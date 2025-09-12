#!/bin/sh
# Husky v9 shared script
# This file is sourced by all hooks

command -v npm >/dev/null 2>&1 || {
  echo >&2 "❌ npm is required but not installed. Aborting hook."
  exit 1
}
