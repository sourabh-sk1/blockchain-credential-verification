const mongoose = require('mongoose');
const logger = require('../utils/logger');

const mongooseConnection = mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-credentials', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    logger.info('MongoDB connected successfully');
  })
  .catch(error => {
    logger.error('MongoDB connection error:', error);
    // Do not exit the process so server can start for local development/testing
    // Return a resolved promise so requiring modules can continue
    return Promise.resolve(null);
  });

module.exports = mongooseConnection;
