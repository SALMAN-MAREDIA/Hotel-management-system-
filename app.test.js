const request = require('supertest');

// Set test environment
process.env.SESSION_SECRET = 'test-secret';

const app = require('./app');

describe('Public Pages', () => {
  test('GET / should return home page', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hotel Oasis');
  });

  test('GET /rooms should return rooms page', async () => {
    const res = await request(app).get('/rooms');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Rooms');
  });

  test('GET /rooms/1 should return room detail page', async () => {
    const res = await request(app).get('/rooms/1');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Economy');
  });

  test('GET /rooms/999 should return 404', async () => {
    const res = await request(app).get('/rooms/999');
    expect(res.status).toBe(404);
  });

  test('GET /gallery should return gallery page', async () => {
    const res = await request(app).get('/gallery');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Gallery');
  });

  test('GET /about should return about page', async () => {
    const res = await request(app).get('/about');
    expect(res.status).toBe(200);
    expect(res.text).toContain('About');
  });

  test('GET /contact should return contact page', async () => {
    const res = await request(app).get('/contact');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Contact');
  });

  test('GET /nonexistent should return 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('Contact Form', () => {
  test('POST /contact with valid data should redirect', async () => {
    const res = await request(app)
      .post('/contact')
      .type('form')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        subject: 'Test Subject',
        message: 'This is a test message'
      });
    expect(res.status).toBe(302);
  });

  test('POST /contact with invalid data should return 400', async () => {
    const res = await request(app)
      .post('/contact')
      .type('form')
      .send({ name: '', email: 'invalid', subject: '', message: '' });
    expect(res.status).toBe(400);
  });
});

describe('Booking', () => {
  test('GET /booking/1 should return booking form', async () => {
    const res = await request(app).get('/booking/1');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Reservation');
  });

  test('GET /booking/999 should return 404', async () => {
    const res = await request(app).get('/booking/999');
    expect(res.status).toBe(404);
  });

  test('POST /booking/1 with valid data should create booking', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const res = await request(app)
      .post('/booking/1')
      .type('form')
      .send({
        guest_name: 'Test Guest',
        guest_email: 'guest@example.com',
        guest_phone: '9876543210',
        check_in: tomorrow.toISOString().split('T')[0],
        check_out: dayAfter.toISOString().split('T')[0],
        guests: 2,
        special_requests: 'None'
      });
    expect(res.status).toBe(200);
    expect(res.text).toContain('Booking Has Been Sent');
  });

  test('POST /booking/1 with invalid data should return 400', async () => {
    const res = await request(app)
      .post('/booking/1')
      .type('form')
      .send({ guest_name: '', guest_email: 'invalid', guest_phone: '', check_in: '', check_out: '', guests: 0 });
    expect(res.status).toBe(400);
  });

  test('Booking form should have Reserve Room button', async () => {
    const res = await request(app).get('/booking/1');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Reserve Room');
  });
});

describe('Admin Routes Removed', () => {
  test('GET /admin/login should return 404', async () => {
    const res = await request(app).get('/admin/login');
    expect(res.status).toBe(404);
  });

  test('GET /admin/dashboard should return 404', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.status).toBe(404);
  });
});

describe('WhatsApp Integration', () => {
  test('Home page should contain WhatsApp link', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('wa.me');
    expect(res.text).toContain('whatsapp');
  });
});

describe('Responsive Markup', () => {
  test('home page should include responsive hero and feature grid classes', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('hero-row');
    expect(res.text).toContain('col-lg-3 col-md-6 col-sm-6 col-12');
  });

  test('booking and contact forms should use responsive country code select class', async () => {
    const bookingRes = await request(app).get('/booking/1');
    expect(bookingRes.status).toBe(200);
    expect(bookingRes.text).toContain('country-code-select');
    expect(bookingRes.text).toContain('booking-summary-card');

    const contactRes = await request(app).get('/contact');
    expect(contactRes.status).toBe(200);
    expect(contactRes.text).toContain('country-code-select');
  });
});

describe('Security and Rate Limiting', () => {
  test('POST /contact should return 429 after rate limit is exceeded', async () => {
    const originalEnv = { ...process.env };
    jest.resetModules();
    process.env = {
      ...originalEnv,
      SESSION_SECRET: 'test-secret',
      FORM_RATE_LIMIT_MAX: '1',
      FORM_RATE_LIMIT_WINDOW_MS: '60000'
    };

    const limitedApp = require('./app');
    const payload = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      subject: 'Test Subject',
      message: 'This is a test message'
    };

    const first = await request(limitedApp).post('/contact').type('form').send(payload);
    expect(first.status).toBe(302);

    const second = await request(limitedApp).post('/contact').type('form').send(payload);
    expect(second.status).toBe(429);
    expect(second.text).toContain('Too many form submissions');

    process.env = originalEnv;
  }, 15000);

  test('should throw in production when SESSION_SECRET is missing', () => {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '.env');
    const envBackup = envPath + '.bak';
    const originalEnv = { ...process.env };

    // Temporarily hide .env so dotenv cannot reload SESSION_SECRET
    if (fs.existsSync(envPath)) fs.renameSync(envPath, envBackup);

    try {
      process.env = { ...originalEnv, NODE_ENV: 'production' };
      delete process.env.SESSION_SECRET;

      jest.isolateModules(() => {
        expect(() => require('./app')).toThrow('SESSION_SECRET must be set in production.');
      });
    } finally {
      process.env = originalEnv;
      if (fs.existsSync(envBackup)) fs.renameSync(envBackup, envPath);
    }
  });
});
