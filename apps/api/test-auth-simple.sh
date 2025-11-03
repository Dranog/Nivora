#!/bin/bash

API_URL="http://localhost:3001/api/auth"
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser${TIMESTAMP}@example.com"
LOCKOUT_EMAIL="lockouttest${TIMESTAMP}@example.com"

echo "============================================"
echo "AUTH MODULE SECURITY TEST SUITE"
echo "============================================"
echo ""

# TEST 1: Weak password (should fail)
echo "TEST 1: Register with weak password (should fail)"
curl -s -X POST $API_URL/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"weak123\",\"passwordConfirm\":\"weak123\",\"role\":\"FAN\"}" \
  | head -c 200
echo ""
echo ""

# TEST 2: Strong password (should succeed)
echo "TEST 2: Register with strong password (should succeed)"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"StrongPass123!\",\"passwordConfirm\":\"StrongPass123!\",\"role\":\"FAN\"}")
echo $REGISTER_RESPONSE | head -c 200
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
echo ""
echo ""

# TEST 3: Login with correct password
echo "TEST 3: Login with correct password (should succeed)"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"StrongPass123!\"}")
echo $LOGIN_RESPONSE | head -c 200
LOGIN_ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
LOGIN_REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
echo ""
echo ""

# TEST 4: Login with wrong password
echo "TEST 4: Login with wrong password (should fail)"
curl -s -X POST $API_URL/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword123!\"}" \
  | head -c 200
echo ""
echo ""

# TEST 5: Account lockout
echo "TEST 5: Account lockout after 10 failed attempts"
# First register the lockout test user
curl -s -X POST $API_URL/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$LOCKOUT_EMAIL\",\"password\":\"LockoutTest123!\",\"passwordConfirm\":\"LockoutTest123!\",\"role\":\"FAN\"}" > /dev/null
echo "Making 10 failed login attempts..."
for i in {1..10}; do
  curl -s -X POST $API_URL/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$LOCKOUT_EMAIL\",\"password\":\"WrongPassword!\"}" > /dev/null
  echo "  Attempt $i/10"
  sleep 0.2
done
echo "Attempting 11th login (should be locked):"
curl -s -X POST $API_URL/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$LOCKOUT_EMAIL\",\"password\":\"WrongPassword!\"}" \
  | head -c 200
echo ""
echo ""

# TEST 6: Token refresh
echo "TEST 6: Token refresh (should succeed)"
REFRESH_RESPONSE=$(curl -s -X POST $API_URL/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$LOGIN_REFRESH_TOKEN\"}")
echo $REFRESH_RESPONSE | head -c 200
NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo ""
echo ""

# TEST 7: Reuse old refresh token (should fail)
echo "TEST 7: Reuse old refresh token (should fail)"
curl -s -X POST $API_URL/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$LOGIN_REFRESH_TOKEN\"}" \
  | head -c 200
echo ""
echo ""

# TEST 8: Logout
echo "TEST 8: Logout (should succeed)"
curl -s -X POST $API_URL/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN" \
  | head -c 200
echo ""
echo ""

echo "============================================"
echo "TESTS COMPLETED"
echo "============================================"
