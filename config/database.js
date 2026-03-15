const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', 'db');
const DB_PATH = path.join(DB_DIR, 'hotel.db');

// Ensure db directory exists
fs.mkdirSync(DB_DIR, { recursive: true });

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT,
      amenities TEXT,
      image TEXT,
      available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER DEFAULT 1,
      total_amount INTEGER NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      payment_id TEXT,
      booking_status TEXT DEFAULT 'pending',
      special_requests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      image TEXT NOT NULL,
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed rooms
  const roomCount = database.prepare('SELECT COUNT(*) as count FROM rooms').get();
  if (roomCount.count === 0) {
    const rooms = [
      { name: 'A/C Economy Single', category: 'Economy', type: 'Single', price: 1900, description: 'Comfortable air-conditioned economy room perfect for solo travelers. Features modern amenities in a cozy setting.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service', image: '/images/room-economy.jpg' },
      { name: 'Standard Non A/C Double', category: 'Standard', type: 'Double', price: 1900, description: 'Spacious standard room with excellent ventilation, ideal for couples or friends. Enjoy a comfortable stay without breaking the bank.', amenities: 'Free WiFi,Colour TV,Satellite Channels,Intercom,Room Service,Fan', image: '/images/room-standard.jpg' },
      { name: 'Deluxe A/C Single', category: 'Deluxe', type: 'Single', price: 2200, description: 'Elegantly furnished deluxe room with premium amenities for a refined single-occupancy experience.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe', image: '/images/room-deluxe-single.jpg' },
      { name: 'Deluxe A/C Double', category: 'Deluxe', type: 'Double', price: 2500, description: 'Luxurious deluxe double room with vibrant decor and premium furnishings for a memorable stay.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe', image: '/images/room-deluxe-double.jpg' },
      { name: 'Executive A/C Single', category: 'Executive', type: 'Single', price: 3000, description: 'Top-tier executive single room with the finest amenities, perfect for business travelers seeking comfort and style.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe,Work Desk,Bathrobe', image: '/images/room-executive-single.jpg' },
      { name: 'Executive A/C Double', category: 'Executive', type: 'Double', price: 3200, description: 'Spacious executive double room offering luxury and comfort with premium furnishings and exclusive amenities.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe,Work Desk,Bathrobe', image: '/images/room-executive-double.jpg' },
      { name: 'Executive A/C Triple', category: 'Executive', type: 'Triple', price: 3700, description: 'Our largest executive room accommodating three guests with all premium amenities and ample space.', amenities: 'Free WiFi,A/C,Colour TV,Satellite Channels,Intercom,Room Service,Mini Bar,Safe,Work Desk,Bathrobe', image: '/images/room-executive-triple.jpg' }
    ];

    const insert = database.prepare('INSERT INTO rooms (name, category, type, price, description, amenities, image) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const room of rooms) {
      insert.run(room.name, room.category, room.type, room.price, room.description, room.amenities, room.image);
    }
  }

  // Seed gallery
  const galleryCount = database.prepare('SELECT COUNT(*) as count FROM gallery').get();
  if (galleryCount.count === 0) {
    const galleryItems = [
      { title: 'Hotel Lobby', image: '/images/gallery-lobby.jpg', category: 'Interior' },
      { title: 'Deluxe Room', image: '/images/gallery-room1.jpg', category: 'Rooms' },
      { title: 'Executive Suite', image: '/images/gallery-room2.jpg', category: 'Rooms' },
      { title: 'Restaurant', image: '/images/gallery-restaurant.jpg', category: 'Dining' },
      { title: 'Hotel Exterior', image: '/images/gallery-exterior.jpg', category: 'Exterior' },
      { title: 'Conference Room', image: '/images/gallery-conference.jpg', category: 'Facilities' }
    ];
    const insertGallery = database.prepare('INSERT INTO gallery (title, image, category) VALUES (?, ?, ?)');
    for (const item of galleryItems) {
      insertGallery.run(item.title, item.image, item.category);
    }
  }

  return database;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, initializeDatabase, closeDb };
