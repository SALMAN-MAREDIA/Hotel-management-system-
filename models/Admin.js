const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');

const Admin = {
  findByEmail(email) {
    return getDb().prepare('SELECT * FROM admins WHERE email = ?').get(email);
  },

  findByUsername(username) {
    return getDb().prepare('SELECT * FROM admins WHERE username = ?').get(username);
  },

  verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  },

  findById(id) {
    return getDb().prepare('SELECT id, username, email, created_at FROM admins WHERE id = ?').get(id);
  }
};

module.exports = Admin;
