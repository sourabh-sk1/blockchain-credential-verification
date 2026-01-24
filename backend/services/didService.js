const logger = require('../utils/logger');

class DIDService {
  /**
   * Generate DID (Decentralized Identifier)
   * Format: did:fabric:channelname:msp:entityid
   * @param {string} channelName - Channel name
   * @param {string} mspId - MSP ID
   * @param {string} entityId - Entity ID
   * @returns {string} DID
   */
  generateDID(channelName, mspId, entityId) {
    const did = `did:fabric:${channelName}:${mspId}:${entityId}`;
    logger.info(`DID generated: ${did}`);
    return did;
  }

  /**
   * Parse DID to extract components
   * @param {string} did - DID string
   * @returns {Object} DID components
   */
  parseDID(did) {
    try {
      const parts = did.split(':');
      if (parts[0] !== 'did' || parts[1] !== 'fabric') {
        throw new Error('Invalid DID format');
      }

      return {
        method: parts[0],
        network: parts[1],
        channelName: parts[2],
        mspId: parts[3],
        entityId: parts[4]
      };
    } catch (error) {
      logger.error('Error parsing DID:', error);
      throw error;
    }
  }

  /**
   * Validate DID format
   * @param {string} did - DID string
   * @returns {boolean} True if valid
   */
  isValidDID(did) {
    const didPattern = /^did:fabric:[a-zA-Z0-9-]+:[a-zA-Z0-9]+:[a-zA-Z0-9-]+$/;
    return didPattern.test(did);
  }

  /**
   * Generate credential DID
   * @param {string} credentialId - Credential ID
   * @param {string} issuerId - Issuer ID
   * @returns {string} Credential DID
   */
  generateCredentialDID(credentialId, issuerId) {
    const credentialDID = `did:fabric:credential:${issuerId}:${credentialId}`;
    logger.info(`Credential DID generated: ${credentialDID}`);
    return credentialDID;
  }
}

module.exports = new DIDService();
