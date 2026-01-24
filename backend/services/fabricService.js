const { Wallets, Gateway } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

class FabricService {
  constructor() {
    this.gateway = null;
    this.contract = null;
    this.initialized = false;
  }

  /**
   * Initialize Fabric Gateway connection
   */
  async initialize() {
    try {
      // Create a new file system based wallet for managing identities
      const walletPath = path.join(__dirname, '../../blockchain/hyperledger-fabric', 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      logger.info('Wallet path: ' + walletPath);

      // Check to see if we've already enrolled the user
      const identity = await wallet.get('appUser');
      if (!identity) {
        logger.warn('An identity for the user "appUser" does not exist in the wallet');
        logger.info('Run the registerUser.js application before retrying');
        return;
      }

      // Create a new gateway for connecting to our peer node
      this.gateway = new Gateway();
      await this.gateway.connect(
        path.join(__dirname, '../../blockchain/hyperledger-fabric', 'network.json'),
        {
          wallet,
          identity: 'appUser',
          discovery: { enabled: true, asLocalhost: true }
        }
      );

      // Get the network channel and smart contract
      const network = await this.gateway.getNetwork(
        process.env.FABRIC_CHANNEL_NAME || 'credential-channel'
      );
      this.contract = network.getContract(
        process.env.FABRIC_CHAINCODE_NAME || 'credential-contract'
      );

      this.initialized = true;
      logger.info('Fabric Gateway initialized successfully');
    } catch (error) {
      logger.error('Fabric initialization error:', error);
      throw error;
    }
  }

  /**
   * Issue a credential on blockchain
   * @param {Object} credentialData - Credential data
   * @returns {string} Transaction ID
   */
  async issueCredential(credentialData) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const txnResponse = await this.contract.submitTransaction(
        'issueCredential',
        credentialData.credentialId,
        credentialData.credentialHash,
        credentialData.studentId,
        credentialData.issuerId,
        JSON.stringify(credentialData.metadata || {})
      );

      const transactionId = txnResponse.toString();
      logger.info(`Credential ${credentialData.credentialId} issued on blockchain. TxID: ${transactionId}`);
      return transactionId;
    } catch (error) {
      logger.error('Error issuing credential on blockchain:', error);
      throw error;
    }
  }

  /**
   * Verify credential on blockchain
   * @param {string} credentialId - Credential ID
   * @param {string} credentialHash - Expected credential hash
   * @returns {Object} Verification result
   */
  async verifyCredential(credentialId, credentialHash) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const result = await this.contract.evaluateTransaction(
        'verifyCredential',
        credentialId,
        credentialHash
      );

      const verification = JSON.parse(result.toString());
      logger.info(`Credential ${credentialId} verification result:`, verification);
      return verification;
    } catch (error) {
      logger.error('Error verifying credential on blockchain:', error);
      throw error;
    }
  }

  /**
   * Get credential from blockchain
   * @param {string} credentialId - Credential ID
   * @returns {Object} Credential data
   */
  async getCredential(credentialId) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const result = await this.contract.evaluateTransaction(
        'getCredential',
        credentialId
      );

      const credential = JSON.parse(result.toString());
      logger.info(`Retrieved credential ${credentialId} from blockchain`);
      return credential;
    } catch (error) {
      logger.error('Error retrieving credential from blockchain:', error);
      throw error;
    }
  }

  /**
   * Revoke credential on blockchain
   * @param {string} credentialId - Credential ID
   * @param {string} reason - Revocation reason
   * @returns {string} Transaction ID
   */
  async revokeCredential(credentialId, reason) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const txnResponse = await this.contract.submitTransaction(
        'revokeCredential',
        credentialId,
        reason
      );

      const transactionId = txnResponse.toString();
      logger.info(`Credential ${credentialId} revoked. TxID: ${transactionId}`);
      return transactionId;
    } catch (error) {
      logger.error('Error revoking credential on blockchain:', error);
      throw error;
    }
  }

  /**
   * Get audit trail from blockchain
   * @param {string} credentialId - Credential ID
   * @returns {Array} Audit trail entries
   */
  async getAuditTrail(credentialId) {
    try {
      if (!this.contract) {
        await this.initialize();
      }

      const result = await this.contract.evaluateTransaction(
        'getAuditTrail',
        credentialId
      );

      const auditTrail = JSON.parse(result.toString());
      logger.info(`Retrieved audit trail for credential ${credentialId}`);
      return auditTrail;
    } catch (error) {
      logger.error('Error retrieving audit trail from blockchain:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Fabric Gateway
   */
  async disconnect() {
    try {
      if (this.gateway) {
        await this.gateway.disconnect();
        this.initialized = false;
        logger.info('Fabric Gateway disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting from Fabric Gateway:', error);
    }
  }
}

module.exports = new FabricService();
