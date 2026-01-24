# Project Summary & Quick Start Guide

## 📋 Project Overview

**Academic Credential Verification System** is a comprehensive blockchain-based solution to prevent academic credential fraud. It leverages Hyperledger Fabric for immutable credential storage, cryptographic hashing for integrity verification, and digital signatures for authenticity.

### Key Capabilities

✅ **Credential Issuance**: Universities issue digitally signed credentials  
✅ **QR Code Generation**: Embeds credential metadata and verification links  
✅ **Hash Verification**: Detects any tampering or modification  
✅ **Blockchain Storage**: Immutable ledger of all credentials  
✅ **Multi-Role System**: Admin, Issuer, Student, Verifier roles  
✅ **Audit Trails**: Complete transaction history  
✅ **DID Support**: Decentralized identity integration  

---

## 📁 Project Structure

```
project3/
├── backend/                    # Node.js/Express API
│   ├── config/                 # Configuration
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Express middleware
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── utils/                  # Utilities
│   ├── server.js              # Entry point
│   └── Dockerfile
│
├── frontend/                   # React Application
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── store/              # State management
│   │   └── index.css
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── blockchain/
│   ├── smart-contracts/        # Chaincode
│   │   ├── credential-contract.js
│   │   └── package.json
│   └── hyperledger-fabric/     # Fabric config
│       ├── network.json
│       └── enrollment.js
│
├── docker/
│   ├── docker-compose.yml      # Full stack setup
│   ├── setup-fabric.sh         # Fabric initialization
│   └── teardown-fabric.sh      # Cleanup script
│
├── docs/
│   ├── README.md               # Main documentation
│   ├── ARCHITECTURE.md         # System design & diagrams
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── SECURITY.md             # Security implementation
│   └── API.md                  # API reference
│
├── tests/
│   ├── Postman_Collection.json # API test collection
│   └── test.sh                 # Bash test script
│
└── .env.example                # Environment template
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
```bash
# Install required tools
- Node.js v18+
- Docker & Docker Compose
- Git
- curl or Postman (for API testing)
```

### 2. Clone & Setup (PowerShell, using D: drive)
```powershell
# Clone repository to D: drive
git clone <repo-url> D:\project3
Set-Location D:\project3

# Copy environment template
Copy-Item .env.example .env

# Install dependencies
Set-Location D:\project3\backend; npm install; Set-Location D:\project3
Set-Location D:\project3\frontend; npm install --legacy-peer-deps; Set-Location D:\project3
```

### 3. Start Services (PowerShell examples)
```powershell
# Terminal 1: Start MongoDB (named container, data stored by Docker elsewhere)
docker run -d `
  -e MONGO_INITDB_ROOT_USERNAME=admin `
  -e MONGO_INITDB_ROOT_PASSWORD=password123 `
  -p 27017:27017 `
  --name credential-mongodb `
  mongo:6.0

# Terminal 2: Start Backend (from project folder on D:)
Set-Location D:\project3\backend
npm run dev
# Runs on http://localhost:5000

# Terminal 3: Start Frontend (from project folder on D:)
Set-Location D:\project3\frontend
npm start
# Runs on http://localhost:3000
```

### 4. Test the System
```powershell
# Option 1: Use Postman
# Import: D:\project3\tests\Postman_Collection.json
# Set {{base_url}} = http://localhost:5000/api

# Option 2: Use Test Script (PowerShell uses bash from Git or WSL)
Set-Location D:\project3\tests
bash test.sh

# Option 3: Manual Testing (PowerShell curl alias)
Invoke-RestMethod http://localhost:5000/health
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: See `D:\project3\docs\API.md`

---

## 🎭 User Roles & Workflows

### Admin
- Manages all users
- Verifies new users
- Views system statistics
- Can perform all operations

### University Issuer
1. Register with organization name
2. Login to University Dashboard
3. Fill credential form:
   - Select student
   - Enter degree details (name, major, GPA)
   - Set dates
4. Click "Issue Credential"
5. System generates:
   - Unique Credential ID
   - SHA-256 hash
   - RSA-2048 signature
   - QR code
6. Download/Share QR code with student

### Student
1. Register as student
2. Login to Student Portal
3. View received credentials
4. Download credential PDFs
5. Share QR code with employers/verifiers

### Verifier
1. Register as verifier
2. Login to Verifier Portal
3. Select verification method:
   - Scan QR code
   - Enter credential hash
   - Enter credential ID
4. System verifies:
   - Hash integrity
   - Signature authenticity
   - Revocation status
   - Expiration date
5. View verification result

---

## 🔐 Security Features

| Feature | Implementation | Benefit |
|---------|----------------|---------|
| **Hashing** | SHA-256 | Detects tampering |
| **Signatures** | RSA-2048 | Proves authenticity |
| **Authentication** | JWT tokens | Secure user sessions |
| **Authorization** | RBAC | Role-based access control |
| **Blockchain** | Hyperledger Fabric | Immutable records |
| **Database** | MongoDB + Encryption | Secure data storage |
| **Audit Logs** | Blockchain recorded | Complete transaction history |

---

## 📡 API Quick Reference

### Authentication
```bash
# Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "organization": "Tech University"
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Credentials
```bash
# Issue credential (UNIVERSITY_ISSUER only)
POST /api/credentials/issue
Authorization: Bearer {token}
{
  "studentId": "STUDENT_ID",
  "credentialType": "DEGREE",
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "gpa": 3.85,
  "issueDate": "2024-01-15"
}

# Get credential
GET /api/credentials/{credentialId}
Authorization: Bearer {token}

# List student credentials
GET /api/credentials/student/list
Authorization: Bearer {token}

# Revoke credential
POST /api/credentials/{credentialId}/revoke
Authorization: Bearer {token}
{
  "reason": "Fraud detected"
}
```

