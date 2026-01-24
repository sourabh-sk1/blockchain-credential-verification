# System Architecture & Flow Diagrams

## 1. Credential Issuance Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                      CREDENTIAL ISSUANCE FLOW                      │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  University     │
│  Admin User     │
└────────┬────────┘
         │ 1. Login & Access Dashboard
         ▼
    ┌──────────────┐
    │ University   │
    │ Dashboard    │
    └──────┬───────┘
           │ 2. Fill credential form
           │    - Student ID
           │    - Degree name
           │    - GPA, Major
           │    - Dates
           ▼
    ┌──────────────────────┐
    │  Issue Credential    │
    │  API Endpoint        │
    │ /api/credentials/    │
    │    issue             │
    └──────┬───────────────┘
           │ 3. Validate input
           ▼
    ┌────────────────────┐
    │  Generate Hashes   │
    │  & Signatures      │
    │ ◆ SHA-256 hash     │
    │ ◆ RSA-2048 sig     │
    └──────┬─────────────┘
           │ 4. Create credential record
           ▼
    ┌────────────────────┐
    │  Store in MongoDB  │
    │  (Off-chain DB)    │
    └──────┬─────────────┘
           │ 5. Submit to blockchain
           ▼
    ┌────────────────────────┐
    │  Hyperledger Fabric    │
    │  Smart Contract        │
    │  ◆ Store hash          │
    │  ◆ Record in ledger    │
    │  ◆ Create audit trail  │
    └──────┬─────────────────┘
           │ 6. Return transaction ID
           ▼
    ┌────────────────────┐
    │  Generate QR Code  │
    │  with metadata     │
    └──────┬─────────────┘
           │ 7. Return to frontend
           ▼
    ┌──────────────────────┐
    │  Display QR Code     │
    │  & Credential Info   │
    │ ◆ Credential ID      │
    │ ◆ Transaction Hash   │
    │ ◆ QR code image      │
    └──────────────────────┘
           │ 8. Download/Share
           ▼
    ┌──────────────────────┐
    │  Student Receives    │
    │  Credential with QR  │
    └──────────────────────┘
```

## 2. Credential Verification Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                    CREDENTIAL VERIFICATION FLOW                    │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Verifier/      │
│  Employer       │
└────────┬────────┘
         │ 1. Access Verifier Portal
         ▼
    ┌──────────────────┐
    │ Verifier Portal  │
    └──────┬───────────┘
           │ 2. Select verification method
           ├─ Scan QR Code
           ├─ Enter Hash
           └─ Enter Credential ID
           ▼
    ┌────────────────────────────┐
    │  Extract/Input Credential  │
    │  ID & Hash                 │
    └──────┬─────────────────────┘
           │ 3. Send verification request
           ▼
    ┌────────────────────────┐
    │  Verification API      │
    │ /api/verify/verify-    │
    │    hash or             │
    │ /api/verify/{credID}/  │
    │    verify              │
    └──────┬─────────────────┘
           │ 4. Query MongoDB
           ▼
    ┌──────────────────────┐
    │  Retrieve Credential │
    │  from Database       │
    └──────┬───────────────┘
           │
           ├─ Hash exists?
           ├─ Signature valid?
           ├─ Not revoked?
           └─ Not expired?
           ▼
    ┌────────────────────────────┐
    │  Verify on Blockchain      │
    │ Call Smart Contract        │
    │ verifyCredential()         │
    └──────┬─────────────────────┘
           │ 5. Blockchain verification
           ├─ Hash match check
           ├─ Revocation status
           └─ Ledger record lookup
           ▼
    ┌─────────────────────────┐
    │  Compilation Check      │
    │ Hash match:       [✓/✗] │
    │ Signature:        [✓/✗] │
    │ Not revoked:      [✓/✗] │
    │ Not expired:      [✓/✗] │
    │ Blockchain valid: [✓/✗] │
    └──────┬──────────────────┘
           │
           ├─ All checks pass?
           │ YES → VALID
           │ NO  → INVALID
           ▼
    ┌────────────────────────┐
    │  Create Verification   │
    │  Record               │
    │  (Store in DB)        │
    │  (Audit logging)      │
    └──────┬─────────────────┘
           │ 6. Return results
           ▼
    ┌──────────────────────────┐
    │  Display Verification    │
    │  Result                  │
    │ ◆ Valid/Invalid          │
    │ ◆ Student info           │
    │ ◆ Issuer info            │
    │ ◆ Credential details     │
    │ ◆ Detailed checks        │
    └──────────────────────────┘
```

