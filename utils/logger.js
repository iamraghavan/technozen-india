const winston = require('winston');

// Logger setup for audit quality logging
const logRequestError = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }),
    new winston.transports.File({ filename: 'logs/requests.log' })
  ]
});

const logServerError = winston.createLogger({
  level: 'error',
  transports: [
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }),
    new winston.transports.File({ filename: 'logs/errors.log' })
  ]
});

module.exports = { logRequestError, logServerError };
