const { getDb } = require('../config/database');

const Booking = {
  create(data) {
    const stmt = getDb().prepare(`
      INSERT INTO bookings (room_id, guest_name, guest_email, guest_phone, check_in, check_out, guests, total_amount, payment_status, payment_id, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.room_id, data.guest_name, data.guest_email, data.guest_phone,
      data.check_in, data.check_out, data.guests || 1, data.total_amount,
      data.payment_status || 'pending', data.payment_id || null, data.special_requests || null
    );
  },

  getAll() {
    return getDb().prepare(`
      SELECT b.*, r.name as room_name, r.category as room_category
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
    `).all();
  },

  getById(id) {
    return getDb().prepare(`
      SELECT b.*, r.name as room_name, r.category as room_category
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      WHERE b.id = ?
    `).get(id);
  },

  updatePaymentStatus(id, status, paymentId) {
    return getDb().prepare('UPDATE bookings SET payment_status = ?, payment_id = ? WHERE id = ?').run(status, paymentId, id);
  },

  updateStatus(id, status) {
    return getDb().prepare('UPDATE bookings SET booking_status = ? WHERE id = ?').run(status, id);
  },

  getRecent(limit = 10) {
    return getDb().prepare(`
      SELECT b.*, r.name as room_name
      FROM bookings b
      LEFT JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
      LIMIT ?
    `).all(limit);
  },

  getStats() {
    const db = getDb();
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM bookings WHERE payment_status = 'paid'").get().total;
    const pendingBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE booking_status = 'confirmed' AND payment_status = 'pending'").get().count;
    const todayBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE DATE(created_at) = DATE('now')").get().count;
    return { totalBookings, totalRevenue, pendingBookings, todayBookings };
  }
};

module.exports = Booking;
