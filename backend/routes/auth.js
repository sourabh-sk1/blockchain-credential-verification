const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

/**
 * Public routes
 */
router.post('/register', authController.register);
router.post('/login', authController.login);

/**
 * Protected routes
 */
router.get('/profile', authenticate, authController.getProfile);
router.get('/users', authenticate, authorize(['ADMIN']), authController.getAllUsers);
router.patch('/users/:userId/verify', authenticate, authorize(['ADMIN']), authController.verifyUser);

module.exports = router;
