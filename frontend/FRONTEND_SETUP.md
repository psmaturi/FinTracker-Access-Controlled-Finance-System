# Finance Tracker - Frontend Documentation

## 📁 Folder Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── DashboardLayout.js      # Main layout wrapper with sidebar
│   │   ├── DashboardLayout.css
│   │   ├── Header.js                # Top header component
│   │   ├── Header.css
│   │   ├── Sidebar.js                # Navigation sidebar
│   │   ├── Sidebar.css
│   │   └── ProtectedRoute.js         # Route protection component
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.js              # User login page
│   │   │   ├── Register.js           # User registration page
│   │   │   └── Auth.css              # Shared auth styles
│   │   ├── admin/
│   │   │   ├── AdminLogin.js         # Admin login page
│   │   │   └── AdminDashboard.js     # Admin dashboard
│   │   └── user/
│   │       ├── Dashboard.js          # Main dashboard
│   │       ├── Budget.js             # Budget management
│   │       ├── Goals.js             # Financial goals
│   │       ├── Investments.js        # Investment tracking
│   │       ├── Group.js              # Group/Family finance
│   │       ├── Profile.js            # User profile
│   │       └── UserPages.css         # Shared user page styles
│   ├── services/
│   │   └── api.js                    # Axios API configuration
│   ├── App.js                        # Main app component with routing
│   ├── App.css                       # App-level styles
│   ├── index.js                      # Entry point
│   └── index.css                     # Global styles
├── package.json
└── README.md
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables (Optional)

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

If not set, defaults to `http://localhost:5000/api`

### 3. Start Development Server

```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🔌 Backend Connection

### API Configuration

The frontend connects to the backend through the `api.js` service file:

- **Base URL**: `http://localhost:5000/api` (configurable via `.env`)
- **Authentication**: JWT tokens stored in `localStorage`
- **Auto Token Injection**: All API requests automatically include the token in headers
- **Auto Logout**: On 401 errors, user is automatically logged out

### API Endpoints Used

1. **POST /api/auth/register**
   - Body: `{ name, email, password }`
   - Response: `{ message: "User registered successfully" }`

2. **POST /api/auth/login**
   - Body: `{ email, password }`
   - Response: `{ token, user: { id, name, email, role } }`

### How Authentication Works

1. User logs in → Token saved to `localStorage`
2. User data saved to `localStorage` as JSON
3. All subsequent API calls include token in `Authorization: Bearer <token>` header
4. Protected routes check for token before rendering
5. On 401 error → Token cleared, redirect to login

## 🛣️ Routes

### Public Routes
- `/login` - User login
- `/register` - User registration
- `/admin/login` - Admin login

### Protected User Routes (require authentication)
- `/dashboard` - Main dashboard
- `/budget` - Budget management
- `/goals` - Financial goals
- `/investments` - Investment tracking
- `/group` - Group/Family finance
- `/profile` - User profile

### Protected Admin Routes (require admin role)
- `/admin/dashboard` - Admin dashboard

## 🎨 Features Implemented

### ✅ Authentication
- Login page with email/password
- Register page with name/email/password
- JWT token storage in localStorage
- Role-based redirects (admin vs user)
- Logout functionality

### ✅ Route Protection
- `ProtectedRoute` component checks for token
- Admin-only routes check user role
- Automatic redirect to login if not authenticated

### ✅ Layout
- Common sidebar for all logged-in pages
- Sidebar shows navigation links
- Sidebar displays user info and logout button
- Header with date display
- Sidebar hidden on login/register pages

### ✅ User Pages
- Dashboard with stat cards
- Budget management page
- Goals tracking page
- Investments portfolio page
- Group/Family finance page
- Profile page with user info

### ✅ Admin Pages
- Admin login (validates admin role)
- Admin dashboard with admin-specific stats

## 🔧 Running Frontend + Backend Together

### Terminal 1 - Backend
```bash
cd backend
npm install
# Make sure .env file exists with MONGO_URI and JWT_SECRET
npm start
# Backend runs on http://localhost:5000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

### Testing the Connection

1. Open `http://localhost:3000`
2. Click "Register" to create an account
3. After registration, login with your credentials
4. You should be redirected to the dashboard
5. Navigate through different pages using the sidebar

## 📝 Key Components Explained

### ProtectedRoute.js
- Checks for token in localStorage
- Redirects to `/login` if no token
- For admin routes, also checks `user.role === "admin"`

### DashboardLayout.js
- Wraps all protected user pages
- Includes Sidebar and Header
- Provides consistent layout

### Sidebar.js
- Fixed sidebar with navigation
- Shows user name and email
- Logout button clears token and redirects

### api.js
- Centralized axios instance
- Auto-adds token to all requests
- Handles 401 errors automatically

## 🎯 Next Steps (Future Enhancements)

- Connect Dashboard to real backend data
- Implement budget CRUD operations
- Add goal creation and tracking
- Investment portfolio management
- Group expense sharing features
- Profile update functionality
- Admin user management panel

## ⚠️ Important Notes

- All components use `.js` extension (no TypeScript)
- All CSS is custom (no Tailwind)
- Components use `export default`
- All imports match exports
- Works reliably on Windows
- No global CSS that hides content

## 🐛 Troubleshooting

### Blank Screen
- Check browser console for errors
- Verify backend is running on port 5000
- Check CORS configuration in backend

### Login Not Working
- Verify backend is running
- Check network tab for API errors
- Verify JWT_SECRET is set in backend .env

### Routing Issues
- Clear browser cache
- Check that all routes are defined in App.js
- Verify ProtectedRoute is working

---

**Built with:** React, React Router, Axios, CSS
**Backend:** Node.js, Express, MongoDB, JWT

