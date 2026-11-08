# Food Manufacturing & Inventory ERP

A compact full-stack starter for a sauce and spice manufacturer. Includes 58 navigable UI screens, a reusable data-management interface, REST API routes, Prisma/MySQL data model, authentication foundation, and seed data.

## Requirements
- Node.js 20+
- MySQL 8+
- npm

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and configure `DATABASE_URL` and `JWT_SECRET`.
3. `npx prisma generate`
4. `npx prisma db push`
5. `npm run db:seed`
6. `npm run dev`
7. Open `http://localhost:3000`

Demo login after seeding:
- Email: `admin@example.com`
- Password: `ChangeMe123!`

Change the demo password and JWT secret before deployment.

## Important implementation notes
- The 58 routes are data-driven screens sharing a consistent CRUD workspace. They are fully navigable and include search, filtering, create/edit/delete dialogs, CSV export, and API-backed data for supported entities.
- Courier providers are configurable placeholders. Live booking/tracking requires merchant credentials and provider-specific API adapters; do not treat the demo adapter as a live courier connection.
- Mushak/VAT screens provide configurable registers and document records. Validate applicable rates, forms, tax treatment and filing workflow with a Bangladesh VAT practitioner and current NBR requirements before production use.
- This is a functional starter project, not a certified accounting, tax-filing, or courier integration product. Complete provider credentials, security review, backups, operational testing and legal/tax validation before go-live.

## Core API
- `GET/POST /api/products`
- `GET/POST /api/suppliers`
- `GET/POST /api/customers`
- `GET/POST /api/warehouses`
- `GET/POST /api/stock-movements`
- `GET/POST /api/purchase-orders`
- `GET/POST /api/production-orders`
- `GET/POST /api/sales-orders`
- `GET/POST /api/returns`
- `GET/POST /api/courier-shipments`
- `GET/POST /api/vat-transactions`
- `GET /api/dashboard`

All API resources support `GET` and `POST`; records can be updated/deleted using `/api/{resource}/{id}` with `PATCH` and `DELETE`. See `lib/resource-config.ts`.
