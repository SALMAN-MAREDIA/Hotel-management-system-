const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { getById } = require('../data/rooms');
const { body, validationResult } = require('express-validator');
const { getMailTransporter, getFromAddress, NOTIFICATION_EMAIL } = require('../utils/mailer');

// Booking form page
router.get('/:roomId', (req, res, next) => {
  const room = getById(parseInt(req.params.roomId, 10));
  if (!room) {
    return next({ status: 404, message: 'Room not found' });
  }
  res.render('booking', {
    title: `Book ${room.name} - Hotel Oasis`,
    currentPage: 'rooms',
    room,
    errors: [],
    formData: {}
  });
});

// Process booking
router.post('/:roomId', [
  body('guest_name').trim().notEmpty().withMessage('Full name is required').escape(),
  body('guest_email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('guest_phone').trim().notEmpty().withMessage('Phone number is required')
    .matches(/^\d{7,15}$/).withMessage('Phone must be between 7 and 15 digits').escape(),
  body('check_in').notEmpty().withMessage('Check-in date is required')
    .isISO8601().withMessage('Invalid check-in date'),
  body('check_out').notEmpty().withMessage('Check-out date is required')
    .isISO8601().withMessage('Invalid check-out date'),
  body('guests').isInt({ min: 1, max: 5 }).withMessage('Guests must be between 1 and 5'),
  body('special_requests').optional({ values: 'falsy' }).trim().isLength({ max: 500 }).escape()
], async (req, res, next) => {
  const room = getById(parseInt(req.params.roomId, 10));
  if (!room) {
    return next({ status: 404, message: 'Room not found' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('booking', {
      title: `Book ${room.name} - Hotel Oasis`,
      currentPage: 'rooms',
      room,
      errors: errors.array(),
      formData: req.body
    });
  }

  try {
    const checkIn = new Date(req.body.check_in);
    const checkOut = new Date(req.body.check_out);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw { status: 400, message: 'Check-in date cannot be in the past' };
    }
    if (checkOut <= checkIn) {
      throw { status: 400, message: 'Check-out date must be after check-in date' };
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const guests = parseInt(req.body.guests, 10) || 1;
    const isAC = room.category !== 'Standard';
    const extraPersonCharge = isAC ? 500 : 400;
    const baseOccupancy = room.type === 'Triple' ? 3 : room.type === 'Double' ? 2 : 1;
    const extraPersons = Math.max(0, guests - baseOccupancy);
    const totalAmount = (room.price * nights) + (extraPersons * extraPersonCharge * nights);
    const countryCode = req.body.country_code || '+91';
    const guestPhone = countryCode + req.body.guest_phone;

    const bookingId = crypto.randomUUID().split('-')[0].toUpperCase();

    // Send email notification to hotel owner
    const transporter = getMailTransporter();
    if (transporter && NOTIFICATION_EMAIL) {
      try {
        await transporter.sendMail({
          from: getFromAddress(),
          to: NOTIFICATION_EMAIL,
          subject: `New Room Reservation #${bookingId} - ${room.name}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9;border-radius:10px">
              <h2 style="color:#c8a96e;text-align:center">🏨 New Room Reservation</h2>
              <div style="background:#fff;padding:20px;border-radius:8px;margin:15px 0">
                <h3 style="color:#333;margin-top:0">Booking #${bookingId}</h3>
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Guest Name</td><td style="padding:10px;border-bottom:1px solid #eee">${req.body.guest_name}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Email</td><td style="padding:10px;border-bottom:1px solid #eee">${req.body.guest_email}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Phone</td><td style="padding:10px;border-bottom:1px solid #eee">${guestPhone}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Room</td><td style="padding:10px;border-bottom:1px solid #eee">${room.name} (${room.category})</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Check-in</td><td style="padding:10px;border-bottom:1px solid #eee">${req.body.check_in}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Check-out</td><td style="padding:10px;border-bottom:1px solid #eee">${req.body.check_out}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Guests</td><td style="padding:10px;border-bottom:1px solid #eee">${guests}</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Duration</td><td style="padding:10px;border-bottom:1px solid #eee">${nights} night(s)</td></tr>
                  <tr><td style="padding:10px;border-bottom:1px solid #eee;font-weight:bold;color:#555">Total Amount</td><td style="padding:10px;border-bottom:1px solid #eee;color:#c8a96e;font-weight:bold;font-size:18px">₹${totalAmount.toLocaleString('en-IN')}</td></tr>
                  ${req.body.special_requests ? `<tr><td style="padding:10px;font-weight:bold;color:#555">Special Requests</td><td style="padding:10px">${req.body.special_requests}</td></tr>` : ''}
                </table>
              </div>
              <p style="color:#888;font-size:12px;text-align:center">Please contact the guest to confirm this reservation.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Booking notification email error:', emailErr);
      }
    }

    res.render('booking-success', {
      title: 'Booking Received - Hotel Oasis',
      currentPage: 'rooms',
      booking: {
        id: bookingId,
        room_name: room.name,
        guest_name: req.body.guest_name,
        check_in: req.body.check_in,
        check_out: req.body.check_out,
        total_amount: totalAmount,
        nights
      }
    });
  } catch (err) {
    if (err.status === 400) {
      return res.status(400).render('booking', {
        title: `Book ${room.name} - Hotel Oasis`,
        currentPage: 'rooms',
        room,
        errors: [{ msg: err.message }],
        formData: req.body
      });
    }
    next(err);
  }
});

module.exports = router;
