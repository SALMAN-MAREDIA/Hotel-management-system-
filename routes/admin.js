const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Contact = require('../models/Contact');
const Gallery = require('../models/Gallery');
const { isAuthenticated } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiter for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false
});

// Login page
router.get('/login', (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { title: 'Admin Login - Hotel Oasis', currentPage: 'admin', errors: [] });
});

// Login process
router.post('/login', loginLimiter, [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('admin/login', {
      title: 'Admin Login - Hotel Oasis',
      currentPage: 'admin',
      errors: errors.array()
    });
  }

  try {
    const admin = Admin.findByEmail(req.body.email);
    if (!admin || !Admin.verifyPassword(req.body.password, admin.password)) {
      return res.status(401).render('admin/login', {
        title: 'Admin Login - Hotel Oasis',
        currentPage: 'admin',
        errors: [{ msg: 'Invalid email or password' }]
      });
    }

    req.session.adminId = admin.id;
    req.session.adminName = admin.username;
    const returnTo = req.session.returnTo || '/admin/dashboard';
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).render('admin/login', {
      title: 'Admin Login - Hotel Oasis',
      currentPage: 'admin',
      errors: [{ msg: 'An error occurred. Please try again.' }]
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.redirect('/admin/login');
  });
});

// Dashboard
router.get('/dashboard', isAuthenticated, (req, res) => {
  try {
    const stats = Booking.getStats();
    const recentBookings = Booking.getRecent(5);
    const unreadMessages = Contact.getUnreadCount();
    const rooms = Room.getAll();

    res.render('admin/dashboard', {
      title: 'Dashboard - Hotel Oasis',
      currentPage: 'admin',
      adminName: req.session.adminName,
      stats,
      recentBookings,
      unreadMessages,
      rooms
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('error', {
      title: 'Error',
      errorCode: 500,
      errorMessage: 'Failed to load dashboard',
      currentPage: 'admin'
    });
  }
});

// All bookings
router.get('/bookings', isAuthenticated, (req, res) => {
  try {
    const bookings = Booking.getAll();
    res.render('admin/bookings', {
      title: 'Bookings - Hotel Oasis',
      currentPage: 'admin',
      adminName: req.session.adminName,
      bookings
    });
  } catch (err) {
    console.error('Bookings error:', err);
    res.status(500).render('error', { title: 'Error', errorCode: 500, errorMessage: 'Failed to load bookings', currentPage: 'admin' });
  }
});

// Update booking status
router.post('/bookings/:id/status', isAuthenticated, (req, res) => {
  try {
    const { status } = req.body;
    if (['confirmed', 'checked-in', 'checked-out', 'cancelled'].includes(status)) {
      Booking.updateStatus(parseInt(req.params.id, 10), status);
    }
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error('Update booking error:', err);
    res.redirect('/admin/bookings');
  }
});

// Messages
router.get('/messages', isAuthenticated, (req, res) => {
  try {
    const messages = Contact.getAll();
    res.render('admin/messages', {
      title: 'Messages - Hotel Oasis',
      currentPage: 'admin',
      adminName: req.session.adminName,
      messages
    });
  } catch (err) {
    console.error('Messages error:', err);
    res.status(500).render('error', { title: 'Error', errorCode: 500, errorMessage: 'Failed to load messages', currentPage: 'admin' });
  }
});

// Mark message as read
router.post('/messages/:id/read', isAuthenticated, (req, res) => {
  try {
    Contact.markAsRead(parseInt(req.params.id, 10));
    res.redirect('/admin/messages');
  } catch (err) {
    console.error('Mark read error:', err);
    res.redirect('/admin/messages');
  }
});

// Delete message
router.post('/messages/:id/delete', isAuthenticated, (req, res) => {
  try {
    Contact.delete(parseInt(req.params.id, 10));
    res.redirect('/admin/messages');
  } catch (err) {
    console.error('Delete message error:', err);
    res.redirect('/admin/messages');
  }
});

// Toggle room availability
router.post('/rooms/:id/toggle', isAuthenticated, (req, res) => {
  try {
    Room.toggleAvailability(parseInt(req.params.id, 10));
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Toggle room error:', err);
    res.redirect('/admin/dashboard');
  }
});

// Delete booking
router.post('/bookings/:id/delete', isAuthenticated, (req, res) => {
  try {
    Booking.delete(parseInt(req.params.id, 10));
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error('Delete booking error:', err);
    res.redirect('/admin/bookings');
  }
});

// Gallery management page
router.get('/gallery', isAuthenticated, (req, res) => {
  try {
    const gallery = Gallery.getAll();
    res.render('admin/gallery', {
      title: 'Gallery Management - Hotel Oasis',
      currentPage: 'admin',
      adminName: req.session.adminName,
      gallery
    });
  } catch (err) {
    console.error('Gallery management error:', err);
    res.status(500).render('error', { title: 'Error', errorCode: 500, errorMessage: 'Failed to load gallery', currentPage: 'admin' });
  }
});

// Add gallery photo
router.post('/gallery/add', isAuthenticated, [
  body('title').trim().notEmpty().withMessage('Title is required').escape(),
  body('category').trim().notEmpty().withMessage('Category is required').escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg).join(', '));
    return res.redirect('/admin/gallery');
  }
  try {
    Gallery.create({
      title: req.body.title,
      category: req.body.category,
      image_url: req.body.image_url || null
    });
    req.flash('success', 'Photo added to gallery');
    res.redirect('/admin/gallery');
  } catch (err) {
    console.error('Add gallery error:', err);
    req.flash('error', 'Failed to add photo');
    res.redirect('/admin/gallery');
  }
});

// Delete gallery photo
router.post('/gallery/:id/delete', isAuthenticated, (req, res) => {
  try {
    Gallery.delete(parseInt(req.params.id, 10));
    req.flash('success', 'Photo removed from gallery');
    res.redirect('/admin/gallery');
  } catch (err) {
    console.error('Delete gallery error:', err);
    req.flash('error', 'Failed to remove photo');
    res.redirect('/admin/gallery');
  }
});

module.exports = router;
