const { getDb } = require('../config/database');

const Gallery = {
  getAll() {
    return getDb().prepare('SELECT * FROM gallery ORDER BY created_at DESC').all();
  },

  getByCategory(category) {
    return getDb().prepare('SELECT * FROM gallery WHERE category = ? ORDER BY created_at DESC').all(category);
  },

  getById(id) {
    return getDb().prepare('SELECT * FROM gallery WHERE id = ?').get(id);
  },

  create(data) {
    return getDb().prepare(
      'INSERT INTO gallery (title, category, image) VALUES (?, ?, ?)'
    ).run(data.title, data.category, data.image || null);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM gallery WHERE id = ?').run(id);
  }
};

module.exports = Gallery;
