const nodemailer = require('nodemailer');

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;

function getMailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
}

function getFromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER;
}

module.exports = { getMailTransporter, getFromAddress, NOTIFICATION_EMAIL };
