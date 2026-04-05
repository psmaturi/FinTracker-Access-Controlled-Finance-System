import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import api from "../../services/api";
import "./Auth.css";

function Login() {
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

      // Save token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Redirect based on role
      if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-branding">
          <div className="brand-logo">
            <span className="logo-icon">💰</span>
            <h1 className="brand-name">Fintracker</h1>
          </div>
          <p className="brand-tagline">Your Personal Finance Management System</p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Track Expenses</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Set Goals</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Monitor Investments</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your Fintracker account</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                <FiMail className="input-icon" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <FiLock className="input-icon" />
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              <FiLogIn className="button-icon" />
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/register">Create one here</Link>
            </p>
            <p className="admin-link">
              Admin? <Link to="/admin/login">Admin Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
