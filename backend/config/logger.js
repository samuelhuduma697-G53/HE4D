const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760,
      maxFiles: 5
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

logger.logRequest = (req, res, duration) => {
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userId: req.user?.id
  });
};

logger.logError = (error, req = null) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    name: error.name
  };
  if (req) {
    logData.method = req.method;
    logData.url = req.url;
    logData.ip = req.ip;
    logData.userId = req.user?.id;
  }
  logger.error('Error occurred', logData);
};

logger.logSecurity = (action, userId, details) => {
  logger.warn('Security Event', {
    action,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;