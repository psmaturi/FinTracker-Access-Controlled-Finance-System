import { useState } from "react";
import "./UserPages.css";

function Profile() {
  const userStr = localStorage.getItem("user");
  let initialUser = null;

  try {
    initialUser = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    initialUser = null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    role: initialUser?.role || "user"
  });

  const handleSave = (e) => {
    e.preventDefault();
    // Update localStorage (frontend only)
    const updatedUser = { ...initialUser, ...user };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setUser({
      name: initialUser?.name || "",
      email: initialUser?.email || "",
      role: initialUser?.role || "user"
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="content-section">
        <div className="section-card">
          <div className="section-header">
            <h2>Personal Information</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-primary">
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={user.role}
                  disabled
                  className="disabled-input"
                />
                <p className="form-help">Role cannot be changed</p>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{user.name || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user.email || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Role:</span>
                <span className="info-value">{user.role || "user"}</span>
              </div>
            </div>
          )}
        </div>

        <div className="section-card">
          <h2>Account Settings</h2>
          <p className="empty-state">Additional account settings coming soon.</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
