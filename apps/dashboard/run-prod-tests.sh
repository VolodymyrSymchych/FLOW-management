#!/bin/bash

# Run E2E tests on production
export TEST_BASE_URL=https://flow-managment.vercel.app
npm run test:e2e
