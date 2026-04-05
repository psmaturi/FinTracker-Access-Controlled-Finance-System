import { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAppContext } from "../../context/AppContext";
import "./UserPages.css";

function Dashboard() {
  const userStr = localStorage.getItem("user");
  let user = null;

  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  const { expenses, goals, incomeSources, savingsEntries } = useAppContext();

  // Calculate dashboard data from context
  const dashboardData = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = incomeSources.reduce((sum, inc) => sum + inc.amount, 0);
    const totalSavings = savingsEntries.reduce((sum, sav) => sum + sav.amount, 0);
    const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount).length;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      activeGoals
    };
  }, [expenses, goals, incomeSources, savingsEntries]);

  // Prepare chart data from expenses and income
  const chartData = useMemo(() => {
    if (expenses.length === 0 && incomeSources.length === 0) {
      return { monthlyExpenses: [], incomeExpenseData: [] };
    }

    // Group expenses by month
    const expenseMonthlyMap = {};
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!expenseMonthlyMap[monthKey]) {
        expenseMonthlyMap[monthKey] = 0;
      }
      expenseMonthlyMap[monthKey] += exp.amount;
    });

    // Group income by month
    const incomeMonthlyMap = {};
    incomeSources.forEach(inc => {
      const date = new Date(inc.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!incomeMonthlyMap[monthKey]) {
        incomeMonthlyMap[monthKey] = 0;
      }
      incomeMonthlyMap[monthKey] += inc.amount;
    });

    // Get all unique months
    const allMonths = new Set([
      ...Object.keys(expenseMonthlyMap),
      ...Object.keys(incomeMonthlyMap)
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyExpenses = Array.from(allMonths)
      .sort()
      .slice(-6) // Last 6 months
      .map(key => {
        const date = new Date(key);
        return {
          month: months[date.getMonth()],
          amount: Math.round(expenseMonthlyMap[key] || 0)
        };
      });

    const incomeExpenseData = Array.from(allMonths)
      .sort()
      .slice(-6) // Last 6 months
      .map(key => {
        const date = new Date(key);
        return {
          month: months[date.getMonth()],
          income: Math.round(incomeMonthlyMap[key] || 0),
          expense: Math.round(expenseMonthlyMap[key] || 0)
        };
      });

    return { monthlyExpenses, incomeExpenseData };
  }, [expenses, incomeSources]);

  // Recent transactions from expenses and income
  const transactions = useMemo(() => {
    const expenseTransactions = expenses.map(exp => ({
      id: exp.id,
      description: exp.notes || exp.category,
      amount: -exp.amount, // Negative for expenses
      date: exp.date,
      category: exp.category,
      type: 'expense'
    }));

    const incomeTransactions = incomeSources.map(inc => ({
      id: inc.id,
      description: inc.sourceName,
      amount: inc.amount, // Positive for income
      date: inc.date,
      category: 'Income',
      type: 'income'
    }));

    return [...expenseTransactions, ...incomeTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expenses, incomeSources]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome, {user?.name || "User"}! {(expenses.length > 0 || goals.length > 0 || incomeSources.length > 0 || savingsEntries.length > 0) ? "Here's your financial overview." : "Start tracking your finances to see your overview here."}</p>
      </div>

      <div className="cards-grid">
        <div className="stat-card income">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">💰</div>
          </div>
          <div className="stat-content">
            <h3>Total Income</h3>
            <p className="stat-value">${dashboardData.totalIncome.toLocaleString()}</p>
            <p className="stat-change">
              {dashboardData.totalIncome > 0 
                ? `${incomeSources.length} source${incomeSources.length !== 1 ? 's' : ''}` 
                : "Start adding income to track"}
            </p>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">💸</div>
          </div>
          <div className="stat-content">
            <h3>Total Expenses</h3>
            <p className="stat-value">${dashboardData.totalExpenses.toLocaleString()}</p>
            <p className="stat-change">{expenses.length > 0 ? `${expenses.length} transactions` : "Add expenses to see totals"}</p>
          </div>
        </div>

        <div className="stat-card savings">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">💵</div>
          </div>
          <div className="stat-content">
            <h3>Total Savings</h3>
            <p className="stat-value">${dashboardData.totalSavings.toLocaleString()}</p>
            <p className="stat-change">
              {savingsEntries.length > 0 
                ? `${savingsEntries.length} entr${savingsEntries.length !== 1 ? 'ies' : 'y'}` 
                : "Add savings to track"}
            </p>
          </div>
        </div>

        <div className="stat-card goals">
          <div className="stat-icon-wrapper">
            <div className="stat-icon">🎯</div>
          </div>
          <div className="stat-content">
            <h3>Active Goals</h3>
            <p className="stat-value">{dashboardData.activeGoals}</p>
            <p className="stat-change">{dashboardData.activeGoals > 0 ? "In progress" : "Create your first goal"}</p>
          </div>
        </div>
      </div>

      {chartData.monthlyExpenses.length > 0 || chartData.incomeExpenseData.length > 0 ? (
        <div className="charts-grid">
          {chartData.monthlyExpenses.length > 0 && (
            <div className="section-card">
              <h2>Monthly Expenses</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#818cf8" strokeWidth={2} name="Expenses ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartData.incomeExpenseData.length > 0 && (
            <div className="section-card">
              <h2>Income vs Expenses</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.incomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income ($)" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expenses ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      ) : (
        <div className="section-card">
          <h2>Financial Overview</h2>
          <p className="empty-state">
            Start adding your income and expenses to see charts and analytics here.
            <br />
            Visit the <strong>Budget & Expenses</strong> page to get started!
          </p>
        </div>
      )}

      <div className="content-section">
        <div className="section-card">
          <h2>Recent Transactions</h2>
          <div className="transactions-list">
            {transactions.length === 0 ? (
              <p className="empty-state">
                No recent transactions. Add income and expenses in the <strong>Budget & Expenses</strong> page to see them here.
              </p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <h4>{transaction.description}</h4>
                    <p className="transaction-meta">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
