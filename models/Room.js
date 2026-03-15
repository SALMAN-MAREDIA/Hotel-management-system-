const { getDb } = require('../config/database');

const Room = {
  getAll() {
    return getDb().prepare('SELECT * FROM rooms ORDER BY price ASC').all();
  },

  getById(id) {
    return getDb().prepare('SELECT * FROM rooms WHERE id = ?').get(id);
  },

  getAvailable() {
    return getDb().prepare('SELECT * FROM rooms WHERE available = 1 ORDER BY price ASC').all();
  },

  getByCategory(category) {
    return getDb().prepare('SELECT * FROM rooms WHERE category = ? AND available = 1 ORDER BY price ASC').all(category);
  },

  update(id, data) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);
    return getDb().prepare(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  },

  toggleAvailability(id) {
    return getDb().prepare('UPDATE rooms SET available = CASE WHEN available = 1 THEN 0 ELSE 1 END WHERE id = ?').run(id);
  }
};

module.exports = Room;
