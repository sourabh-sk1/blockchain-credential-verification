'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

class CredentialContract extends Contract {

  /**
   * InitLedger - Initialize the ledger with an empty credential store
   */
  async initLedger(ctx) {
    console.info('============= START : Initialize Ledger ===========');
    const credentials = [];
    for (let i = 0; i < credentials.length; i++) {
      credentials[i].docType = 'credential';
      await ctx.stub.putState(`credential-${i}`, Buffer.from(JSON.stringify(credentials[i])));
    }
    console.info('============= END : Initialize Ledger ===========');
  }

  /**
   * issueCredential - Create and store a new credential on the blockchain
   * @param {string} credentialId - Unique credential identifier
   * @param {string} credentialHash - SHA-256 hash of credential
   * @param {string} studentId - Student identifier
   * @param {string} issuerId - University/Issuer identifier
   * @param {string} metadata - Additional metadata (JSON string)
   */
  async issueCredential(ctx, credentialId, credentialHash, studentId, issuerId, metadata) {
    console.info('============= START : Issue Credential ===========');
    console.info('inputs:${credentialId}');

    // Validate inputs
    if (!credentialId || !credentialHash || !studentId || !issuerId) {
      throw new Error('Required parameters missing');
    }

    // Validate hash format (SHA-256 should be 64 hex characters)
    if (!/^[a-f0-9]{64}$/i.test(credentialHash)) {
      throw new Error('Invalid hash format. Expected 64-character hex string');
    }

    // Check if credential already exists
    const existingCredential = await ctx.stub.getState(credentialId);
    if (existingCredential && existingCredential.length > 0) {
      throw new Error(`Credential ${credentialId} already exists`);
    }

    // Create credential object
    const credential = {
      docType: 'credential',
      credentialId,
      credentialHash,
      studentId,
      issuerId,
      metadata: JSON.parse(metadata),
      status: 'ISSUED',
      isRevoked: false,
      issuedAt: new Date().toISOString(),
      lastVerified: null,
      verificationCount: 0,
      auditTrail: [{
        action: 'ISSUED',
        timestamp: new Date().toISOString(),
        actor: issuerId
      }]
    };

    // Store on blockchain
    await ctx.stub.putState(credentialId, Buffer.from(JSON.stringify(credential)));

    // Create composite key for querying by student
    const studentIndex = 'StudentID~CredentialID';
    await ctx.stub.createCompositeKey(studentIndex, [studentId, credentialId]);

    // Create composite key for querying by issuer
    const issuerIndex = 'IssuerID~CredentialID';
    await ctx.stub.createCompositeKey(issuerIndex, [issuerId, credentialId]);

    console.info('============= END : Issue Credential ===========');
    return JSON.stringify(credential);
  }

  /**
   * verifyCredential - Verify a credential by comparing hashes
   * @param {string} credentialId - Credential identifier
   * @param {string} credentialHash - Hash to verify against stored hash
   */
  async verifyCredential(ctx, credentialId, credentialHash) {
    console.info('============= START : Verify Credential ===========');

    // Retrieve credential from blockchain
    const credentialBuffer = await ctx.stub.getState(credentialId);
    if (!credentialBuffer || credentialBuffer.length === 0) {
      throw new Error(`Credential ${credentialId} does not exist`);
    }

    const credential = JSON.parse(credentialBuffer.toString());

    // Perform verification checks
    const verification = {
      credentialId,
      isValid: true,
      validationDetails: {
        hashMatch: credential.credentialHash === credentialHash,
        notRevoked: !credential.isRevoked,
        notExpired: !credential.expiryDate || new Date() < new Date(credential.expiryDate),
        exists: true
      },
      timestamp: new Date().toISOString()
    };

    // Determine overall validity
    verification.isValid = 
      verification.validationDetails.hashMatch &&
      verification.validationDetails.notRevoked &&
      verification.validationDetails.notExpired;

    // Update credential verification count
    credential.verificationCount += 1;
    credential.lastVerified = new Date().toISOString();
    credential.auditTrail.push({
      action: 'VERIFIED',
      timestamp: new Date().toISOString(),
      result: verification.isValid ? 'SUCCESS' : 'FAILED'
    });

    // Update credential on blockchain
    await ctx.stub.putState(credentialId, Buffer.from(JSON.stringify(credential)));

    console.info('============= END : Verify Credential ===========');
    return JSON.stringify(verification);
  }

  /**
   * getCredential - Retrieve credential details from blockchain
   * @param {string} credentialId - Credential identifier
   */
  async getCredential(ctx, credentialId) {
    console.info('============= START : Get Credential ===========');

    const credentialBuffer = await ctx.stub.getState(credentialId);
    if (!credentialBuffer || credentialBuffer.length === 0) {
      throw new Error(`Credential ${credentialId} does not exist`);
    }

    console.info('============= END : Get Credential ===========');
    return credentialBuffer.toString();
  }

