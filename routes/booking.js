const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const { body, validationResult } = require('express-validator');

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET && STRIPE_SECRET !== 'sk_test_your_stripe_secret_key'
  ? require('stripe')(STRIPE_SECRET)
  : null;

// Booking form page
router.get('/:roomId', (req, res, next) => {
  const room = Room.getById(parseInt(req.params.roomId, 10));
  if (!room) {
    return next({ status: 404, message: 'Room not found' });
  }
  res.render('booking', {
    title: `Book ${room.name} - Hotel Oasis`,
    currentPage: 'rooms',
    room,
    errors: [],
    formData: {},
    stripeKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
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
  const room = Room.getById(parseInt(req.params.roomId, 10));
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
      formData: req.body,
      stripeKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
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

    // If Stripe is configured, create a checkout session
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${room.name} - ${nights} night(s)`,
              description: `Hotel Oasis - ${room.category} Room`
            },
            unit_amount: totalAmount * 100
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/booking/${room.id}`,
        metadata: {
          room_id: String(room.id),
          guest_name: req.body.guest_name,
          guest_email: req.body.guest_email,
          guest_phone: guestPhone,
          check_in: req.body.check_in,
          check_out: req.body.check_out,
          guests: String(req.body.guests),
          special_requests: req.body.special_requests || ''
        }
      });

      return res.redirect(303, session.url);
    }

    // Without Stripe, create booking directly (demo mode)
    const result = Booking.create({
      room_id: room.id,
      guest_name: req.body.guest_name,
      guest_email: req.body.guest_email,
      guest_phone: guestPhone,
      check_in: req.body.check_in,
      check_out: req.body.check_out,
      guests: req.body.guests,
      total_amount: totalAmount,
      payment_status: 'demo',
      special_requests: req.body.special_requests
    });

    res.render('booking-success', {
      title: 'Booking Confirmed - Hotel Oasis',
      currentPage: 'rooms',
      booking: {
        id: result.lastInsertRowid,
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
        formData: req.body,
        stripeKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
      });
    }
    next(err);
  }
});

// Booking success page (after Stripe payment)
router.get('/success', async (req, res, next) => {
  try {
    if (stripe && req.query.session_id) {
      const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
      if (session.payment_status === 'paid') {
        const meta = session.metadata;
        const checkIn = new Date(meta.check_in);
        const checkOut = new Date(meta.check_out);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        const result = Booking.create({
          room_id: parseInt(meta.room_id, 10),
          guest_name: meta.guest_name,
          guest_email: meta.guest_email,
          guest_phone: meta.guest_phone,
          check_in: meta.check_in,
          check_out: meta.check_out,
          guests: parseInt(meta.guests, 10),
          total_amount: session.amount_total / 100,
          payment_status: 'paid',
          payment_id: session.payment_intent,
          special_requests: meta.special_requests
        });

        const room = Room.getById(parseInt(meta.room_id, 10));

        return res.render('booking-success', {
          title: 'Booking Confirmed - Hotel Oasis',
          currentPage: 'rooms',
          booking: {
            id: result.lastInsertRowid,
            room_name: room ? room.name : 'Room',
            guest_name: meta.guest_name,
            check_in: meta.check_in,
            check_out: meta.check_out,
            total_amount: session.amount_total / 100,
            nights
          }
        });
      }
    }

    res.render('booking-success', {
      title: 'Booking Confirmed - Hotel Oasis',
      currentPage: 'rooms',
      booking: null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
