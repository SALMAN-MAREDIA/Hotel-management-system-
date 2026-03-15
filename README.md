# Hotel Oasis - Hotel Management System

A full-stack hotel management system for Hotel Oasis, Mumbai. Built with Node.js, Express, EJS, and SQLite.

## Features

- **Public Pages**: Home, Rooms, Gallery, About Us, Contact Us
- **Room Booking**: Complete booking flow with "Reserve Room" button — booking details sent via email
- **Email Notifications**: Booking requests and contact form submissions are sent directly to the hotel owner's email
- **WhatsApp Integration**: Floating WhatsApp icon for quick contact
- **Security**: Helmet, rate limiting, input validation, session management
- **Responsive Design**: Bootstrap 5 with modern custom styling for all screen sizes

## Tech Stack

- **Backend**: Node.js, Express 5
- **Templates**: EJS
- **Database**: SQLite (via better-sqlite3)
- **Security**: Helmet, bcryptjs, express-validator, express-rate-limit
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

### Email Configuration

Configure SMTP settings in `.env` to receive booking and contact form notifications:

```
NOTIFICATION_EMAIL=marediasalman0@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Hotel Oasis <your-email@gmail.com>
```

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
