const { getDb } = require('../config/database');

const Gallery = {
  getAll() {
    return getDb().prepare('SELECT * FROM gallery ORDER BY created_at DESC').all();
  },

  getByCategory(category) {
    return getDb().prepare('SELECT * FROM gallery WHERE category = ? ORDER BY created_at DESC').all(category);
  },

  create(data) {
    const stmt = getDb().prepare('INSERT INTO gallery (title, image, category) VALUES (?, ?, ?)');
    return stmt.run(data.title, data.image, data.category || 'General');
  },

  delete(id) {
    return getDb().prepare('DELETE FROM gallery WHERE id = ?').run(id);
  }
};

module.exports = Gallery;
