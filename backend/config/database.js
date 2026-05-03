const mongoose = require('mongoose');
const logger = require('./logger');

class Database {
  constructor() {
    this.isConnected = false;
    this.connectionOptions = {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true
    };
  }

  async connect() {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/huduma_ecosystem';
      await mongoose.connect(mongoURI, this.connectionOptions);
      this.isConnected = true;
      logger.info('✅ MongoDB connected successfully to Huduma Ecosystem');

      mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
        this.attemptReconnect();
      });
    } catch (error) {
      logger.error('❌ MongoDB connection failed:', error);
      this.attemptReconnect();
      throw error;
    }
  }

  attemptReconnect() {
    setTimeout(() => {
      this.connect().catch(err => {
        logger.error('Reconnection attempt failed:', err);
      });
    }, 5000);
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected safely');
    } catch (error) {
      logger.error('Error disconnecting:', error);
      throw error;
    }
  }
}

module.exports = new Database();