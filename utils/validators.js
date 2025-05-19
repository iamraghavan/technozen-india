// utils/validators.js
const { param, validationResult } = require('express-validator');

// Example of request validation middleware
const validatePageRequest = [
  param('page')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Page name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validatePageRequest };
