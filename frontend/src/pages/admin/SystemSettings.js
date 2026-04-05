import { useState } from "react";
import "../user/UserPages.css";

function SystemSettings() {
  const userStr = localStorage.getItem("user");
  let initialUser = null;

  try {
    initialUser = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    initialUser = null;
  }

  const [adminProfile, setAdminProfile] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    sessionTimeout: "30"
  });

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Frontend-only: would call API in real implementation
    const updatedUser = { ...initialUser, ...adminProfile };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile updated successfully! (frontend-only)");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    // Frontend-only: would call API in real implementation
    alert("Password changed successfully! (frontend-only)");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleSystemSettingChange = (key, value) => {
    setSystemSettings({
      ...systemSettings,
      [key]: value
    });
    alert(`Setting ${key} updated (frontend-only)`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>System Settings</h1>
        <p>Manage system configuration and admin preferences</p>
      </div>

      <div className="content-section">
        <div className="section-card">
          <h2>Admin Profile</h2>
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="admin-name">Name</label>
              <input
                type="text"
                id="admin-name"
                value={adminProfile.name}
                onChange={(e) => setAdminProfile({ ...adminProfile, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                type="email"
                id="admin-email"
                value={adminProfile.email}
                onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Update Profile</button>
          </form>
        </div>

        <div className="section-card">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange} className="profile-form">
            <div className="form-group">
              <label htmlFor="current-password">Current Password</label>
              <input
                type="password"
                id="current-password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">New Password</label>
              <input
                type="password"
                id="new-password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>
              <input
                type="password"
                id="confirm-password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength="6"
              />
            </div>
            <button type="submit" className="btn-primary">Change Password</button>
          </form>
        </div>

        <div className="section-card">
          <h2>System Preferences</h2>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <h4>Maintenance Mode</h4>
                <p>Enable maintenance mode to restrict user access</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => handleSystemSettingChange("maintenanceMode", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive email notifications for system events</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={systemSettings.emailNotifications}
                  onChange={(e) => handleSystemSettingChange("emailNotifications", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Auto Backup</h4>
                <p>Automatically backup database daily</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={systemSettings.autoBackup}
                  onChange={(e) => handleSystemSettingChange("autoBackup", e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h4>Session Timeout (minutes)</h4>
                <p>Automatic logout after inactivity</p>
              </div>
              <select
                value={systemSettings.sessionTimeout}
                onChange={(e) => handleSystemSettingChange("sessionTimeout", e.target.value)}
                className="setting-select"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h2>System Information</h2>
          <div className="system-info">
            <div className="info-row">
              <span className="info-label">Application Version:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Database Status:</span>
              <span className="info-value" style={{ color: "var(--text-secondary)" }}>
                Status not available
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Server Status:</span>
              <span className="info-value" style={{ color: "var(--text-secondary)" }}>
                Status not available
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Backup:</span>
              <span className="info-value" style={{ color: "var(--text-secondary)" }}>
                Backup information not available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings;
