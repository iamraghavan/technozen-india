const rateLimit = require('express-rate-limit');

// Rate limiter — max 100 requests per 15 mins per IP
const requestLimiterMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

// Force HTTPS in production
const forceHttpsMiddleware = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
};

module.exports = {
  requestLimiterMiddleware,
  forceHttpsMiddleware
};
