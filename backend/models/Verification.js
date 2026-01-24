const mongoose = require('mongoose');

// In-memory storage for development when MongoDB is not available
let inMemoryVerifications = [];

// Check if we're in development mode and MongoDB is not connected
const isDevMode = process.env.NODE_ENV === 'development';
const mongoConnected = mongoose.connection.readyState === 1;

if (isDevMode && !mongoConnected) {
  console.log('Using in-memory storage for Verification model (MongoDB not connected)');

  class MockQuery {
    constructor(promise) {
      this.promise = promise;
    }

    populate(path, select) {
      this.promise = this.promise.then(async (docs) => {
        if (!docs) return docs;
        const User = require('./User'); // Assuming this refers to InMemoryUser when needed
        const isArray = Array.isArray(docs);
        const items = isArray ? docs : [docs];

        for (let item of items) {
          if (item[path]) {
            const user = await User.findById(item[path]);
            if (user) {
              if (select) {
                const fields = select.split(' ');
                const selectedUser = {};
                fields.forEach(f => {
                   if (user[f] !== undefined) selectedUser[f] = user[f];
                });
                item[path] = selectedUser;
              } else {
                item[path] = user;
              }
            } else {
              item[path] = null;
            }
          }
        }
        return docs;
      });
      return this;
    }

    sort(criteria) {
      this.promise = this.promise.then(docs => {
        if (!Array.isArray(docs)) return docs;
        const key = Object.keys(criteria)[0];
        const order = criteria[key];
        return docs.sort((a, b) => {
            const valA = a[key] ? new Date(a[key]).getTime() : 0;
            const valB = b[key] ? new Date(b[key]).getTime() : 0;
            return (valA - valB) * (order === 'desc' || order === -1 ? -1 : 1);
        });
      });
      return this;
    }
    
    limit(num) {
        this.promise = this.promise.then(docs => {
            if (!Array.isArray(docs)) return docs;
            return docs.slice(0, num);
        });
        return this;
    }

    then(resolve, reject) {
      return this.promise.then(resolve, reject);
    }
    
    catch(reject) {
        return this.promise.catch(reject);
    }
  }

  class InMemoryVerification {
    constructor(data) {
      this._id = `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.verificationId = data.verificationId;
      this.credentialId = data.credentialId;
      this.credentialHash = data.credentialHash;
      this.verifierId = data.verifierId;
      this.blockchainHash = data.blockchainHash;
      this.transactionId = data.transactionId;
      this.isValid = data.isValid;
      this.validationDetails = data.validationDetails;
      this.ipAddress = data.ipAddress;
      this.userAgent = data.userAgent;
      this.verificationMethod = data.verificationMethod;
      this.timestamp = data.timestamp || new Date();
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    async save() {
      inMemoryVerifications.push(this);
      return this;
    }
    
    static countDocuments(query = {}) {
        let results = [...inMemoryVerifications];
        if (query.isValid !== undefined) {
            results = results.filter(v => v.isValid === query.isValid);
        }
        return Promise.resolve(results.length);
    }
    
    static aggregate(pipeline) {
        // Very basic aggregation mock for stats
        // This is tricky, but let's try to return something harmless
        return Promise.resolve([]);
    }

    static find(query = {}) {
      const promise = Promise.resolve().then(() => {
        let results = [...inMemoryVerifications];
        if (query.credentialId) results = results.filter(v => v.credentialId === query.credentialId);
        return results;
      });
      return new MockQuery(promise);
    }
  }

  module.exports = InMemoryVerification;
} else {
  const verificationSchema = new mongoose.Schema({
    verificationId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    credentialId: {
      type: String,
      required: true,
      index: true
    },
    credentialHash: {
      type: String,
      required: true,
      index: true
    },
    verifierId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true
    },
    blockchainHash: String,
    transactionId: String,
    isValid: {
      type: Boolean,
      required: true
    },
    validationDetails: {
      hashMatch: Boolean,
      signatureValid: Boolean,
      notRevoked: Boolean,
      notExpired: Boolean
    },
    ipAddress: String,
    userAgent: String,
    verificationMethod: {
      type: String,
      enum: ['QR_SCAN', 'DIRECT_HASH', 'CREDENTIAL_ID'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  }, { timestamps: true });

  module.exports = mongoose.model('Verification', verificationSchema);
}