  /**
   * revokeCredential - Revoke a credential (mark as revoked)
   * @param {string} credentialId - Credential identifier
   * @param {string} reason - Revocation reason
   */
  async revokeCredential(ctx, credentialId, reason) {
    console.info('============= START : Revoke Credential ===========');

    const credentialBuffer = await ctx.stub.getState(credentialId);
    if (!credentialBuffer || credentialBuffer.length === 0) {
      throw new Error(`Credential ${credentialId} does not exist`);
    }

    const credential = JSON.parse(credentialBuffer.toString());

    if (credential.isRevoked) {
      throw new Error(`Credential ${credentialId} is already revoked`);
    }

    // Mark as revoked
    credential.isRevoked = true;
    credential.revocationReason = reason;
    credential.revokedAt = new Date().toISOString();
    credential.status = 'REVOKED';
    credential.auditTrail.push({
      action: 'REVOKED',
      timestamp: new Date().toISOString(),
      reason
    });

    await ctx.stub.putState(credentialId, Buffer.from(JSON.stringify(credential)));

    console.info('============= END : Revoke Credential ===========');
    return JSON.stringify(credential);
  }

  /**
   * getAuditTrail - Get the audit trail for a credential
   * @param {string} credentialId - Credential identifier
   */
  async getAuditTrail(ctx, credentialId) {
    console.info('============= START : Get Audit Trail ===========');

    const credentialBuffer = await ctx.stub.getState(credentialId);
    if (!credentialBuffer || credentialBuffer.length === 0) {
      throw new Error(`Credential ${credentialId} does not exist`);
    }

    const credential = JSON.parse(credentialBuffer.toString());

    console.info('============= END : Get Audit Trail ===========');
    return JSON.stringify(credential.auditTrail);
  }

  /**
   * getCredentialsByStudent - Query all credentials for a student
   * @param {string} studentId - Student identifier
   */
  async getCredentialsByStudent(ctx, studentId) {
    console.info('============= START : Get Credentials By Student ===========');

    const iterator = await ctx.stub.getStateByPartialCompositeKey('StudentID~CredentialID', [studentId]);
    const credentials = [];
    let result = await iterator.next();

    while (!result.done) {
      const key = ctx.stub.splitCompositeKey(result.value.key);
      const credentialId = key.attributes[1];
      
      const credentialBuffer = await ctx.stub.getState(credentialId);
      if (credentialBuffer && credentialBuffer.length > 0) {
        credentials.push(JSON.parse(credentialBuffer.toString()));
      }

      result = await iterator.next();
    }

    await iterator.close();

    console.info('============= END : Get Credentials By Student ===========');
    return JSON.stringify(credentials);
  }

  /**
   * getCredentialsByIssuer - Query all credentials issued by a university
   * @param {string} issuerId - Issuer identifier
   */
  async getCredentialsByIssuer(ctx, issuerId) {
    console.info('============= START : Get Credentials By Issuer ===========');

    const iterator = await ctx.stub.getStateByPartialCompositeKey('IssuerID~CredentialID', [issuerId]);
    const credentials = [];
    let result = await iterator.next();

    while (!result.done) {
      const key = ctx.stub.splitCompositeKey(result.value.key);
      const credentialId = key.attributes[1];
      
      const credentialBuffer = await ctx.stub.getState(credentialId);
      if (credentialBuffer && credentialBuffer.length > 0) {
        credentials.push(JSON.parse(credentialBuffer.toString()));
      }

      result = await iterator.next();
    }

    await iterator.close();

    console.info('============= END : Get Credentials By Issuer ===========');
    return JSON.stringify(credentials);
  }

  /**
   * getCredentialHistory - Get transaction history for a credential (chaincode state history)
   * @param {string} credentialId - Credential identifier
   */
  async getCredentialHistory(ctx, credentialId) {
    console.info('============= START : Get Credential History ===========');

    const iterator = await ctx.stub.getHistoryForKey(credentialId);
    const history = [];
    let result = await iterator.next();

    while (!result.done) {
      const record = {
        txId: result.value.tx_id,
        timestamp: result.value.timestamp,
        isDelete: result.value.is_delete,
        value: JSON.parse(result.value.value.toString())
      };
      history.push(record);
      result = await iterator.next();
    }

    await iterator.close();

    console.info('============= END : Get Credential History ===========');
    return JSON.stringify(history);
  }

  /**
   * queryCredentialsByHash - Query credentials by credentialHash
   * @param {string} queryString - CouchDB query string (if using CouchDB)
   */
  async queryCredentials(ctx, queryString) {
    console.info('============= START : Query Credentials ===========');

    const iterator = await ctx.stub.getQueryResultsIterator(queryString);
    const credentials = [];
    let result = await iterator.next();

    while (!result.done) {
      credentials.push(JSON.parse(result.value.value.toString()));
      result = await iterator.next();
    }

    await iterator.close();

    console.info('============= END : Query Credentials ===========');
    return JSON.stringify(credentials);
  }
}

module.exports = CredentialContract;
