const { getDb } = require('../config/database');

const Gallery = {
  getAll() {
    return getDb().prepare('SELECT * FROM gallery ORDER BY created_at DESC').all();
  },

  getByCategory(category) {
    return getDb().prepare('SELECT * FROM gallery WHERE category = ? ORDER BY created_at DESC').all(category);
  }
};

module.exports = Gallery;
