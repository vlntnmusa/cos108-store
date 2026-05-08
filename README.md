# COS108 Store

A full-stack e-commerce web application built with React and Flask.

## Live URLs
- **Frontend:** https://cos108-store.vercel.app
- **Backend API:** https://vlntnmusa.pythonanywhere.com
- **GitHub:** https://github.com/vlntnmusa/cos108-store

## Demo Account
- Sign in with Google at the live URL
- First user to sign in gets admin role automatically

## How to Run Locally
```bash
# Backend
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python3 app.py

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

## What I Built
A full-stack online store with a React/Vite frontend deployed on Vercel and a Flask/SQLite backend deployed on PythonAnywhere. The app includes Google OAuth login with JWT authentication, role-based access control (customer, cashier, admin), a product storefront with real-time backend search, shopping cart with localStorage persistence, a full checkout flow, order history, an admin dashboard with product CRUD and sales chart, a POS page for cashiers, and CSV order export.

## Feature Extensions
1. Backend search — SQL filtering via GET /api/products?q=
2. Cart persistence — localStorage survives page refresh
3. Admin product form — Create/Edit/Delete wired to existing endpoints
4. Order export CSV — GET /api/orders/export
5. Admin sales dashboard — Chart.js revenue chart from GROUP BY query