## 3. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW DIAGRAM                           │
└──────────────────────────────────────────────────────────────────────┘

                            FRONTEND (React)
                    ┌─────────────────────────────┐
                    │  University │ Student       │
                    │  Verifier   │ Admin         │
                    └──────────┬──────────────────┘
                               │ REST API (HTTPS)
                               ▼
                    ┌──────────────────────┐
                    │   Backend API        │
                    │   (Node.js/Express)  │
                    │                      │
        ┌───────────┤  Controllers         │◄─────┐
        │           │  Middleware          │      │
        │           │  Routes              │      │
        │           └──────────────────────┘      │
        │                   │                      │
        │                   │ Queries              │ Updates
        │                   │                      │
        ▼                   ▼                      │
    ┌──────────────────────────────┐              │
    │      MongoDB Database        │──────────────┘
    │ (Off-chain Data)             │
    │ ┌────────────────────────┐   │
    │ │ ◆ User Data            │   │
    │ │ ◆ Credentials          │   │
    │ │ ◆ Verifications        │   │
    │ │ ◆ Audit Logs           │   │
    │ └────────────────────────┘   │
    └──────────────────────────────┘


        ┌──────────────────┐
        │ Fabric Service   │
        └────────┬─────────┘
                 │ Transaction invocation
                 ▼
    ┌────────────────────────────────┐
    │  Hyperledger Fabric            │
    │  (Blockchain Layer)            │
    │ ┌──────────────────────────┐   │
    │ │ Smart Contract           │   │
    │ │ (Credential Chaincode)   │   │
    │ │ ◆ issueCredential()      │   │
    │ │ ◆ verifyCredential()     │   │
    │ │ ◆ revokeCredential()     │   │
    │ └──────────────────────────┘   │
    │ ┌──────────────────────────┐   │
    │ │ Ledger (Immutable)       │   │
    │ │ ◆ Credential hashes      │   │
    │ │ ◆ Audit trail            │   │
    │ │ ◆ Transaction history    │   │
    │ └──────────────────────────┘   │
    └────────────────────────────────┘


    ┌─────────────────────────┐
    │   IPFS Network          │
    │   (Optional)            │
    │ ┌─────────────────────┐ │
    │ │ PDF Documents       │ │
    │ │ (Distributed)       │ │
    │ └─────────────────────┘ │
    └─────────────────────────┘
```

## 4. Role-Based Access Control

```
┌────────────────────────────────────────────────────────────┐
│             ROLE-BASED ACCESS CONTROL (RBAC)              │
└────────────────────────────────────────────────────────────┘

┌───────────────────┐
│     ADMIN         │
├───────────────────┤
│ ✓ View all users  │
│ ✓ Verify users    │
│ ✓ View stats      │
│ ✓ Issue creds     │
│ ✓ Verify creds    │
│ ✓ Revoke creds    │
│ ✓ View audit logs │
└───────────────────┘

┌──────────────────────────┐
│  UNIVERSITY ISSUER       │
├──────────────────────────┤
│ ✓ Issue credentials      │
│ ✓ Generate hashes & QR   │
│ ✓ View issued creds      │
│ ✓ Revoke own creds       │
│ ✓ View verification hist │
│ ✗ View other universities│
│ ✗ Verify credentials     │
└──────────────────────────┘

┌──────────────────────────┐
│        STUDENT           │
├──────────────────────────┤
│ ✓ View own credentials   │
│ ✓ Download certificates  │
│ ✓ Share credentials      │
│ ✓ View QR codes          │
│ ✗ Issue credentials      │
│ ✗ Verify credentials     │
│ ✗ View other students    │
└──────────────────────────┘

┌──────────────────────────┐
│       VERIFIER           │
├──────────────────────────┤
│ ✓ Verify credentials     │
│ ✓ Scan QR codes          │
│ ✓ View verification hist │
│ ✓ View credential info   │
│ ✗ Issue credentials      │
│ ✗ Revoke credentials     │
│ ✗ View student data      │
└──────────────────────────┘
```

## 5. Cryptographic Process

```
┌──────────────────────────────────────────────────────────┐
│         CRYPTOGRAPHIC VERIFICATION PROCESS               │
└──────────────────────────────────────────────────────────┘

