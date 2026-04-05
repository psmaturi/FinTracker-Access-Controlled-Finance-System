import { NavLink, useNavigate } from "react-router-dom";
import { 
  FiLayout, 
  FiDollarSign, 
  FiTarget, 
  FiTrendingUp, 
  FiUsers, 
  FiUser,
  FiLogOut
} from "react-icons/fi";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>💰 Fintracker</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-link">
          <FiLayout className="nav-icon" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/budget" className="nav-link">
          <FiDollarSign className="nav-icon" />
          <span>Budget & Expenses</span>
        </NavLink>
        <NavLink to="/goals" className="nav-link">
          <FiTarget className="nav-icon" />
          <span>Goals</span>
        </NavLink>
        <NavLink to="/investments" className="nav-link">
          <FiTrendingUp className="nav-icon" />
          <span>Investments</span>
        </NavLink>
        <NavLink to="/group" className="nav-link">
          <FiUsers className="nav-icon" />
          <span>Group / Family Finance</span>
        </NavLink>
        <NavLink to="/profile" className="nav-link">
          <FiUser className="nav-icon" />
          <span>Profile</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <p className="user-name">{user?.name || "User"}</p>
          <p className="user-email">{user?.email || ""}</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut className="logout-icon" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
