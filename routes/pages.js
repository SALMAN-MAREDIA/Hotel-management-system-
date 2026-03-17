const express = require('express');
const router = express.Router();
const { getAvailable, getByCategory, getById } = require('../data/rooms');
const { getAll: getGallery } = require('../data/gallery');
const { body, validationResult } = require('express-validator');
const { getMailTransporter, getFromAddress, NOTIFICATION_EMAIL } = require('../utils/mailer');

// Home page
router.get('/', (req, res) => {
  const rooms = getAvailable().slice(0, 4);
  res.render('index', { title: 'Welcome to Hotel Oasis', currentPage: 'home', rooms });
});

// Rooms page
router.get('/rooms', (req, res) => {
  const category = req.query.category;
  const rooms = category ? getByCategory(category) : getAvailable();
  res.render('rooms', { title: 'Our Rooms - Hotel Oasis', currentPage: 'rooms', rooms, selectedCategory: category || 'all' });
});

// Room detail
router.get('/rooms/:id', (req, res, next) => {
  const room = getById(parseInt(req.params.id, 10));
  if (!room) {
    return next({ status: 404, message: 'Room not found' });
  }
  res.render('room-detail', { title: `${room.name} - Hotel Oasis`, currentPage: 'rooms', room });
});

// Gallery page
router.get('/gallery', (req, res) => {
  const gallery = getGallery();
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
  body('phone').trim().notEmpty().withMessage('Phone number is required')
    .matches(/^\d{10}$/).withMessage('Phone must be exactly 10 digits').escape(),
  body('subject').trim().notEmpty().withMessage('Subject is required').escape(),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message must be under 2000 characters').escape()
], async (req, res) => {
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
    const countryCode = req.body.country_code || '+91';
    const phoneWithCode = countryCode + req.body.phone;

    // Send email notification to hotel owner
    const transporter = getMailTransporter();
    if (transporter && NOTIFICATION_EMAIL) {
      try {
        await transporter.sendMail({
          from: getFromAddress(),
          to: NOTIFICATION_EMAIL,
          subject: `New Contact Message: ${req.body.subject}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;border-radius:10px">
              <h2 style="color:#c8a96e;text-align:center">📩 New Contact Message</h2>
              <div style="background:#fff;padding:20px;border-radius:8px;margin:15px 0">
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Name</td><td style="padding:10px;border-bottom:1px solid #eee">${req.body.name}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Email</td><td style="padding:10px;border-bottom:1px solid #eee">${req.body.email}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Phone</td><td style="padding:10px;border-bottom:1px solid #eee">${phoneWithCode}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Subject</td><td style="padding:10px;border-bottom:1px solid #eee">${req.body.subject}</td></tr>
                  <tr><td style="padding:10px;font-weight:bold;color:#555;vertical-align:top">Message</td><td style="padding:10px">${req.body.message}</td></tr>
                </table>
              </div>
              <p style="color:#888;font-size:12px;text-align:center">Reply to this guest at: ${req.body.email}</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Contact notification email error:', emailErr);
      }
    }

    req.flash('success', 'Your message has been sent successfully! Soon we will reach out to you. Thank you for contacting Hotel Oasis.');
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
