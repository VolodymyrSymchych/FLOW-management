#!/bin/bash
cd /Users/symchychpc/RiderProjects/Project\ Scope\ Analyzer
export $(grep -v '^#' dashboard/.env.local | xargs)
echo "No" | npm run db:push

