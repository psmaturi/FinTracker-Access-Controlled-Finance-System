# FinTracker Backend

Express + MongoDB (Mongoose) API with JWT auth, role-based access, transaction CRUD, aggregated summaries, and Indian Rupee (`₹`) formatting in JSON responses.

## Setup

1. **Environment** — create `backend/.env`:

   ```env
   MONGO_URI=mongodb+srv://... or mongodb://localhost:27017/fintracker
   JWT_SECRET=your-long-random-secret
   ```

   Optional (for `npm run create-admin`):

   ```env
   ADMIN_EMAIL=admin@fintracker.com
   ADMIN_PASSWORD=admin123
   ADMIN_NAME=Admin User
   ```

2. **Install & run**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   Server defaults to port `5000` (or `PORT` from env).

3. **Create an administrator** (see also `README_ADMIN.md`):

   ```bash
   npm run create-admin
   ```

## Assumptions

- Amounts are stored as plain numbers in MongoDB (no currency symbol).
- Summary and list responses include **formatted** INR strings using `en-IN` grouping, plus numeric fields where noted.
- **Viewers** may only issue **GET** requests globally, except **POST/PUT/PATCH/DELETE** on **`/api/transactions`** (own records only; enforced in controllers).
- **Transactions**: non-admin users may only read/write rows where `userId` is their account. **Admins** may access any transaction; list/summary without `userId` aggregates **all** users; optional `?userId=` narrows.
- **Legacy data**: `role: "user"` → `viewer`; missing `isActive` → `true` on startup.

## Role permissions

| Role    | GET (most routes) | Summaries | Own transactions CRUD | All users’ transactions | User admin APIs |
| ------- | ----------------- | --------- | --------------------- | ------------------------ | --------------- |
| viewer  | Yes*              | No        | Yes                   | No                       | No              |
| analyst | Yes*              | Yes       | Yes                   | No                       | No              |
| admin   | Yes*              | Yes       | Yes (any `userId`)    | Yes                      | Yes             |

\*Except global viewer rule: viewers cannot POST/PATCH/DELETE outside `/api/transactions`.

## API endpoints

Base path: `/api`

### Auth

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/auth/register` | Public | Register (`viewer`, `isActive: true`). |
| POST | `/auth/login` | Public | Returns `token` + `user` (`id`, `_id`, `name`, `email`, `role`, `isActive`). |
| POST | `/auth/users` | Admin | Create user. Body: `name`, `email`, `password`, optional `role`, `isActive`. |
| GET | `/auth/users` | Admin | List users. |
| PATCH | `/auth/users/:id/status` | Admin | Body: `{ "isActive": boolean }`. |
| PATCH | `/auth/users/:id/role` | Admin | Body: `{ "role": "viewer" \| "analyst" \| "admin" }`. |
| DELETE | `/auth/users/:id` | Admin | Deletes user and their transactions (not self). |

### Transactions

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/transactions` | Authenticated | Filters: `type`, `category`, `startDate`, `endDate`, `search`, `page`, `limit`. Admin: optional `userId` or omit for all users. |
| GET | `/transactions/:id` | Authenticated | Single row; scope by role. |
| POST | `/transactions` | Authenticated | Create for `req.user` unless admin sends `userId`. |
| PUT | `/transactions/:id` | Authenticated | Update; non-admin own rows only. |
| DELETE | `/transactions/:id` | Authenticated | Soft delete; non-admin own rows only. |

Response items include `amount`, `amountFormatted`, `id`, `_id`.

### Summaries (analyst or admin)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/summary` | Totals (+ numeric values). Admin: optional `?userId=` or all users. |
| GET | `/summary/category` | Per category. Same `userId` rule. |
| GET | `/summary/monthly` | Monthly trends in **Asia/Kolkata**. Same `userId` rule. |

## Errors

`AppError` and duplicate key (`11000`) return appropriate **4xx** codes; generic failures **500**. Message shape: `{ "message": "..." }`.

## Project layout

`server.js`, `routes/`, `controllers/`, `models/`, `middleware/`, `utils/`.
