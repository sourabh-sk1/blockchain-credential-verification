# Security Implementation & Best Practices

## Overview

This document details the comprehensive security measures implemented in the Academic Credential Verification System to ensure data integrity, authentication, authorization, and tamper-proof credential verification.

## 1. Cryptographic Security

### 1.1 Hash Functions (SHA-256)

**Implementation:**
```javascript
// Generate SHA-256 hash of credential data
const generateFileHash = (fileBuffer) => {
  return crypto.createHash('sha256')
    .update(fileBuffer)
    .digest('hex');
};
```

**Properties:**
- **Algorithm**: SHA-256 (Secure Hash Algorithm)
- **Output Size**: 256 bits (64 hexadecimal characters)
- **Collision Resistance**: Cryptographically secure
- **Use Case**: Credential integrity verification

**Security Benefits:**
- Any modification of credential data changes the hash
- Impossible to reverse hash to find original data
- Unique identifier for each credential version
- Enables tamper detection

### 1.2 Digital Signatures (RSA-2048)

**Implementation:**
```javascript
const generateKeyPair = () => {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
};

const signData = (data, privateKey) => {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(JSON.stringify(data));
  return sign.sign(privateKey, 'base64');
};
```

**Properties:**
- **Algorithm**: RSA-2048 with SHA-256
- **Key Size**: 2048 bits
- **Signature Size**: 256 bytes (base64 encoded: ~344 characters)
- **Signer**: University/Issuer organization

**Security Benefits:**
- Proves credential was issued by authorized institution
- Prevents unauthorized credential creation
- Non-repudiation: Issuer cannot deny signing
- Any modification invalidates signature

### 1.3 Verification Process

```
RECEIVED CREDENTIAL
    ↓
[1] Extract signature from credential
[2] Get issuer's public key
[3] Use public key to verify signature
    ├─ If valid: ✓ Authentic (issued by stated issuer)
    └─ If invalid: ✗ Forged or tampered

[4] Compare hash with credential data
    ├─ If match: ✓ Data integrity intact
    └─ If no match: ✗ Data has been modified
```

## 2. Authentication & Authorization

### 2.1 JWT (JSON Web Tokens)

**Implementation:**
```javascript
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

**Token Structure:**
```
Header.Payload.Signature

Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "id": "user_id",
  "email": "user@example.com",
  "role": "STUDENT",
  "iat": 1699000000,
  "exp": 1699604800
}

Signature: HMAC-SHA256(header.payload, secret)
```

**Security Features:**
- Signed using HS256 (HMAC-SHA256)
- Secret key stored in environment variables
- Includes expiration time (7 days default)
- Cannot be modified without invalid signature

### 2.2 Password Security

**Implementation:**
```javascript
// Registration: Hash password with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// Login: Compare provided password with stored hash
const passwordMatch = await bcrypt.compare(password, user.password);
```

**Properties:**
- **Algorithm**: bcrypt with salt rounds: 10
- **Salt**: Randomly generated for each password
- **Cost Factor**: 10 (2^10 = 1024 iterations)
- **Protection**: Resistant to rainbow table attacks

### 2.3 Role-Based Access Control (RBAC)

**Roles:**
```javascript
{
  ADMIN: [
    - View all users
    - Verify users
    - Issue credentials
    - Verify credentials
    - Revoke credentials
    - View statistics
  ],
  
  UNIVERSITY_ISSUER: [
    - Issue credentials
    - Generate hashes
    - View issued credentials
    - Revoke own credentials
    - View verification history
  ],
  
  STUDENT: [
    - View own credentials
    - Download certificates
    - Share credentials
    - View QR codes
  ],
  
  VERIFIER: [
    - Verify credentials
    - View verification history
    - View credential details
  ]
}
```

**Implementation:**
```javascript
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

## 3. Blockchain Security

### 3.1 Hyperledger Fabric

**Security Model:**
- **Type**: Permissioned blockchain
- **Network**: Private/consortium network
- **Consensus**: Byzantine Fault Tolerant (PBFT)
- **Access Control**: Certificate-based authentication

**Properties:**
- Only authorized participants can join network
- Cryptographic certificates required
- Private transactions between organizations
- Auditable and transparent operations

### 3.2 Smart Contract Validation

**Chaincode Security:**
```javascript
async verifyCredential(credentialId, credentialHash) {
  // 1. Validate inputs
  if (!credentialId || !credentialHash) {
    throw new Error('Required parameters missing');
  }
  
  // 2. Validate hash format
  if (!/^[a-f0-9]{64}$/i.test(credentialHash)) {
    throw new Error('Invalid hash format');
  }
  
  // 3. Retrieve from ledger
  const credential = await ctx.stub.getState(credentialId);
  
  // 4. Compare hashes
  const verification = {
    hashMatch: credential.credentialHash === credentialHash,
    notRevoked: !credential.isRevoked,
    notExpired: !credential.expiryDate || new Date() < credential.expiryDate
  };
  
  // 5. Record verification
  credential.auditTrail.push({
    action: 'VERIFIED',
    timestamp: new Date().toISOString(),
    result: verification.hashMatch ? 'SUCCESS' : 'FAILED'
  });
  
  return verification;
}
```

### 3.3 Ledger Immutability

**Blockchain Properties:**
- Append-only: Only new records can be added
- Cryptographic Linking: Each block references previous
- Merkle Tree: Efficient integrity verification
- Consensus Required: Multiple nodes must agree
- Tamper Detection: Any modification invalidates chain

