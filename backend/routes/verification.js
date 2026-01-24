const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * Verification routes
 */
router.post(
  '/verify-hash',
  authenticate,
  authorize(['VERIFIER', 'ADMIN']),
  verificationController.verifyCredentialHash
);

router.get(
  '/:credentialId/verify',
  authenticate,
  authorize(['VERIFIER', 'ADMIN']),
  verificationController.verifyCredentialById
);

router.get(
  '/:credentialId/history',
  authenticate,
  authorize(['VERIFIER', 'ADMIN', 'UNIVERSITY_ISSUER']),
  verificationController.getVerificationHistory
);

router.get(
  '/stats',
  authenticate,
  authorize(['ADMIN']),
  verificationController.getVerificationStats
);

module.exports = router;
