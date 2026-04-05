# Admin User Setup Guide

## Roles

FinTracker uses three API roles:

- **viewer** — read-only: can `GET` transactions, cannot access summaries or mutate data.
- **analyst** — can `GET` transactions and all `/api/summary` endpoints; cannot create/update/delete transactions.
- **admin** — full transaction CRUD, summaries, and user management (`GET /api/auth/users`, `PATCH /api/auth/users/:id/role`).

New self-service registrations default to **viewer**. Use the script below or promote users via the admin API.

## How to Create an Admin User

There are **no default admin credentials** until you create one.

### Method 1: Using the Script (Recommended)

1. **Set environment variables** (optional, defaults provided):

   ```bash
   # In your .env file or as environment variables
   ADMIN_EMAIL=admin@fintracker.com
   ADMIN_PASSWORD=admin123
   ADMIN_NAME=Admin User
   ```

2. **Run the create admin script**:

   ```bash
   cd backend
   npm run create-admin
   ```

3. **Default credentials** (if not set in .env):

   - **Email**: `admin@fintracker.com`
   - **Password**: `admin123`

### Method 2: Manual MongoDB Update

1. **Register a user** through the frontend registration page (they will be `viewer`).
2. **Connect to your MongoDB database**
3. **Update the user's role**:

   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

   Valid values: `"viewer"`, `"analyst"`, `"admin"`.

### Method 3: Using MongoDB Compass or Atlas

1. Find your user document in the `users` collection
2. Set the `role` field to `"admin"` (or `"analyst"` for summary-only power users)

### Method 4: Admin API

An existing admin can call:

```http
PATCH /api/auth/users/<userId>/role
Content-Type: application/json
Authorization: Bearer <admin-token>

{ "role": "admin" }
```

## Legacy `user` role

Older databases may have `role: "user"`. On server start, the backend migrates those accounts to **`viewer`**. To give them write access via the API, promote them to **`admin`**.

## Admin Login (frontend)

1. Go to: `http://localhost:3000/admin/login`
2. Enter your admin email and password
3. You'll be redirected to `/admin/dashboard`

## Security Notes

⚠️ **IMPORTANT**:

- Change the default admin password after first login
- Use a strong password in production
- Don't commit admin credentials to version control
- Set a strong `JWT_SECRET` in production

## Troubleshooting

**"Access denied. Administrator role required."**

- The user doesn't have `role: "admin"` in the database
- Run the create-admin script or manually update the user's role

**"User already exists"**

- If the email already exists as a non-admin, the script will upgrade it to admin and reset the password (see script output)
- If it's already an admin, the script will inform you

**New users cannot call POST /api/transactions**

- Expected for **viewer** and **analyst** roles. Only **admin** may create/update/delete transactions per current API rules. Promote the account to **admin** if that user should manage data via the API.
