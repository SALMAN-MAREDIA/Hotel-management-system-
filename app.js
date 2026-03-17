require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const helmet = require('helmet');
const flash = require('connect-flash');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

if (isProduction || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

const generalRateLimiter = rateLimit({
  windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parsePositiveInt(process.env.RATE_LIMIT_MAX, 300),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: 'Too many requests. Please try again in a few minutes.'
});

const formRateLimiter = rateLimit({
  windowMs: parsePositiveInt(process.env.FORM_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: parsePositiveInt(process.env.FORM_RATE_LIMIT_MAX, 20),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: 'Too many form submissions. Please wait and try again.'
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["https://www.google.com"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(generalRateLimiter);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

const sessionSecret = process.env.SESSION_SECRET || (!isProduction ? crypto.randomBytes(32).toString('hex') : null);
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set in production.');
}

// Session - expires after 30 minutes of inactivity
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  next();
});

// Stricter rate limits for submission endpoints
app.use('/contact', formRateLimiter);
app.use('/booking', formRateLimiter);

// Routes
app.use('/', require('./routes/pages'));
app.use('/booking', require('./routes/booking'));

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
