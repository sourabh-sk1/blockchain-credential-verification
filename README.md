# Academic Credential Verification System

A blockchain-based system to prevent academic credential fraud using Hyperledger Fabric, featuring digitally signed credentials with cryptographic hashing and tamper-proof verification.

## Table of Contents

1. [Features](#features)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Installation & Setup](#installation--setup)
5. [Usage Guide](#usage-guide)
6. [API Documentation](#api-documentation)
7. [Security Features](#security-features)
8. [Deployment](#deployment)

## Features

✅ **Blockchain Integration**: Hyperledger Fabric for immutable credential storage  
✅ **Cryptographic Hashing**: SHA-256 hash verification for credential authenticity  
✅ **Digital Signatures**: RSA-2048 signatures for issuer authentication  
✅ **QR Code Generation**: Scannable credentials with embedded verification data  
✅ **Role-Based Access Control**: Admin, Issuer, Student, and Verifier roles  
✅ **Audit Logging**: Complete transaction history on blockchain  
✅ **DID Support**: Decentralized Identity for entities  
✅ **IPFS Integration**: Distributed PDF storage capability  
✅ **Credential Revocation**: Secure credential invalidation mechanism  

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer (React)                    │
├──────────────────────┬──────────────────────┬──────────────────┤
│  University          │  Student             │  Verifier        │
│  Dashboard           │  Portal              │  Portal          │
│  - Issue Credential  │  - View Credentials  │  - Scan QR Code  │
│  - Generate Hash     │  - Download Cert     │  - Verify Hash   │
│  - Generate QR       │  - Share Credential  │  - View History  │
└──────────┬───────────┴──────────┬───────────┴──────────┬────────┘
           │                      │                      │
           └──────────┬───────────┴──────────┬───────────┘
                      │ HTTPS API            │
                      ▼                      ▼
        ┌─────────────────────────────────────────────────┐
        │         Backend API Layer (Node.js/Express)     │
        ├─────────────────────────────────────────────────┤
        │  Controllers │ Services │ Middleware │ Routes   │
        │  ◆ Auth      │ Fabric   │ JWT Auth   │ Auth     │
        │  ◆ Creds     │ IPFS     │ Authorization │ Creds │
        │  ◆ Verify    │ DID      │ Error Handler │ Verify │
        └──────┬──────────────────────────────────────────┘
               │
      ┌────────┴──────────┬───────────────────┐
      │                   │                   │
      ▼                   ▼                   ▼
┌────────────────┐ ┌──────────────────┐ ┌──────────────┐
│   MongoDB      │ │ Hyperledger      │ │    IPFS      │
│  (Off-chain)   │ │ Fabric Network   │ │  (Optional)  │
│ ◆ User Data    │ │ ◆ Credentials   │ │ ◆ PDFs       │
│ ◆ Metadata     │ │ ◆ Hashes        │ │ ◆ Documents  │
│ ◆ Audit Logs   │ │ ◆ Audit Trail   │ │              │
└────────────────┘ └──────────────────┘ └──────────────┘
```

### Component Explanation

#### Frontend Components
- **University Dashboard**: Issue credentials, generate hashes, create QR codes
- **Student Portal**: View, download, and share credentials
- **Verifier Portal**: Verify credentials using hash or QR code scanning
- **Admin Dashboard**: Manage users and view statistics

#### Backend Services
- **Authentication Service**: User registration, login, JWT token generation
- **Credential Service**: Issue, retrieve, revoke credentials
- **Verification Service**: Verify credentials, maintain verification history
- **Blockchain Service**: Interact with Hyperledger Fabric network
- **IPFS Service**: Store and retrieve PDF documents
- **DID Service**: Generate and manage Decentralized Identifiers

#### Blockchain Layer
- **Hyperledger Fabric**: Permissioned blockchain network
- **Smart Contract (Chaincode)**: Credential issuance, verification, revocation
- **Channel**: `credential-channel` for credential transactions

## Technology Stack

### Backend
- **Runtime**: Node.js v18
- **Framework**: Express.js
- **Database**: MongoDB (off-chain metadata)
- **Blockchain**: Hyperledger Fabric 2.2
- **Security**: JWT, bcrypt, RSA-2048, SHA-256
- **File Storage**: IPFS (optional)

### Frontend
- **Framework**: React 18
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **QR Code**: qrcode.react

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Deployment**: Heroku (Backend), Vercel (Frontend), Docker (Local)

## Installation & Setup

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- Git
- MongoDB (or use Docker container)

### Local Development Setup

#### 1. Clone Repository (example using D: drive)
```powershell
# Clone directly into D:\projects\project3
git clone <repository-url> D:\projects\project3
Set-Location D:\projects\project3
```

#### 2. Install Dependencies (from D: project location)

**Backend:**
```powershell
Set-Location D:\projects\project3\backend
npm install
```

**Frontend:**
```powershell
Set-Location D:\projects\project3\frontend
npm install --legacy-peer-deps
```

#### 3. Configure Environment Variables

**Backend** (`.env`):
```env
BACKEND_PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/academic-credentials
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:3000
FABRIC_CHANNEL_NAME=credential-channel
FABRIC_CHAINCODE_NAME=credential-contract
IPFS_API_URL=http://localhost:5001
```

**Frontend** (`.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NETWORK_NAME=local-fabric
```

#### 4. Start MongoDB
```bash
# Using Docker
docker run -d \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -p 27017:27017 \
  --name credential-mongodb \
  mongo:6.0
```

#### 5. Start Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### 6. Start Frontend (in new terminal)
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### Docker Compose Setup

```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

## Usage Guide

### 1. User Registration

**Register as University:**
1. Go to /register
2. Select Role: "University"
3. Enter organization name (your university name)
4. Complete registration

**Register as Student:**
1. Go to /register
2. Select Role: "Student"
3. Complete registration

**Register as Verifier:**
1. Go to /register
2. Select Role: "Verifier"
3. Complete registration

### 2. Issue Credential (University Dashboard)

1. Login with university account
2. Navigate to University Dashboard
3. Fill in credential details:
   - Student ID (select student)
   - Credential Type (Degree, Diploma, Certificate, Transcript)
   - Degree name
   - Major
   - GPA
   - Issue Date
   - Expiry Date (optional)
4. Click "Issue Credential"
5. System generates:
   - Unique Credential ID
   - SHA-256 cryptographic hash
   - RSA-2048 digital signature
   - QR code containing all metadata
6. Download QR code for distribution

### 3. View Credentials (Student Portal)

1. Login with student account
2. Navigate to Student Portal
3. View list of issued credentials with:
   - Issuer information
   - Credential type and degree
   - Issue date
   - Current status

### 4. Verify Credential (Verifier Portal)

**Method 1: By Hash**
1. Login with verifier account
2. Navigate to Verifier Portal
3. Enter credential hash (64-character hex string)
4. System verifies:
   - Hash matches blockchain record
   - Digital signature is valid
   - Credential is not revoked
   - Credential is not expired
5. View verification result with details

**Method 2: By Credential ID**
1. Enter credential ID
2. System performs same verification checks
3. Display verification result

**Method 3: QR Code Scan**
1. Use QR code scanner
2. Extract credential ID and hash
3. Automatically verify

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "organization": "Tech University"
}

Response: {
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "USER-1699000000000-abc123",
    "email": "john@example.com",
    "role": "STUDENT",
    "did": "did:fabric:credential-channel:DefaultMSP:john@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: {
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Credential Endpoints

#### Issue Credential
```http
POST /api/credentials/issue
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": "STUDENT_MONGO_ID",
  "credentialType": "DEGREE",
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "gpa": 3.85,
  "issueDate": "2024-01-15",
  "expiryDate": "2034-01-15"
}

Response: {
  "message": "Credential issued successfully",
  "credential": {
    "credentialId": "CRED-1699000000000-XYZ789",
    "credentialHash": "a1b2c3d4e5f6...",
    "transactionId": "fabric-tx-id-12345",
    "qrCode": "data:image/png;base64,..."
  }
}
```

#### Verify Credential
```http
POST /api/verify/verify-hash
Authorization: Bearer {token}
Content-Type: application/json

{
  "credentialHash": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}

Response: {
  "isValid": true,
  "credentialId": "CRED-1699000000000-XYZ789",
  "student": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "issuer": {
    "name": "Tech University"
  },
  "details": {
    "hashMatch": true,
    "signatureValid": true,
    "notRevoked": true,
    "notExpired": true,
    "blockchainValid": true
  }
}
```

#### List Student Credentials
```http
GET /api/credentials/student/list
Authorization: Bearer {token}

Response: {
  "count": 3,
  "credentials": [
    {
      "credentialId": "CRED-...",
      "issuer": "Tech University",
      "type": "DEGREE",
      "degree": "Bachelor of Science",
      "status": "ISSUED",
      "issueDate": "2024-01-15"
    }
  ]
}
```

#### Revoke Credential
```http
POST /api/credentials/{credentialId}/revoke
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Credential invalidation due to fraud detection"
}

Response: {
  "message": "Credential revoked successfully"
}
```

#### Get Audit Trail
```http
GET /api/credentials/{credentialId}/audit
Authorization: Bearer {token}

Response: {
  "credentialId": "CRED-...",
  "auditTrail": [
    {
      "action": "ISSUED",
      "performedBy": "John University",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "SUCCESS"
    },
    {
      "action": "VERIFIED",
      "performedBy": "Verifier Name",
      "timestamp": "2024-01-16T14:20:00Z",
      "status": "SUCCESS"
    }
  ]
}
```

## Security Features

### 1. **Cryptographic Hashing**
- Algorithm: SHA-256
- Use Case: Generate unique, immutable hash for each credential
- Verification: Hash comparison ensures document integrity

### 2. **Digital Signatures**
- Algorithm: RSA-2048
- Implementation: Each credential signed by issuer's private key
- Verification: Signature verified using issuer's public key
- Benefit: Ensures authenticity and non-repudiation

### 3. **Blockchain Immutability**
- Technology: Hyperledger Fabric
- Features:
  - Append-only ledger
  - Cryptographic linking between blocks
  - Merkle tree based data structure
  - Byzantine Fault Tolerant consensus

### 4. **Access Control**
- Method: Role-Based Access Control (RBAC)
- Roles: Admin, University Issuer, Student, Verifier
- JWT-based authentication with expiration
- Token stored in HTTP-only cookies (production)

### 5. **Database Security**
- MongoDB authentication required
- Field-level encryption for sensitive data
- Indexed queries for performance and security

### 6. **Audit Logging**
- All credential operations logged
- Blockchain-recorded audit trail
- Immutable action history
- Timestamp for forensic analysis

### 7. **DID (Decentralized Identity)**
- Format: `did:fabric:channel:msp:entityid`
- Benefits:
  - Decentralized and verifiable
  - Cross-chain compatibility
  - Self-sovereign identity

### 8. **Credential Revocation**
- Revocation reasons logged
- Immediate status update
- Blockchain-recorded revocation
- Verification rejects revoked credentials

### 9. **Tamper Detection**
- Hash mismatch indicates tampering
- Signature verification fails if credential modified
- Blockchain consensus prevents record modification

## Deployment

### Deploy Backend to Heroku

```bash
# 1. Create Heroku app
heroku create credential-api

# 2. Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# 3. Deploy
git push heroku main

# 4. View logs
heroku logs --tail
```

### Deploy Frontend to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel --prod

# 3. Configure environment variables in Vercel dashboard
REACT_APP_API_URL=https://credential-api.herokuapp.com/api
```

### Deploy with Docker

```bash
# Build images
docker build -t credential-backend ./backend
docker build -t credential-frontend ./frontend

# Push to Docker Hub
docker push your_username/credential-backend
docker push your_username/credential-frontend

# Pull and run on server
docker pull your_username/credential-backend
docker run -d -p 5000:5000 your_username/credential-backend
```

## Project Structure

```
project3/
├── backend/                          # Node.js/Express API
│   ├── config/                       # Configuration files
│   ├── controllers/                  # Request handlers
│   ├── middleware/                   # Express middleware
│   ├── models/                       # MongoDB schemas
│   ├── routes/                       # API routes
│   ├── services/                     # Business logic
│   ├── utils/                        # Utility functions
│   ├── server.js                     # Entry point
│   └── package.json
│
├── frontend/                         # React application
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API services
│   │   ├── store/                    # State management
│   │   ├── App.js                    # Main component
│   │   └── index.css                 # Tailwind styles
│   └── package.json
│
├── blockchain/
│   ├── smart-contracts/              # Chaincode
│   │   ├── credential-contract.js    # Smart contract
│   │   └── package.json
│   └── hyperledger-fabric/           # Fabric configuration
│       ├── network.json              # Network config
│       └── enrollment.js             # User enrollment
│
├── docker/                           # Docker setup
│   ├── docker-compose.yml            # Compose file
│   └── setup-fabric.sh               # Fabric setup script
│
├── docs/                             # Documentation
│   ├── README.md                     # This file
│   ├── ARCHITECTURE.md               # Architecture details
│   ├── API.md                        # API documentation
│   └── DEPLOYMENT.md                 # Deployment guide
│
└── tests/                            # Test files
```

## Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Manual API Testing with Postman

Import the Postman collection:
```bash
# Available in: tests/Academic_Credential_Verification.postman_collection.json
```

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running and accessible at the configured URI

### Fabric Network Error
```
Error: Failed to connect to orderer
```
**Solution**: Check Fabric network is properly set up and all components are running

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Verify CORS_ORIGIN in backend .env matches frontend URL

### JWT Token Expired
```
Error: Invalid or expired token
```
**Solution**: Login again to get new token

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Create GitHub Issue
- Email: support@credentialverify.com
- Documentation: https://docs.credentialverify.com

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintainer**: Blockchain Team
