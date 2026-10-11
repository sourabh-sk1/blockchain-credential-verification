const mongoose = require('mongoose');

// In-memory storage for development when MongoDB is not available
let inMemoryUsers = [];
let userIdCounter = 1;

// Check if we're in development mode and MongoDB is not connected
const useInMemory = process.env.USE_IN_MEMORY === 'true';


if (useInMemory) {
  console.log('Using in-memory storage for User model (MongoDB not connected)');

  // In-memory User class
  class InMemoryUser {
    constructor(data) {
      this._id = `mem_${userIdCounter++}`;
      this.userId = data.userId;
      this.name = data.name;
      this.email = data.email;
      this.password = data.password;
      this.role = data.role;
      this.organization = data.organization;
      this.publicKey = data.publicKey;
      this.did = data.did;
      this.isActive = data.isActive !== undefined ? data.isActive : true;
      this.isVerified = data.isVerified !== undefined ? data.isVerified : false;
      this.createdAt = new Date();
      this.updatedAt = new Date();
    }

    async save() {
      const existingIndex = inMemoryUsers.findIndex(u => u.email === this.email);
      if (existingIndex >= 0) {
        inMemoryUsers[existingIndex] = this;
      } else {
        inMemoryUsers.push(this);
      }
      return this;
    }

    static async findOne(query) {
      return inMemoryUsers.find(user =>
        (query.email && user.email === query.email) ||
        (query.userId && user.userId === query.userId) ||
        (query._id && user._id === query._id)
      ) || null;
    }

    static async find(query = {}) {
      let results = [...inMemoryUsers];

      if (query.role) {
        results = results.filter(user => user.role === query.role);
      }

      return results;
    }

    static async findById(id) {
      return inMemoryUsers.find(user => user._id === id) || null;
    }

    static async findByIdAndUpdate(id, updateData) {
      const userIndex = inMemoryUsers.findIndex(user => user._id === id);
      if (userIndex >= 0) {
        inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...updateData, updatedAt: new Date() };
        return inMemoryUsers[userIndex];
      }
      return null;
    }
  }

  module.exports = InMemoryUser;
} else {
  // Use MongoDB schema when database is available
  const userSchema = new mongoose.Schema({
    userId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['ADMIN', 'UNIVERSITY_ISSUER', 'STUDENT', 'VERIFIER'],
      required: true
    },
    organization: {
      type: String,
      required: true
    },
    publicKey: {
      type: String,
      default: null
    },
    did: {
      type: String,
      default: null,
      unique: true,
      sparse: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    lastLogin: {
      type: Date,
      default: null
    }
  }, { timestamps: true });

  module.exports = mongoose.model('User', userSchema);
}
