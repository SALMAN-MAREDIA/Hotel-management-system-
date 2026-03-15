const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Gallery = require('../models/Gallery');
const Contact = require('../models/Contact');
const { body, validationResult } = require('express-validator');

// Home page
router.get('/', (req, res) => {
  const rooms = Room.getAvailable().slice(0, 4);
  res.render('index', { title: 'Welcome to Hotel Oasis', currentPage: 'home', rooms });
});

// Rooms page
router.get('/rooms', (req, res) => {
  const category = req.query.category;
  const rooms = category ? Room.getByCategory(category) : Room.getAvailable();
  res.render('rooms', { title: 'Our Rooms - Hotel Oasis', currentPage: 'rooms', rooms, selectedCategory: category || 'all' });
});

// Room detail
router.get('/rooms/:id', (req, res, next) => {
  const room = Room.getById(parseInt(req.params.id, 10));
  if (!room) {
    return next({ status: 404, message: 'Room not found' });
  }
  res.render('room-detail', { title: `${room.name} - Hotel Oasis`, currentPage: 'rooms', room });
});

// Gallery page
router.get('/gallery', (req, res) => {
  const gallery = Gallery.getAll();
  res.render('gallery', { title: 'Gallery - Hotel Oasis', currentPage: 'gallery', gallery });
});

// About page
router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us - Hotel Oasis', currentPage: 'about' });
});

// Contact page
router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us - Hotel Oasis', currentPage: 'contact', errors: [], formData: {} });
});

// Contact form submission
router.post('/contact', [
  body('name').trim().notEmpty().withMessage('Name is required').escape(),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional({ values: 'falsy' }).trim().escape(),
  body('subject').trim().notEmpty().withMessage('Subject is required').escape(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message must be under 2000 characters').escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('contact', {
      title: 'Contact Us - Hotel Oasis',
      currentPage: 'contact',
      errors: errors.array(),
      formData: req.body
    });
  }

  try {
    Contact.create(req.body);
    req.flash('success', 'Your message has been sent successfully! We will get back to you soon.');
    res.redirect('/contact');
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).render('contact', {
      title: 'Contact Us - Hotel Oasis',
      currentPage: 'contact',
      errors: [{ msg: 'An error occurred. Please try again.' }],
      formData: req.body
    });
  }
});

module.exports = router;
