const mongoose = require('mongoose');

// In-memory storage for development when MongoDB is not available
let inMemoryCredentials = [];

// Check if we're in development mode and MongoDB is not connected
const isDevMode = process.env.NODE_ENV === 'development';
const mongoConnected = mongoose.connection.readyState === 1;

if (isDevMode && !mongoConnected) {
  console.log('Using in-memory storage for Credential model (MongoDB not connected)');

  class MockQuery {
    constructor(promise) {
      this.promise = promise;
    }

    populate(path, select) {
      this.promise = this.promise.then(async (docs) => {
        if (!docs) return docs;
        const User = require('./User');
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

    then(resolve, reject) {
      return this.promise.then(resolve, reject);
    }
    
    catch(reject) {
        return this.promise.catch(reject);
    }
  }

  class InMemoryCredential {
    constructor(data) {
      this._id = `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.credentialId = data.credentialId;
      this.studentId = data.studentId;
      this.issuerId = data.issuerId;
      this.credentialType = data.credentialType;
      this.degree = data.degree;
      this.major = data.major;
      this.gpa = data.gpa;
      this.issueDate = data.issueDate;
      this.expiryDate = data.expiryDate;
      this.credentialHash = data.credentialHash;
      this.pdfHash = data.pdfHash;
      this.ipfsHash = data.ipfsHash;
      this.blockchainHash = data.blockchainHash;
      this.transactionId = data.transactionId;
      this.channelName = data.channelName || 'credential-channel';
      this.chaincodeName = data.chaincodeName || 'credential-contract';
      this.signature = data.signature;
      this.signerPublicKey = data.signerPublicKey;
      this.status = data.status || 'PENDING';
      this.isRevoked = data.isRevoked || false;
      this.revocationReason = data.revocationReason;
      this.revokedAt = data.revokedAt;
      this.revokedBy = data.revokedBy;
      this.verificationCount = data.verificationCount || 0;
      this.lastVerifiedAt = data.lastVerifiedAt;
      this.metadata = data.metadata || {};
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    async save() {
      const existingIndex = inMemoryCredentials.findIndex(c => c.credentialId === this.credentialId);
      if (existingIndex >= 0) {
        inMemoryCredentials[existingIndex] = this;
      } else {
        inMemoryCredentials.push(this);
      }
      return this;
    }

    static find(query = {}) {
      const promise = Promise.resolve().then(() => {
        let results = [...inMemoryCredentials];
        if (query.studentId) results = results.filter(c => c.studentId === query.studentId);
        if (query.issuerId) results = results.filter(c => c.issuerId === query.issuerId);
        if (query.credentialHash) results = results.filter(c => c.credentialHash === query.credentialHash);
        // Return deep copy to prevent mutation by populate affecting store
        return results.map(r => ({...r}));
      });
      return new MockQuery(promise);
    }

    static findOne(query = {}) {
      const promise = Promise.resolve().then(() => {
        const result = inMemoryCredentials.find(c => 
          (query.credentialId && c.credentialId === query.credentialId) ||
          (query.credentialHash && c.credentialHash === query.credentialHash) ||
          (query._id && c._id === query._id)
        );
        // Return deep copy
        return result ? {...result} : null;
      });
      return new MockQuery(promise);
    }
    
    static findById(id) {
        return this.findOne({ _id: id });
    }
  }

  module.exports = InMemoryCredential;
  module.exports.InMemoryCredential = InMemoryCredential;
} else {
  const credentialSchema = new mongoose.Schema({
    credentialId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true
    },
    issuerId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true
    },
    credentialType: {
      type: String,
      enum: ['DEGREE', 'DIPLOMA', 'CERTIFICATE', 'TRANSCRIPT'],
      required: true
    },
    degree: String,
    major: String,
    gpa: Number,
    issueDate: Date,
    expiryDate: {
      type: Date,
      default: null
    },
    credentialHash: {
      type: String,
      required: true,
      index: true
    },
    pdfHash: {
      type: String,
      required: true
    },
    ipfsHash: {
      type: String,
      default: null
    },
    blockchainHash: {
      type: String,
      default: null
    },
    transactionId: {
      type: String,
      default: null,
      index: true
    },
    channelName: {
      type: String,
      default: 'credential-channel'
    },
    chaincodeName: {
      type: String,
      default: 'credential-contract'
    },
    signature: String,
    signerPublicKey: String,
    status: {
      type: String,
      enum: ['PENDING', 'ISSUED', 'VERIFIED', 'REVOKED', 'EXPIRED'],
      default: 'PENDING'
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    revocationReason: String,
    revokedAt: Date,
    revokedBy: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User'
    },
    verificationCount: {
      type: Number,
      default: 0
    },
    lastVerifiedAt: Date,
    metadata: {
      type: Map,
      of: String,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }, { timestamps: true });

  module.exports = mongoose.model('Credential', credentialSchema);
}
