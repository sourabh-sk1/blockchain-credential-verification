const mongoose = require('mongoose');

// In-memory storage for development when MongoDB is not available
let inMemoryAuditLogs = [];
let auditLogIdCounter = 1;

// Check if we're in development mode and MongoDB is not connected
const isDevMode = process.env.NODE_ENV === 'development';
const mongoConnected = mongoose.connection.readyState === 1;

if (isDevMode && !mongoConnected) {
  console.log('Using in-memory storage for AuditLog model (MongoDB not connected)');

  // In-memory AuditLog class
  class InMemoryAuditLog {
    constructor(data) {
      this._id = `audit_mem_${auditLogIdCounter++}`;
      this.logId = data.logId;
      this.userId = data.userId;
      this.action = data.action;
      this.resourceType = data.resourceType;
      this.resourceId = data.resourceId;
      this.oldValue = data.oldValue;
      this.newValue = data.newValue;
      this.status = data.status || 'SUCCESS';
      this.errorMessage = data.errorMessage;
      this.ipAddress = data.ipAddress;
      this.userAgent = data.userAgent;
      this.transactionHash = data.transactionHash;
      this.timestamp = data.timestamp || new Date();
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    async save() {
      inMemoryAuditLogs.push(this);
      return this;
    }

    static async find(query = {}) {
      let results = [...inMemoryAuditLogs];

      if (query.userId) {
        results = results.filter(log => log.userId === query.userId);
      }

      if (query.action) {
        results = results.filter(log => log.action === query.action);
      }

      return results;
    }

    static async findOne(query) {
      return inMemoryAuditLogs.find(log =>
        (query.logId && log.logId === query.logId) ||
        (query._id && log._id === query._id)
      ) || null;
    }
  }

  module.exports = InMemoryAuditLog;
} else {
  // Use MongoDB schema when database is available
  const auditLogSchema = new mongoose.Schema({
    logId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'CREDENTIAL_ISSUED',
        'CREDENTIAL_VERIFIED',
        'CREDENTIAL_REVOKED',
        'USER_CREATED',
        'USER_UPDATED',
        'BLOCKCHAIN_TRANSACTION',
        'FILE_UPLOADED',
        'SIGNATURE_VERIFIED'
      ]
    },
    resourceType: String,
    resourceId: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS'
    },
    errorMessage: String,
    ipAddress: String,
    userAgent: String,
    transactionHash: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  }, { timestamps: true });

  module.exports = mongoose.model('AuditLog', auditLogSchema);
}
