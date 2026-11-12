#!/usr/bin/env bash
set -e

echo "=== Starting CI Build Check ==="

echo "1. Checking TypeScript Compilation..."
npx tsc --noEmit

echo "2. Running Unit Tests..."
npm test -- --ci --silent

echo "=== CI Build Successful! ==="
