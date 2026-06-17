# CLIKZ Wedding Films — Billing System

A modern MERN stack billing app for wedding photography/videography studios.

## Features
- Auto-generated invoice numbers (CWF-0001, CWF-0002...)
- Client autocomplete search
- Multi-service invoice table with live total calculation
- Discount, advance paid, balance tracking
- WhatsApp share with pre-filled message
- Print / PDF via browser print
- Invoice status tracking (Draft → Sent → Partial → Paid)
- Dashboard with revenue stats

---

## Setup

### 1. Clone / unzip this project

### 2. Configure environment
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secret
```

### 3. Install all dependencies
```bash
npm run install:all
```

### 4. Run development servers
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### 5. Login
Default credentials:
- Email: `admin@clikzweddingfilms.com`  
- Password: `clikz@123`

---

## Production Build
```bash
cd client && npm run build
```
Serve the `client/dist` folder with Express or Nginx.

---

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Express.js, Node.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT |
| PDF | Browser Print / window.print() |
| WhatsApp | wa.me deep link |

---

## Folder Structure
```
clikz-billing/
├── client/          ← React + Vite + Tailwind
│   └── src/
│       ├── pages/   ← Dashboard, Invoices, Clients
│       ├── components/ ← InvoiceForm, Layout
│       └── api/     ← Axios instance
└── server/          ← Express API
    ├── models/      ← Invoice, Client (Mongoose)
    ├── routes/      ← invoices, clients, auth, dashboard
    └── middleware/  ← JWT auth
```

## Customisation
- Change studio name/contact: `client/src/pages/InvoiceView.jsx` (header section)
- Add more services: `server/routes/services.js`
- Change invoice prefix (CWF): `server/models/Invoice.js` pre-save hook
