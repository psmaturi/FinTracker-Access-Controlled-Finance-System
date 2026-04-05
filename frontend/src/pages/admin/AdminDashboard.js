import { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import api from "../../services/api";
import "../user/UserPages.css";

function AdminDashboard() {
  const userStr = localStorage.getItem("user");
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  const { expenses, incomeSources, goals, investments, groups, groupExpenses } = useAppContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError("Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Calculate real stats from context data
  const stats = useMemo(() => {
    const totalTransactions = expenses.length + incomeSources.length + groupExpenses.length;
    const totalIncome = incomeSources.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalGroupExpenses = groupExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRevenue = totalIncome;

    const totalUsers = users.length;
    const activeUsers = users.filter((u) =>
      ["viewer", "analyst", "admin", "user"].includes(u.role)
    ).length;

    return {
      totalTransactions,
      totalRevenue,
      totalExpenses: totalExpenses + totalGroupExpenses,
      totalUsers,
      activeUsers
    };
  }, [expenses, incomeSources, groupExpenses, users]);

  // Recent transactions from real data
  const recentTransactions = useMemo(() => {
    const expenseTransactions = expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3)
      .map(exp => ({
        id: exp.id,
        type: "Expense",
        amount: exp.amount,
        date: exp.date,
        category: exp.category
      }));

    const incomeTransactions = incomeSources
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2)
      .map(inc => ({
        id: inc.id,
        type: "Income",
        amount: inc.amount,
        date: inc.date,
        category: inc.sourceName
      }));

    return [...expenseTransactions, ...incomeTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);
  }, [expenses, incomeSources]);

  // Recent users (last 4 registered)
  const recentUsers = useMemo(() => {
    return users
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [users]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.name || "Admin"}! System overview and management.</p>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">
              {loading ? "..." : stats.totalUsers.toLocaleString()}
            </p>
            <p className="stat-change">
              {loading ? "Loading..." : `${stats.totalUsers} registered user${stats.totalUsers !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">✅</div>
          </div>
          <div className="stat-content">
            <h3>Active Users</h3>
            <p className="stat-value">
              {loading ? "..." : stats.activeUsers.toLocaleString()}
            </p>
            <p className="stat-change">
              {loading ? "Loading..." : "All registered users"}
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">💰</div>
          </div>
          <div className="stat-content">
            <h3>Total Transactions</h3>
            <p className="stat-value">{stats.totalTransactions.toLocaleString()}</p>
            <p className="stat-change">From tracked data</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">📈</div>
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.totalRevenue.toLocaleString()}</p>
            <p className="stat-change">From income sources</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="section-card" style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
          <p style={{ color: "#dc2626", margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      <div className="section-card">
        <h2>Analytics Charts</h2>
        <p className="empty-state">
          Charts will appear here once sufficient data is available.
          <br />
          Currently tracking {stats.totalTransactions} transaction{stats.totalTransactions !== 1 ? 's' : ''} across the system.
        </p>
      </div>

      <div className="content-section">
        <div className="section-card">
          <h2>Recent Transactions</h2>
          {recentTransactions.length === 0 ? (
            <p className="empty-state">
              No recent transactions found. Transactions will appear here as users add income and expenses.
            </p>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td>{transaction.category}</td>
                      <td className={transaction.type === "Income" ? "positive" : "negative"}>
                        {transaction.type === "Income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                      </td>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="section-card">
          <h2>Recent User Registrations</h2>
          {loading ? (
            <p className="empty-state">Loading users...</p>
          ) : recentUsers.length === 0 ? (
            <p className="empty-state">
              No users found. Users will appear here once they register.
            </p>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user._id || user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role === "admin" ? "admin" : "user"}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
