const { getDb } = require('../config/database');

const Contact = {
  create(data) {
    return getDb().prepare(
      'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)'
    ).run(data.name, data.email, data.phone || null, data.subject, data.message);
  },

  getAll() {
    return getDb().prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  },

  getUnread() {
    return getDb().prepare('SELECT * FROM contacts WHERE read = 0 ORDER BY created_at DESC').all();
  },

  markAsRead(id) {
    return getDb().prepare('UPDATE contacts SET read = 1 WHERE id = ?').run(id);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM contacts WHERE id = ?').run(id);
  },

  getUnreadCount() {
    return getDb().prepare('SELECT COUNT(*) as count FROM contacts WHERE read = 0').get().count;
  }
};

module.exports = Contact;
