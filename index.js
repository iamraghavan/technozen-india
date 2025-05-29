require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const pageRoutes = require('./routes/pageRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as view engine with layouts
app.use(expressLayouts);
app.set('layout', 'layouts/default');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": [
          "'self'",
          "https://www.google.com",
          "https://www.gstatic.com",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net"
        ],
        "style-src": [
          "'self'",
          "'unsafe-inline'",
          "https://cdnjs.cloudflare.com",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com", // Added for Google Fonts
          "https://fonts.gstatic.com"    // Added for font files
        ],
        "frame-src": ["'self'", "https://www.google.com"],
        "img-src": ["'self'", "data:", "https://cdnjs.cloudflare.com"],
        "connect-src": ["'self'", "https://ipapi.co"],
        "font-src": ["'self'", "https://fonts.gstatic.com"] // Added for font files
      },
    },
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

app.use((req, res, next) => {
    if (req.path.startsWith('/assets') || req.path.startsWith('/public')) {
        return next();
    }
    limiter(req, res, next);
});

// Force HTTPS in production
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

// Routes
app.use('/', pageRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: '404 - Not Found',
        layout: 'layouts/default'
    });
});

// Error handling
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).render('error', {
            title: 'Invalid CSRF Token',
            message: 'Invalid CSRF token. Please try again.',
            layout: 'layouts/default'
        });
    }
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Server Error',
        message: 'Something went wrong. Please try again later.',
        layout: 'layouts/default'
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Secure server running at http://localhost:${PORT}`);
});