require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const helmet = require('helmet');
const flash = require('connect-flash');
const { initializeDatabase, closeDb } = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Initialize database
initializeDatabase();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      frameSrc: ["https://js.stripe.com", "https://www.google.com"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));

// Session - expires after 30 minutes of inactivity
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-me',
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

// Routes
app.use('/', require('./routes/pages'));
app.use('/booking', require('./routes/booking'));
app.use('/admin', require('./routes/admin'));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', () => {
  closeDb();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDb();
  process.exit(0);
});

module.exports = app;