### Verification
```bash
# Verify by hash
POST /api/verify/verify-hash
Authorization: Bearer {token}
{
  "credentialHash": "a1b2c3d4e5f6..."
}

# Verify by ID
GET /api/verify/{credentialId}/verify
Authorization: Bearer {token}

# Get verification history
GET /api/verify/{credentialId}/history
Authorization: Bearer {token}
```

See `/docs/API.md` for complete API documentation.

---

## 🐳 Docker Deployment

### Start All Services
```bash
cd docker
docker-compose up -d

# Services:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:5000
# - MongoDB: localhost:27017
# - IPFS: http://localhost:5001
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `/docs/README.md` | Main documentation |
| `/docs/ARCHITECTURE.md` | System design, flows, diagrams |
| `/docs/API.md` | Complete API reference |
| `/docs/DEPLOYMENT.md` | Deployment to Heroku/Vercel |
| `/docs/SECURITY.md` | Security measures & best practices |

---

## 🔄 Workflow Examples

### Example 1: Issuing a Credential
```
University Login
  ↓
Fill Credential Form
  ├─ Student: Alice Johnson
  ├─ Degree: BSc Computer Science
  ├─ GPA: 3.85
  └─ Issue Date: 2024-01-15
  ↓
Click "Issue"
  ├─ Generate SHA-256 hash
  ├─ Create RSA-2048 signature
  ├─ Store in MongoDB
  ├─ Submit to Hyperledger Fabric
  └─ Generate QR code
  ↓
Display Results
  ├─ Credential ID: CRED-1699...
  ├─ Transaction ID: txid-123...
  └─ QR Code: [image]
```

### Example 2: Verifying a Credential
```
Verifier Login
  ↓
Select Verification Method
  ├─ Option 1: Scan QR Code → Extract hash
  ├─ Option 2: Enter credential hash manually
  └─ Option 3: Enter credential ID
  ↓
Send Verification Request
  ├─ Retrieve credential from MongoDB
  ├─ Check hash validity
  ├─ Verify RSA signature
  ├─ Check revocation status
  ├─ Check expiration
  └─ Query blockchain
  ↓
Display Results
  ├─ Valid: ✓ (Green badge)
  ├─ Invalid: ✗ (Red badge)
  └─ Details:
     ├─ Student: Alice Johnson
     ├─ Issuer: Tech University
     ├─ Validation checks: [all pass/fail]
     └─ Verification history
```

---

## 🧪 Testing

### Manual Testing
```bash
# 1. Register users
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{...}'

# 2. Issue credential
curl -X POST http://localhost:5000/api/credentials/issue \
  -H "Authorization: Bearer {token}" \
  -d '{...}'

# 3. Verify credential
curl -X POST http://localhost:5000/api/verify/verify-hash \
  -H "Authorization: Bearer {token}" \
  -d '{...}'
```

### Automated Testing
```bash
# Run test script
cd tests
bash test.sh

# Expected output:
# ✓ User registration successful
# ✓ Credential issuance successful
# ✓ Credential verification successful
```

### Postman Testing
```
1. Import: tests/Postman_Collection.json
2. Set variables:
   - base_url: http://localhost:5000/api
   - token: (after login)
3. Run collection
```

---

## 🌐 Deployment Options

### Development
```bash
npm run dev  # Backend with nodemon
npm start    # Frontend with React dev server
```

### Production - Docker
```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Production - Heroku (Backend)
```bash
heroku create credential-api
git push heroku main
```

### Production - Vercel (Frontend)
```bash
vercel --prod
```

See `/docs/DEPLOYMENT.md` for detailed instructions.

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Ensure MongoDB is running: `docker ps | grep mongo`
- Check connection string in .env

### Issue: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Check CORS_ORIGIN in backend .env
- Should match frontend URL (http://localhost:3000)

### Issue: Token Expired
```
Error: Invalid or expired token
```
**Solution**:
- Login again to get new token
- Check token expiration in JWT_EXPIRE

### Issue: Credential Not Found
```
Error: Credential not found on blockchain
```
**Solution**:
- Ensure Hyperledger Fabric network is running
- Check FABRIC_* environment variables
- Verify chaincode is deployed

---

## 📞 Support & Resources

- **API Documentation**: `/docs/API.md`
- **Architecture Diagrams**: `/docs/ARCHITECTURE.md`
- **Security Guide**: `/docs/SECURITY.md`
- **Deployment Guide**: `/docs/DEPLOYMENT.md`
- **GitHub Issues**: Create issue in repository
- **Email Support**: support@credentialverify.com

---

## 🎯 Features Roadmap

### Phase 1 (Current) ✅
- Credential issuance and verification
- Basic user roles
- MongoDB + Hyperledger Fabric
- QR code generation

### Phase 2 (Planned)
- Mobile app for students
- Advanced analytics dashboard
- DID integration
- IPFS document storage
- Credential templates

### Phase 3 (Future)
- Cross-chain interoperability
- Zero-knowledge proofs
- Biometric verification
- Integration with education platforms

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Create Pull Request

---

**Project Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Blockchain Development Team
