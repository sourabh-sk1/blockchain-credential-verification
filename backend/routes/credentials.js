const express = require('express');
const router = express.Router();
const credentialController = require('../controllers/credentialController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/fileUpload');

/**
 * Credential routes
 */
router.post(
  '/issue',
  authenticate,
  authorize(['UNIVERSITY_ISSUER', 'ADMIN']),
  credentialController.issueCredential
);

router.get(
  '/:credentialId',
  authenticate,
  credentialController.getCredential
);

router.get(
  '/student/list',
  authenticate,
  authorize(['STUDENT']),
  credentialController.listStudentCredentials
);

router.post(
  '/:credentialId/revoke',
  authenticate,
  authorize(['UNIVERSITY_ISSUER', 'ADMIN']),
  credentialController.revokeCredential
);

router.get(
  '/:credentialId/audit',
  authenticate,
  credentialController.getAuditTrail
);

module.exports = router;
