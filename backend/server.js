require('dotenv').config();

const http = require('http');
const app = require('./app');
const database = require('./config/database');
const SocketManager = require('./config/socket');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const socketManager = new SocketManager(server);
app.set('socketManager', socketManager);

// Connect to database
database.connect().then(() => {
  logger.info('Database connected, starting server...');
  
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`Socket.IO ready for connections`);
  });
}).catch((error) => {
  logger.error('Failed to connect to database:', error);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server...');
  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await database.disconnect();
      logger.info('Database disconnected');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

module.exports = { server, socketManager };