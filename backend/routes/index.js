const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const credentialRoutes = require('./credentials');
const verificationRoutes = require('./verification');

router.use('/auth', authRoutes);
router.use('/credentials', credentialRoutes);
router.use('/verify', verificationRoutes);

module.exports = router;
