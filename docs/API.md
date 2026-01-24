# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /auth/register`

**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "organization": "Tech University"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | Unique email address |
| password | string | Yes | Password (min 8 chars, 1 uppercase, 1 number) |
| role | string | Yes | One of: STUDENT, UNIVERSITY_ISSUER, VERIFIER, ADMIN |
| organization | string | Yes | Organization/University name |

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "USER-1699000000000-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "organization": "Tech University",
    "did": "did:fabric:credential-channel:DefaultMSP:john@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or email already in use
- `500 Internal Server Error`: Server error during registration

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email |
| password | string | Yes | User's password |

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "USER-1699000000000-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "organization": "Tech University",
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

---

### 3. Get Profile

**Endpoint:** `GET /auth/profile`

**Description:** Get authenticated user's profile information

**Authentication:** Required ✓

**Response (200 OK):**
```json
{
  "user": {
    "userId": "USER-1699000000000-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "organization": "Tech University",
    "did": "did:fabric:...",
    "publicKey": "-----BEGIN PUBLIC KEY-----...",
    "createdAt": "2024-01-10T08:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: User not found

---

## Credential Endpoints

### 4. Issue Credential

**Endpoint:** `POST /credentials/issue`

**Description:** Issue a new academic credential

**Authentication:** Required ✓ (UNIVERSITY_ISSUER or ADMIN only)

**Request Body:**
```json
{
  "studentId": "STUDENT_USER_ID",
  "credentialType": "DEGREE",
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "gpa": 3.85,
  "issueDate": "2024-01-15",
  "expiryDate": "2034-01-15",
  "metadata": {
    "graduation_date": "2024-05-15",
    "honors": "Cum Laude"
  }
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| studentId | string | Yes | Student's MongoDB ID |
| credentialType | string | Yes | DEGREE, DIPLOMA, CERTIFICATE, or TRANSCRIPT |
| degree | string | Yes | Degree name (e.g., Bachelor of Science) |
| major | string | Yes | Major/Field of study |
| gpa | number | Yes | GPA (0.0-4.0) |
| issueDate | date | Yes | Issue date (YYYY-MM-DD) |
| expiryDate | date | No | Expiry date (YYYY-MM-DD) |
| metadata | object | No | Additional custom metadata |

**Response (201 Created):**
```json
{
  "message": "Credential issued successfully",
  "credential": {
    "credentialId": "CRED-1699000000000-XYZ789",
    "credentialHash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    "transactionId": "fabric-txid-12345678901234567890",
    "did": "did:fabric:credential:USER-123:CRED-...",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "issuedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or missing required fields
- `403 Forbidden`: User doesn't have permission to issue credentials
- `404 Not Found`: Student not found
- `500 Internal Server Error`: Blockchain or database error

---

### 5. Get Credential

**Endpoint:** `GET /credentials/{credentialId}`

**Description:** Retrieve credential details by ID

**Authentication:** Required ✓

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Credential ID (e.g., CRED-...) |

**Response (200 OK):**
```json
{
  "credential": {
    "credentialId": "CRED-1699000000000-XYZ789",
    "student": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "issuer": {
      "name": "Tech University"
    },
    "credentialType": "DEGREE",
    "degree": "Bachelor of Science",
    "major": "Computer Science",
    "gpa": 3.85,
    "issueDate": "2024-01-15",
    "expiryDate": "2034-01-15",
    "status": "ISSUED",
    "isRevoked": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Credential not found
- `401 Unauthorized`: Invalid or expired token

---

### 6. List Student Credentials

**Endpoint:** `GET /credentials/student/list`

**Description:** List all credentials for authenticated student

**Authentication:** Required ✓ (STUDENT only)

**Response (200 OK):**
```json
{
  "count": 3,
  "credentials": [
    {
      "credentialId": "CRED-1699000000000-XYZ789",
      "issuer": "Tech University",
      "type": "DEGREE",
      "degree": "Bachelor of Science",
      "major": "Computer Science",
      "issueDate": "2024-01-15",
      "status": "ISSUED",
      "isRevoked": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token

---

### 7. Revoke Credential

**Endpoint:** `POST /credentials/{credentialId}/revoke`

**Description:** Revoke an issued credential

**Authentication:** Required ✓ (Issuer or ADMIN only)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Credential ID to revoke |

**Request Body:**
```json
{
  "reason": "Credential invalidation due to fraud detection"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | string | Yes | Reason for revocation |

**Response (200 OK):**
```json
{
  "message": "Credential revoked successfully"
}
```

**Error Responses:**
- `403 Forbidden`: User cannot revoke this credential
- `404 Not Found`: Credential not found
- `500 Internal Server Error`: Blockchain error

---

### 8. Get Audit Trail

**Endpoint:** `GET /credentials/{credentialId}/audit`

**Description:** Get complete audit trail for a credential

**Authentication:** Required ✓

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Credential ID |

**Response (200 OK):**
```json
{
  "credentialId": "CRED-1699000000000-XYZ789",
  "auditTrail": [
    {
      "action": "ISSUED",
      "performedBy": "Dr. Smith",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "SUCCESS",
      "details": {
        "credentialId": "CRED-...",
        "studentId": "USER-...",
        "credentialType": "DEGREE"
      }
    },
    {
      "action": "VERIFIED",
      "performedBy": "Verifier Name",
      "timestamp": "2024-01-16T14:20:00Z",
      "status": "SUCCESS",
      "details": {
        "isValid": true
      }
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Credential not found
- `401 Unauthorized`: Invalid or expired token

---

## Verification Endpoints

### 9. Verify Credential by Hash

**Endpoint:** `POST /verify/verify-hash`

**Description:** Verify credential using SHA-256 hash

**Authentication:** Required ✓ (VERIFIER or ADMIN only)

**Request Body:**
```json
{
  "credentialHash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| credentialHash | string | Yes | 64-character SHA-256 hex hash |

**Response (200 OK - Valid):**
```json
{
  "isValid": true,
  "credentialId": "CRED-1699000000000-XYZ789",
  "student": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "issuer": {
    "name": "Tech University"
  },
  "credentialType": "DEGREE",
  "degree": "Bachelor of Science",
  "issueDate": "2024-01-15",
  "expiryDate": "2034-01-15",
  "details": {
    "hashMatch": true,
    "signatureValid": true,
    "notRevoked": true,
    "notExpired": true,
    "blockchainValid": true
  },
  "status": "ISSUED",
  "isRevoked": false
}
```

**Response (200 OK - Invalid):**
```json
{
  "isValid": false,
  "message": "Credential not found",
  "details": {
    "hashMatch": false
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid hash format
- `401 Unauthorized`: Invalid or expired token

---

### 10. Verify Credential by ID

**Endpoint:** `GET /verify/{credentialId}/verify`

**Description:** Verify credential by credential ID

**Authentication:** Required ✓ (VERIFIER or ADMIN only)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Credential ID |

**Response (200 OK - Valid):**
```json
{
  "isValid": true,
  "credentialId": "CRED-1699000000000-XYZ789",
  "student": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "issuer": "Tech University",
  "credentialType": "DEGREE",
  "issueDate": "2024-01-15",
  "expiryDate": "2034-01-15",
  "status": "ISSUED"
}
```

**Error Responses:**
- `404 Not Found`: Credential not found
- `401 Unauthorized`: Invalid or expired token

---

### 11. Get Verification History

**Endpoint:** `GET /verify/{credentialId}/history`

**Description:** Get all verification attempts for a credential

**Authentication:** Required ✓

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| credentialId | string | Yes | Credential ID |

**Response (200 OK):**
```json
{
  "credentialId": "CRED-1699000000000-XYZ789",
  "verificationCount": 5,
  "lastVerifiedAt": "2024-01-20T15:45:00Z",
  "verifications": [
    {
      "verificationId": "VER-1699000000000-ABC",
      "verifierId": "John Employer",
      "isValid": true,
      "verificationMethod": "DIRECT_HASH",
      "timestamp": "2024-01-20T15:45:00Z",
      "details": {
        "hashMatch": true,
        "signatureValid": true,
        "notRevoked": true,
        "notExpired": true
      }
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Credential not found
- `401 Unauthorized`: Invalid or expired token

---

### 12. Get Verification Statistics

**Endpoint:** `GET /verify/stats`

**Description:** Get overall verification statistics (Admin only)

**Authentication:** Required ✓ (ADMIN only)

**Response (200 OK):**
```json
{
  "totalVerifications": 542,
  "validCredentials": 515,
  "invalidCredentials": 27,
  "byMethod": {
    "DIRECT_HASH": 320,
    "QR_SCAN": 180,
    "CREDENTIAL_ID": 42
  },
  "recentVerifications": [
    {
      "verificationId": "VER-...",
      "verifierId": "John Employer",
      "isValid": true,
      "timestamp": "2024-01-20T15:45:00Z"
    }
  ]
}
```

**Error Responses:**
- `403 Forbidden`: User is not an admin
- `401 Unauthorized`: Invalid or expired token

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/credentials/issue"
}
```

**HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Header**: `X-RateLimit-Remaining` shows remaining requests
- **Error**: `429 Too Many Requests` when limit exceeded

---

## Pagination (Future Enhancement)

Future API versions will support pagination:
```
GET /credentials?page=1&limit=20&sort=createdAt&order=desc
```

---

**API Version**: 1.0.0  
**Last Updated**: December 2024
