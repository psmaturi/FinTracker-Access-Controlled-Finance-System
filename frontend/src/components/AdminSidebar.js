import { NavLink, useNavigate } from "react-router-dom";
import { 
  FiLayout, 
  FiUsers, 
  FiDollarSign, 
  FiBarChart2, 
  FiSettings,
  FiLogOut
} from "react-icons/fi";
import "./Sidebar.css";

function AdminSidebar() {
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
    navigate("/admin/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>🔐 Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className="nav-link">
          <FiLayout className="nav-icon" />
          <span>Admin Dashboard</span>
        </NavLink>
        <NavLink to="/admin/users" className="nav-link">
          <FiUsers className="nav-icon" />
          <span>Users Management</span>
        </NavLink>
        <NavLink to="/admin/transactions" className="nav-link">
          <FiDollarSign className="nav-icon" />
          <span>Transactions Management</span>
        </NavLink>
        <NavLink to="/admin/reports" className="nav-link">
          <FiBarChart2 className="nav-icon" />
          <span>Reports & Analytics</span>
        </NavLink>
        <NavLink to="/admin/settings" className="nav-link">
          <FiSettings className="nav-icon" />
          <span>System Settings</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <p className="user-name">{user?.name || "Admin"}</p>
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

export default AdminSidebar;

