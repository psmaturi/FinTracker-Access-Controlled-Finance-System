import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiShield, FiLogIn } from "react-icons/fi";
import api from "../../services/api";
import "../auth/Auth.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      // Check if user is admin
      if (res.data.user.role !== "admin") {
        setError("Access denied. Admin credentials required.");
        return;
      }

      // Save token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect to admin dashboard
      navigate("/admin/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container admin-auth">
      <div className="auth-wrapper">
        <div className="auth-branding admin-branding">
          <div className="brand-logo">
            <span className="logo-icon">🔐</span>
            <h1 className="brand-name">Fintracker</h1>
            <span className="admin-badge">Admin</span>
          </div>
          <p className="brand-tagline">Administrator Access Portal</p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">👥</span>
              <span>User Management</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>System Analytics</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚙️</span>
              <span>System Settings</span>
            </div>
          </div>
        </div>

        <div className="auth-card admin-card">
          <div className="auth-header">
            <div className="admin-header-icon">
              <FiShield />
            </div>
            <h2>Admin Login</h2>
            <p>Secure administrator access to Fintracker</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <FiMail className="input-icon" />
                Admin Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FiLock className="input-icon" />
                Admin Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button admin-button" disabled={loading}>
              <FiLogIn className="button-icon" />
              {loading ? "Authenticating..." : "Sign In as Admin"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Regular user? <Link to="/login">User Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
