#!/bin/bash

# Test Script for Academic Credential Verification System
# Usage: bash test.sh

BASE_URL="http://localhost:5000/api"
TOKEN=""

echo "================================================"
echo "Academic Credential Verification System - Tests"
echo "================================================"

# Test 1: Register Student
echo ""
echo "TEST 1: Register Student User"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "SecurePass123!",
    "role": "STUDENT",
    "organization": "Test University"
  }')

echo $RESPONSE | jq .
TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# Test 2: Register University
echo ""
echo "TEST 2: Register University User"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "smith@university.edu",
    "password": "UnivPass123!",
    "role": "UNIVERSITY_ISSUER",
    "organization": "Tech University"
  }')

echo $RESPONSE | jq .
UNI_TOKEN=$(echo $RESPONSE | jq -r '.token')
UNI_USER_ID=$(echo $RESPONSE | jq -r '.user.id')
echo "University Token: $UNI_TOKEN"

# Test 3: Register Verifier
echo ""
echo "TEST 3: Register Verifier User"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Employer",
    "email": "bob@employer.com",
    "password": "VerifyPass123!",
    "role": "VERIFIER",
    "organization": "TechCorp"
  }')

echo $RESPONSE | jq .
VERIFIER_TOKEN=$(echo $RESPONSE | jq -r '.token')

# Test 4: Login Student
echo ""
echo "TEST 4: Login with Student Credentials"
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }')

echo $RESPONSE | jq .

# Test 5: Get Student Profile
echo ""
echo "TEST 5: Get Student Profile"
curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 6: Issue Credential (Requires Student ID)
echo ""
echo "TEST 6: Issue Credential"
STUDENT_ID="alice@example.com"

RESPONSE=$(curl -s -X POST "$BASE_URL/credentials/issue" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $UNI_TOKEN" \
  -d '{
    "studentId": "'$STUDENT_ID'",
    "credentialType": "DEGREE",
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "gpa": 3.85,
    "issueDate": "2024-01-15",
    "expiryDate": "2034-01-15"
  }')

echo $RESPONSE | jq .
CRED_ID=$(echo $RESPONSE | jq -r '.credential.credentialId')
CRED_HASH=$(echo $RESPONSE | jq -r '.credential.credentialHash')

echo "Credential ID: $CRED_ID"
echo "Credential Hash: $CRED_HASH"

# Test 7: Get Credential
echo ""
echo "TEST 7: Get Credential Details"
curl -s -X GET "$BASE_URL/credentials/$CRED_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 8: List Student Credentials
echo ""
echo "TEST 8: List Student Credentials"
curl -s -X GET "$BASE_URL/credentials/student/list" \
  -H "Authorization: Bearer $TOKEN" | jq .

# Test 9: Verify Credential by Hash
echo ""
echo "TEST 9: Verify Credential by Hash"
curl -s -X POST "$BASE_URL/verify/verify-hash" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VERIFIER_TOKEN" \
  -d '{
    "credentialHash": "'$CRED_HASH'"
  }' | jq .

# Test 10: Verify Credential by ID
echo ""
echo "TEST 10: Verify Credential by ID"
curl -s -X GET "$BASE_URL/verify/$CRED_ID/verify" \
  -H "Authorization: Bearer $VERIFIER_TOKEN" | jq .

# Test 11: Get Verification History
echo ""
echo "TEST 11: Get Verification History"
curl -s -X GET "$BASE_URL/verify/$CRED_ID/history" \
  -H "Authorization: Bearer $VERIFIER_TOKEN" | jq .

# Test 12: Get Audit Trail
echo ""
echo "TEST 12: Get Credential Audit Trail"
curl -s -X GET "$BASE_URL/credentials/$CRED_ID/audit" \
  -H "Authorization: Bearer $UNI_TOKEN" | jq .

echo ""
echo "================================================"
echo "All tests completed!"
echo "================================================"
