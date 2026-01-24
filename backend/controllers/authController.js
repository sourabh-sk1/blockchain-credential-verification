const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../utils/jwt');
const { generateKeyPair } = require('../utils/cryptography');
const didService = require('../services/didService');
const logger = require('../utils/logger');

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organization } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Validate role
    const validRoles = ['ADMIN', 'UNIVERSITY_ISSUER', 'STUDENT', 'VERIFIER'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate DID
    const did = didService.generateDID('credential-channel', 'DefaultMSP', email);

    // Generate key pair
    const keyPair = generateKeyPair();

    // Create user
    const userId = `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const user = new User({
      userId,
      name,
      email,
      password: hashedPassword,
      role,
      organization,
      publicKey: keyPair.publicKey,
      did,
      isVerified: role !== 'STUDENT'
    });

    await user.save();

    // Log action
    const auditLog = new AuditLog({
      logId: `LOG-${Date.now()}`,
      userId: user._id,
      action: 'USER_CREATED',
      resourceType: 'USER',
      resourceId: user._id,
      newValue: { email, role, organization },
      status: 'SUCCESS'
    });
    await auditLog.save();

    logger.info(`User registered: ${email} with role ${role}`);

    // Generate token
    const token = generateToken({
      id: user._id,
      userId: user.userId,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        did: user.did
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log action
    const auditLog = new AuditLog({
      logId: `LOG-${Date.now()}`,
      userId: user._id,
      action: 'LOGIN',
      resourceType: 'USER',
      resourceId: user._id,
      status: 'SUCCESS'
    });
    await auditLog.save();

    logger.info(`User logged in: ${email}`);

    // Generate token
    const token = generateToken({
      id: user._id,
      userId: user.userId,
      email: user.email,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        did: user.did,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        did: user.did,
        publicKey: user.publicKey,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

/**
 * Get all users (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      count: users.length,
      users: users.map(user => ({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

/**
 * Update user verification status (Admin only)
 */
exports.verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isVerified = isVerified;
    await user.save();

    // Log action
    const auditLog = new AuditLog({
      logId: `LOG-${Date.now()}`,
      userId: req.user.id,
      action: 'USER_UPDATED',
      resourceType: 'USER',
      resourceId: userId,
      oldValue: { isVerified: !isVerified },
      newValue: { isVerified },
      status: 'SUCCESS'
    });
    await auditLog.save();

    res.json({ message: 'User verification status updated', user });
  } catch (error) {
    logger.error('Verify user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
