const request = require('supertest');
const fs = require('fs');

// Set test environment
process.env.SESSION_SECRET = 'test-secret';
process.env.ADMIN_EMAIL = 'admin@hoteloasis.com';
process.env.ADMIN_PASSWORD = 'admin123';

// Use a separate test database
const testDbPath = __dirname + '/db/test-hotel.db';
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

// Override database path for tests
jest.mock('./config/database', () => {
  const Database = require('better-sqlite3');
  const bcrypt = require('bcryptjs');
  const mockDbPath = __dirname + '/db/test-hotel.db';
  let db;

  function getDb() {
    if (!db) {
      db = new Database(mockDbPath);
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
    }
    return db;
  }

  function initializeDatabase() {
    const database = getDb();
    database.exec(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL,
        type TEXT NOT NULL, price INTEGER NOT NULL, description TEXT, amenities TEXT,
        image TEXT, available INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT, room_id INTEGER NOT NULL, guest_name TEXT NOT NULL,
        guest_email TEXT NOT NULL, guest_phone TEXT NOT NULL, check_in DATE NOT NULL,
        check_out DATE NOT NULL, guests INTEGER DEFAULT 1, total_amount INTEGER NOT NULL,
        payment_status TEXT DEFAULT 'pending', payment_id TEXT, booking_status TEXT DEFAULT 'confirmed',
        special_requests TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (room_id) REFERENCES rooms(id)
      );
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL,
        phone TEXT, subject TEXT NOT NULL, message TEXT NOT NULL, read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, image TEXT NOT NULL,
        category TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const adminExists = database.prepare('SELECT id FROM admins LIMIT 1').get();
    if (!adminExists) {
      const hashed = bcrypt.hashSync('admin123', 12);
      database.prepare('INSERT INTO admins (username, email, password) VALUES (?, ?, ?)').run('admin', 'admin@hoteloasis.com', hashed);
    }

    const roomCount = database.prepare('SELECT COUNT(*) as count FROM rooms').get();
    if (roomCount.count === 0) {
      database.prepare('INSERT INTO rooms (name, category, type, price, description, amenities, image) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        'Test Room', 'Deluxe', 'Single', 2200, 'A test room', 'WiFi,A/C', '/images/test.jpg'
      );
    }

    const galleryCount = database.prepare('SELECT COUNT(*) as count FROM gallery').get();
    if (galleryCount.count === 0) {
      database.prepare('INSERT INTO gallery (title, image, category) VALUES (?, ?, ?)').run('Test Image', '/images/test.jpg', 'Rooms');
    }

    return database;
  }

  function closeDb() {
    if (db) { db.close(); db = null; }
  }

  return { getDb, initializeDatabase, closeDb };
});

const app = require('./app');
const { closeDb } = require('./config/database');

afterAll(() => {
  closeDb();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
});

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
    expect(res.text).toContain('Test Room');
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
        phone: '+91 12345 67890',
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

  test('POST /booking/1 with valid data should create booking (demo mode)', async () => {
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
        guest_phone: '+91 98765 43210',
        check_in: tomorrow.toISOString().split('T')[0],
        check_out: dayAfter.toISOString().split('T')[0],
        guests: 2,
        special_requests: 'None'
      });
    expect(res.status).toBe(200);
    expect(res.text).toContain('Booking Confirmed');
  });

  test('POST /booking/1 with invalid data should return 400', async () => {
    const res = await request(app)
      .post('/booking/1')
      .type('form')
      .send({ guest_name: '', guest_email: 'invalid', guest_phone: '', check_in: '', check_out: '', guests: 0 });
    expect(res.status).toBe(400);
  });
});

describe('Admin Authentication', () => {
  test('GET /admin/login should return login page', async () => {
    const res = await request(app).get('/admin/login');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Login');
  });

  test('POST /admin/login with invalid credentials should return 401', async () => {
    const res = await request(app)
      .post('/admin/login')
      .type('form')
      .send({ email: 'admin@hoteloasis.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  test('GET /admin/dashboard without auth should redirect to login', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/login');
  });

  test('POST /admin/login with valid credentials should redirect to dashboard', async () => {
    const res = await request(app)
      .post('/admin/login')
      .type('form')
      .send({ email: 'admin@hoteloasis.com', password: 'admin123' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin/dashboard');
  });
});

describe('WhatsApp Integration', () => {
  test('Home page should contain WhatsApp link', async () => {
    const res = await request(app).get('/');
    expect(res.text).toContain('wa.me');
    expect(res.text).toContain('whatsapp');
  });
});
