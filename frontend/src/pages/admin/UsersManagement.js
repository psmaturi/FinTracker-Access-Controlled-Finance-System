import { useState, useEffect } from "react";
import api from "../../services/api";
import "../user/UserPages.css";

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/users");
        setUsers(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleStatus = (userId) => {
    // Frontend-only state update
    alert("User status toggle would be handled by backend API");
  };

  const handleChangeRole = (userId) => {
    // Frontend-only state update
    alert("User role change would be handled by backend API");
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    // Note: Status is not in the User model, so we'll treat all users as "active"
    const matchesStatus = filterStatus === "all" || filterStatus === "active";
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Users Management</h1>
        <p>Manage and monitor all system users</p>
      </div>

      {error && (
        <div className="section-card" style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
          <p style={{ color: "#dc2626", margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      <div className="content-section">
        <div className="section-card">
          <div className="section-header">
            <h2>Users List</h2>
            <div className="filters-container">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={loading || users.length === 0}
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
                disabled={loading || users.length === 0}
              >
                <option value="all">All Roles</option>
                <option value="viewer">Viewer</option>
                <option value="analyst">Analyst</option>
                <option value="user">User (legacy)</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
                disabled={loading || users.length === 0}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="empty-state-container">
              <p className="empty-state">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state-container">
              <p className="empty-state">
                No users found in the system.
                <br />
                <small>Users will appear here once they register.</small>
              </p>
            </div>
          ) : (
            <>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-table">No users found matching filters</td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id || user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role === "admin" ? "admin" : "user"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className="status-badge active">
                              active
                            </span>
                          </td>
                          <td>
                            {user.createdAt 
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => handleViewUser(user)} className="btn-icon" title="View">
                                👁️
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user._id || user.id)}
                                className="btn-icon disable"
                                title="Disable"
                              >
                                🚫
                              </button>
                              <button
                                onClick={() => handleChangeRole(user._id || user.id)}
                                className="btn-icon"
                                title="Change Role"
                              >
                                🔄
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-info">
                <p>Showing {filteredUsers.length} of {users.length} users</p>
              </div>
            </>
          )}
        </div>
      </div>

      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={() => setShowViewModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div className="user-detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedUser.name}</span>
              </div>
              <div className="user-detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="user-detail-row">
                <span className="detail-label">Role:</span>
                <span className={`role-badge ${selectedUser.role === "admin" ? "admin" : "user"}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="user-detail-row">
                <span className="detail-label">Status:</span>
                <span className="status-badge active">active</span>
              </div>
              <div className="user-detail-row">
                <span className="detail-label">Join Date:</span>
                <span className="detail-value">
                  {selectedUser.createdAt 
                    ? new Date(selectedUser.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagement;
