#!/bin/bash

# Landing Page Test Script
# Tests the landing page and waitlist API

echo "🚀 Testing Landing Page & Waitlist API"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if notification service is running
echo "1️⃣  Checking if notification-service is running..."
if curl -s http://localhost:3007/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Notification service is running${NC}"
else
    echo -e "${RED}✗ Notification service is NOT running${NC}"
    echo -e "${YELLOW}   Start it with: cd services/notification-service && npm run dev${NC}"
    exit 1
fi

echo ""

# Test waitlist API
echo "2️⃣  Testing waitlist API..."

# Generate random email
RANDOM_EMAIL="test$(date +%s)@example.com"

# Test POST /api/waitlist
echo "   Testing POST /api/waitlist with: $RANDOM_EMAIL"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3007/api/waitlist \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ]; then
    echo -e "${GREEN}✓ Successfully added to waitlist${NC}"
    echo "   Response: $BODY"
else
    echo -e "${RED}✗ Failed to add to waitlist (HTTP $HTTP_CODE)${NC}"
    echo "   Response: $BODY"
fi

echo ""

# Test duplicate email
echo "   Testing duplicate email..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3007/api/waitlist \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "409" ]; then
    echo -e "${GREEN}✓ Correctly rejected duplicate email${NC}"
else
    echo -e "${RED}✗ Should have rejected duplicate (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test invalid email
echo "   Testing invalid email..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3007/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ Correctly rejected invalid email${NC}"
else
    echo -e "${RED}✗ Should have rejected invalid email (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test GET /api/waitlist/count
echo "3️⃣  Testing waitlist count..."
RESPONSE=$(curl -s http://localhost:3007/api/waitlist/count)
COUNT=$(echo $RESPONSE | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

if [ ! -z "$COUNT" ]; then
    echo -e "${GREEN}✓ Waitlist count: $COUNT${NC}"
else
    echo -e "${RED}✗ Failed to get waitlist count${NC}"
fi

echo ""

# Check if landing page exists
echo "4️⃣  Checking landing page..."
if [ -f "landing/index.html" ]; then
    echo -e "${GREEN}✓ Landing page exists${NC}"
    
    # Check file size
    SIZE=$(wc -c < landing/index.html)
    echo "   File size: $SIZE bytes"
    
    # Check for key elements
    if grep -q "waitlistForm" landing/index.html; then
        echo -e "${GREEN}✓ Waitlist form found${NC}"
    else
        echo -e "${RED}✗ Waitlist form not found${NC}"
    fi
else
    echo -e "${RED}✗ Landing page not found${NC}"
fi

echo ""
echo "========================================"
echo "✅ Testing complete!"
echo ""
echo "To view the landing page:"
echo "  cd landing"
echo "  python3 -m http.server 8000"
echo "  # or"
echo "  npx serve ."
echo ""
echo "Then visit: http://localhost:8000"
