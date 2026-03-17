# Hotel Oasis - Hotel Management System

A hotel website for Hotel Oasis, Mumbai. Built with Node.js, Express, and EJS templates.

## Features

- **Public Pages**: Home, Rooms, Gallery, About Us, Contact Us
- **Room Booking**: Complete booking flow with "Reserve Room" button — booking details sent via email
- **Email Notifications**: Booking requests and contact form submissions are sent directly to the hotel owner's email
- **WhatsApp Integration**: Floating WhatsApp icon for quick contact
- **Security**: Helmet, server-side validation, sessions, and rate limiting
- **Responsive Design**: Bootstrap 5 with modern custom styling for all screen sizes

## Tech Stack

- **Backend**: Node.js, Express 5
- **Templates**: EJS
- **Data**: In-memory/static room and gallery data
- **Security**: Helmet, express-validator, express-rate-limit, express-session
- **Email**: Nodemailer (SMTP / Gmail)
- **Frontend**: Bootstrap 5, Bootstrap Icons, Custom CSS

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
npm install
cp .env.example .env   # Edit .env with your settings
npm start              # Server runs on http://localhost:3000
```

### Environment Variables & Secrets

Keep all secrets in backend `.env` only. Do **not** put SMTP credentials, session secrets, or other keys in frontend code.

```env
PORT=3000
SESSION_SECRET=replace-with-long-random-secret
NOTIFICATION_EMAIL=owner@example.com
TRUST_PROXY=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
FORM_RATE_LIMIT_WINDOW_MS=900000
FORM_RATE_LIMIT_MAX=20
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Hotel Oasis <your-email@gmail.com>
```

### Email Configuration

Configure SMTP settings in `.env` to receive booking and contact form notifications:

```
NOTIFICATION_EMAIL=owner@example.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Hotel Oasis <your-email@gmail.com>
```

### Deployment, Load Handling & Rate Limiting

- Set `NODE_ENV=production`.
- Set `TRUST_PROXY=true` when deploying behind Nginx/Cloudflare/Render/Heroku so client IP-based rate limiting works correctly.
- Global limiter protects the whole app (`RATE_LIMIT_*`).
- Stricter limiter protects booking and contact submissions (`FORM_RATE_LIMIT_*`).
- Keep `SESSION_SECRET` and SMTP credentials only in server environment variables.

### Running Tests

```bash
npm test
```

## Room Rates

| Category | Single | Double | Triple |
|---|---|---|---|
| A/C Economy | ₹1,900 | - | - |
| Standard Non A/C | - | ₹1,900 | - |
| Deluxe A/C | ₹2,200 | ₹2,500 | - |
| Executive A/C | ₹3,000 | ₹3,200 | ₹3,700 |
| Extra Person A/C | ₹500 | | |
| Extra Person Non A/C | ₹400 | | |

## Contact

- **Address**: 276, Shaheed Bhagat Singh Road, Near GPO, Fort, Mumbai-400001
- **Tel**: +91-22-3022 7886
- **Cell**: +91-82864 70877
- **Email**: info@hoteloasisindia.in / hoteloasismumbai@gmail.com 
