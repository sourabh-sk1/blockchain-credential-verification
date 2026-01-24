const Credential = require('../models/Credential');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Verification = require('../models/Verification');
const fabricService = require('../services/fabricService');
const ipfsService = require('../services/ipfsService');
const didService = require('../services/didService');
const { generateFileHash, generateStringHash, signData, generateCredentialId } = require('../utils/cryptography');
const { generateQRCode, generateQRCodeBuffer } = require('../utils/qrCode');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Issue a new credential
 */
exports.issueCredential = async (req, res) => {
  try {
    const { studentId, credentialType, degree, major, gpa, issueDate, expiryDate, metadata } = req.body;
    const issuerId = req.user.id;

    if (!studentId || !credentialType || !degree || !major || gpa === undefined || !issueDate) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: { studentId, credentialType, degree, major, gpa, issueDate }
      });
    }

    const gpaNumber = Number(gpa);
    if (Number.isNaN(gpaNumber)) {
      return res.status(400).json({ error: 'Invalid GPA' });
    }

    logger.info('Issue credential request received', {
      studentId,
      credentialType,
      degree,
      major,
      gpa: gpaNumber,
      issueDate,
      expiryDate
    });

    // Validate student exists
    let student = await User.findOne({ email: studentId });
    if (!student) {
      student = await User.findOne({ userId: studentId });
    }
    if (!student || student.role !== 'STUDENT') {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Validate issuer is university
    const issuer = await User.findById(issuerId);
    if (issuer.role !== 'UNIVERSITY_ISSUER' && issuer.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only university issuers can issue credentials' });
    }

    // Generate credential data
    const credentialId = generateCredentialId();
    const credentialData = {
      credentialId,
      studentId: student._id,
      studentEmail: student.email,
      issuerId: issuer._id,
      issuerName: issuer.organization,
      credentialType,
      degree,
      major,
      gpa,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      issuedAt: new Date(),
      metadata: metadata || {}
    };

    // Generate hashes
    const credentialHash = generateStringHash(credentialData);
    const signature = `MOCK_SIGNATURE_${credentialId}`;

    // Create credential in database
    const credential = new Credential({
      credentialId,
      studentId: student._id,
      issuerId: issuer._id,
      credentialType,
      degree,
      major,
      gpa,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      credentialHash,
      pdfHash: credentialHash,
      signature,
      signerPublicKey: issuer.publicKey,
      status: 'ISSUED',
      metadata: { payload: JSON.stringify(credentialData) }
    });

    // Issue on blockchain
    try {
      const transactionId = await fabricService.issueCredential({
        credentialId,
        credentialHash,
        studentId: student.userId,
        issuerId: issuer.userId,
        metadata: credentialData
      });

      credential.transactionId = transactionId;
      credential.blockchainHash = credentialHash;
    } catch (error) {
      const mockTx = `TX-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      credential.transactionId = mockTx;
      credential.blockchainHash = credentialHash;
      logger.warn('Blockchain issuance failed, using mock transaction ID');
    }

    await credential.save();

    // Create DID for credential
    const credentialDID = didService.generateCredentialDID(credentialId, issuer.userId);

    // Log action
    const auditLog = new AuditLog({
      logId: `LOG-${Date.now()}`,
      userId: issuerId,
      action: 'CREDENTIAL_ISSUED',
      resourceType: 'CREDENTIAL',
      resourceId: credential._id,
      newValue: { credentialId, studentId, credentialType },
      status: 'SUCCESS',
      transactionHash: credential.transactionId
    });
    await auditLog.save();

    // Generate QR code
    const qrData = {
      credentialId,
      hash: credentialHash,
      transactionId: credential.transactionId,
      issuedAt: credentialData.issuedAt,
      issuer: issuer.organization,
      did: credentialDID
    };
    const qrCode = await generateQRCode(qrData);

    logger.info(`Credential issued: ${credentialId}`);

    res.status(201).json({
      message: 'Credential issued successfully',
      credential: {
        credentialId,
        credentialHash,
        transactionId: credential.transactionId,
        did: credentialDID,
        qrCode,
        issuedAt: credentialData.issuedAt
      }
    });
  } catch (error) {
    logger.error('Issue credential error:', error);
    res.status(500).json({ error: 'Failed to issue credential' });
  }
};

/**
 * Get credential by ID
 */
exports.getCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = await Credential.findOne({ credentialId })
      .populate('studentId', 'name email organization')
      .populate('issuerId', 'name email organization');

    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Log verification attempt
    const auditLog = new AuditLog({
      logId: `LOG-${Date.now()}`,
      userId: req.user.id,
      action: 'CREDENTIAL_VERIFIED',
      resourceType: 'CREDENTIAL',
      resourceId: credential._id,
      status: 'SUCCESS'
    });
    await auditLog.save();

    res.json({
      credential: {
        credentialId: credential.credentialId,
        studentName: credential.studentId?.name || 'Unknown Student',
        studentEmail: credential.studentId?.email || 'unknown@example.com',
        issuer: credential.issuerId?.organization || 'Unknown Issuer',
        credentialType: credential.credentialType,
        degree: credential.degree,
        major: credential.major,
        gpa: credential.gpa,
        issueDate: credential.issueDate,
        expiryDate: credential.expiryDate,
        status: credential.status,
        isRevoked: credential.isRevoked,
        createdAt: credential.createdAt
      }
    });
  } catch (error) {
    logger.error('Get credential error:', error);
    res.status(500).json({ error: 'Failed to get credential' });
  }
};

/**
 * List credentials for a student
 */
exports.listStudentCredentials = async (req, res) => {
  try {
    const studentId = req.user.id;

    const credentials = await Credential.find({ studentId })
      .populate('issuerId', 'name email organization')
      .sort({ createdAt: -1 });

    res.json({
      count: credentials.length,
      credentials: credentials.map(cred => ({
        credentialId: cred.credentialId,
        issuer: cred.issuerId.organization,
        type: cred.credentialType,
        degree: cred.degree,
        major: cred.major,
        issueDate: cred.issueDate,
        status: cred.status,
        isRevoked: cred.isRevoked,
        createdAt: cred.createdAt
      }))
    });
  } catch (error) {
    logger.error('List credentials error:', error);
    res.status(500).json({ error: 'Failed to list credentials' });
  }
};

/**
 * Revoke a credential
 */
exports.revokeCredential = async (req, res) => {
  try {
    const { credentialId } = req.params;
    const { reason } = req.body;
    const revokedBy = req.user.id;

    const credential = await Credential.findOne({ credentialId });
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Only issuer or admin can revoke
    if (credential.issuerId.toString() !== revokedBy && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only issuer can revoke this credential' });
    }

    credential.isRevoked = true;
    credential.revocationReason = reason;
    credential.revokedAt = new Date();
    credential.revokedBy = revokedBy;
    credential.status = 'REVOKED';

    await credential.save();

    // Revoke on blockchain
    try {
      await fabricService.revokeCredential(credentialId, reason);
    } catch (error) {
      logger.warn('Blockchain revocation failed:', error);
    }

    // Log action
    const auditLog = new AuditLog({
      logId: `LOG-${Date.now()}`,
      userId: revokedBy,
      action: 'CREDENTIAL_REVOKED',
      resourceType: 'CREDENTIAL',
      resourceId: credential._id,
      newValue: { isRevoked: true, reason },
      status: 'SUCCESS'
    });
    await auditLog.save();

    logger.info(`Credential revoked: ${credentialId}`);

    res.json({ message: 'Credential revoked successfully' });
  } catch (error) {
    logger.error('Revoke credential error:', error);
    res.status(500).json({ error: 'Failed to revoke credential' });
  }
};

/**
 * Get audit trail for a credential
 */
exports.getAuditTrail = async (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = await Credential.findOne({ credentialId });
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    // Get audit logs
    const auditLogs = await AuditLog.find({
      'resourceId': credential._id
    }).populate('userId', 'name email role').sort({ timestamp: -1 });

    res.json({
      credentialId,
      auditTrail: auditLogs.map(log => ({
        action: log.action,
        performedBy: log.userId?.name || 'Unknown',
        timestamp: log.timestamp,
        status: log.status,
        details: log.newValue
      }))
    });
  } catch (error) {
    logger.error('Get audit trail error:', error);
    res.status(500).json({ error: 'Failed to get audit trail' });
  }
};
