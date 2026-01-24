const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate SHA-256 hash of file content
 * @param {Buffer} fileBuffer - File content as buffer
 * @returns {string} SHA-256 hash in hex format
 */
const generateFileHash = (fileBuffer) => {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

/**
 * Generate SHA-256 hash of a string
 * @param {string} data - Data to hash
 * @returns {string} SHA-256 hash in hex format
 */
const generateStringHash = (data) => {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

/**
 * Generate RSA key pair for digital signatures
 * @returns {Object} Public and private keys
 */
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

/**
 * Sign data with private key
 * @param {string} data - Data to sign
 * @param {string} privateKey - Private key in PEM format
 * @returns {string} Signature in base64
 */
const signData = (data, privateKey) => {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(JSON.stringify(data));
  return sign.sign(privateKey, 'base64');
};

/**
 * Verify signature with public key
 * @param {string} data - Original data
 * @param {string} signature - Signature in base64
 * @param {string} publicKey - Public key in PEM format
 * @returns {boolean} True if signature is valid
 */
const verifySignature = (data, signature, publicKey) => {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(JSON.stringify(data));
  return verify.verify(publicKey, signature, 'base64');
};

/**
 * Generate a random credential ID
 * @returns {string} Random credential ID
 */
const generateCredentialId = () => {
  return `CRED-${Date.now()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
};

/**
 * Validate hash format (should be 64 char hex string for SHA-256)
 * @param {string} hash - Hash to validate
 * @returns {boolean} True if valid SHA-256 hash
 */
const isValidHash = (hash) => {
  return /^[a-f0-9]{64}$/i.test(hash);
};

module.exports = {
  generateFileHash,
  generateStringHash,
  generateKeyPair,
  signData,
  verifySignature,
  generateCredentialId,
  isValidHash
};