CREDENTIAL DATA
      │
      ├─────────────────────────────────┐
      │                                 │
      ▼                                 ▼
  ┌─────────────┐               ┌──────────────┐
  │  SHA-256    │               │ RSA-2048     │
  │  Hashing    │               │ Signing      │
  └──────┬──────┘               └────────┬─────┘
         │                               │
         ▼                               ▼
   ┌──────────────┐           ┌──────────────────┐
   │ HASH         │           │ SIGNATURE        │
   │              │           │ (Base64 encoded) │
   │ 64-char hex  │           │                  │
   │ string       │           │ RSA-2048 key     │
   └──────┬───────┘           │ pair generated   │
          │                   └────────┬─────────┘
          │                            │
          ├────────────────┬───────────┘
          │                │
          ▼                ▼
      STORED ON BLOCKCHAIN + DATABASE

VERIFICATION PROCESS:

1. HASH VERIFICATION
   ┌──────────────────┐
   │ Received Hash    │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────┐
   │ Compare with         │
   │ Stored Hash          │
   └────────┬─────────────┘
            │
            ├─ Match? [✓ PASS]
            └─ No match? [✗ FAIL - TAMPERED]

2. SIGNATURE VERIFICATION
   ┌──────────────────┐
   │ Received         │
   │ Signature        │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ Issuer's Public Key          │
   │ (Known & Trusted)            │
   └────────┬─────────────────────┘
            │
            ▼
   ┌──────────────────────────────┐
   │ RSA Verify                   │
   │ (Decrypt with pub key)       │
   └────────┬─────────────────────┘
            │
            ├─ Signature valid? [✓ AUTHENTIC]
            └─ Invalid? [✗ FORGED]

3. BLOCKCHAIN VALIDATION
   ┌──────────────────────┐
   │ Query Blockchain     │
   │ Smart Contract       │
   └────────┬─────────────┘
            │
            ├─ Exists? [✓]
            ├─ Not revoked? [✓]
            └─ Not expired? [✓]
            │
            ▼
   ┌──────────────────────┐
   │ ALL CHECKS PASS      │
   │ = VALID CREDENTIAL   │
   └──────────────────────┘
```

## 6. Sequence Diagram - Credential Issuance

```
University    Frontend    Backend API    MongoDB    Fabric
   │             │             │            │          │
   │ 1. Fill Form├────────────►│            │          │
   │             │             │            │          │
   │             │             │2. Validate │          │
   │             │             │ Input      │          │
   │             │             │            │          │
   │             │             │3. Generate │          │
   │             │             │ Hash & Sig │          │
   │             │             │            │          │
   │             │             │4. Save──────────────►│
   │             │             │ to DB      │          │
   │             │             │◄───────────┤          │
   │             │             │ saved      │          │
   │             │             │            │          │
   │             │             │5. Submit───────────────►
   │             │             │ to Chain   │          │
   │             │             │            │          │
   │             │             │◄───────────────────────
   │             │             │ TxID       │
   │             │             │            │
   │             │6. Generate  │            │
   │             │ QR Code     │            │
   │             │             │            │
   │             │7. Response◄─┤ Credential │
   │             │ with QR     │ Info       │
   │◄────────────┤             │            │
   │ QR Code     │             │            │
   │ Downloaded  │             │            │
```

## 7. Security Layers

```
┌──────────────────────────────────────────────────────────┐
│               MULTI-LAYER SECURITY                       │
└──────────────────────────────────────────────────────────┘

LAYER 1: TRANSPORT SECURITY
├─ HTTPS/TLS encryption
├─ Certificate validation
└─ Secure WebSocket (WSS)

LAYER 2: APPLICATION SECURITY
├─ JWT token authentication
├─ Role-based access control
├─ Input validation & sanitization
└─ Rate limiting & DDoS protection

LAYER 3: DATA SECURITY
├─ SHA-256 hashing (integrity)
├─ RSA-2048 signing (authenticity)
├─ Database encryption
└─ Field-level encryption for PII

LAYER 4: BLOCKCHAIN SECURITY
├─ Hyperledger Fabric (permissioned)
├─ Byzantine Fault Tolerance
├─ Cryptographic linking
├─ Immutable audit trail
└─ Smart contract validation

LAYER 5: INFRASTRUCTURE SECURITY
├─ MongoDB authentication
├─ Network segmentation
├─ Firewall rules
└─ Container security
```

---

**Last Updated**: December 2024