**Attack Resistance:**
- **Brute Force**: ~2^256 combinations to find valid hash
- **Replay Attack**: Timestamp and nonce prevent replay
- **Modification**: Would require modifying all subsequent blocks
- **Byzantine Attack**: Requires majority of nodes compromise

## 4. Data Security

### 4.1 Database Authentication

**MongoDB:**
```bash
# Enable authentication
MONGODB_URI=mongodb://user:password@host:port/database

# User credentials in environment variables
MONGODB_USER=admin
MONGODB_PASSWORD=secure_password
```

### 4.2 Field-Level Encryption

**Sensitive Fields:**
- Passwords: Hashed with bcrypt
- Private Keys: Encrypted in storage
- Signatures: Stored as base64 encoded
- Audit Logs: Immutable blockchain records

### 4.3 Audit Logging

**Logged Events:**
```javascript
{
  action: 'CREDENTIAL_ISSUED',
  userId: 'user_id',
  resourceType: 'CREDENTIAL',
  resourceId: 'credential_id',
  oldValue: null,
  newValue: { credentialId, issuer, student },
  status: 'SUCCESS',
  timestamp: new Date().toISOString(),
  ipAddress: req.ip,
  userAgent: req.get('User-Agent')
}
```

**Benefits:**
- Forensic analysis capability
- User accountability
- Compliance with regulations
- Tamper evidence

## 5. Transport Security

### 5.1 HTTPS/TLS

**Configuration:**
```bash
# Production: Use SSL certificates
ssl_certificate /etc/ssl/cert.pem
ssl_certificate_key /etc/ssl/key.pem
ssl_protocols TLSv1.2 TLSv1.3
ssl_ciphers HIGH:!aNULL:!MD5
```

**Security Headers:**
```javascript
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

### 5.2 CORS Protection

**Frontend Configuration:**
```javascript
const api = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

// CORS headers set by backend
// Access-Control-Allow-Origin: https://frontend.example.com
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE
// Access-Control-Allow-Headers: Authorization, Content-Type
```

## 6. Input Validation & Sanitization

**Implementation:**
```javascript
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const messages = error.details.map(detail => detail.message);
      return res.status(400).json({ errors: messages });
    }
    
    req.validatedBody = value;
    next();
  };
};
```

**Validation Rules:**
- Email format validation
- Password strength requirements
- Hash format validation (64 hex chars)
- Credential data type checking
- SQL injection prevention
- XSS protection

## 7. API Security

### 7.1 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests'
});

app.use('/api/', limiter);
```

### 7.2 DDoS Protection

- Rate limiting per IP
- Request timeout: 30 seconds
- Request size limits
- Connection throttling

## 8. Security Best Practices

### 8.1 Environment Variables

**Sensitive Data to Protect:**
```env
JWT_SECRET=strong_random_secret
MONGODB_PASSWORD=strong_password
FABRIC_CA_PASSWORD=secure_password
PRIVATE_KEY_PATH=/secure/path
```

**Never:**
- Commit secrets to version control
- Use weak or default passwords
- Share production credentials
- Log sensitive data

### 8.2 Key Rotation

**Process:**
1. Generate new key pair
2. Gradual rollout to new credentials
3. Maintain old keys for verification
4. Deprecate old keys after grace period

### 8.3 Security Patches

**Update Schedule:**
- Critical: Immediate
- High: Within 7 days
- Medium: Within 30 days
- Low: Next release cycle

**Dependencies to Monitor:**
- fabric-network
- mongoose
- express
- jsonwebtoken

### 8.4 Regular Audits

**Security Checklist:**
- [ ] Review access logs
- [ ] Verify RBAC enforcement
- [ ] Check for unused endpoints
- [ ] Audit database permissions
- [ ] Test backup restoration
- [ ] Review encryption keys
- [ ] Check certificate expiration
- [ ] Validate TLS configuration

## 9. Threat Model & Mitigation

### 9.1 Threat: Credential Forgery

**Attack Vector**: Unauthorized creation of credentials
**Mitigation**:
- RSA-2048 digital signature requirement
- RBAC: Only UNIVERSITY_ISSUER can issue
- Blockchain immutability
- Audit logging

### 9.2 Threat: Credential Tampering

**Attack Vector**: Modification of issued credentials
**Mitigation**:
- SHA-256 hash verification
- Digital signature validation
- Blockchain immutability
- Hash mismatch detection

### 9.3 Threat: Unauthorized Access

**Attack Vector**: Accessing credentials without permission
**Mitigation**:
- JWT authentication
- Role-based authorization
- Database access control
- Audit logging

### 9.4 Threat: Credential Duplication

**Attack Vector**: Copying valid credentials
**Mitigation**:
- Unique credential IDs
- Transaction IDs from blockchain
- Verification counter tracking
- Issuer signature binding

### 9.5 Threat: Revocation Bypass

**Attack Vector**: Using revoked credentials
**Mitigation**:
- Revocation status checked on verification
- Blockchain records immutable
- Revocation logged and audited
- All verifiers check current status

## 10. Compliance & Standards

**Standards Addressed:**
- OWASP Top 10: Protection against common web vulnerabilities
- CWE/SANS Top 25: Common Weakness Enumeration mitigations
- ISO 27001: Information security management
- GDPR: Data protection (if applicable)
- SOC 2: Security and availability controls

---

**Security Version**: 1.0.0  
**Last Updated**: December 2024  
**Next Review**: June 2025
