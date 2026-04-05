import { useState, useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import "../user/UserPages.css";

function TransactionsManagement() {
  const { expenses, incomeSources, groupExpenses } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  // Combine all transactions from context
  const allTransactions = useMemo(() => {
    const expenseTransactions = expenses.map(exp => ({
      id: exp.id,
      type: "Expense",
      category: exp.category,
      amount: exp.amount,
      date: exp.date,
      notes: exp.notes || "",
      source: "expense"
    }));

    const incomeTransactions = incomeSources.map(inc => ({
      id: inc.id,
      type: "Income",
      category: inc.sourceName,
      amount: inc.amount,
      date: inc.date,
      notes: "",
      source: "income"
    }));

    const groupExpenseTransactions = groupExpenses.map(exp => ({
      id: exp.id,
      type: "Group Expense",
      category: exp.description,
      amount: exp.amount,
      date: exp.date,
      notes: `Paid by ${exp.paidBy}`,
      source: "group"
    }));

    return [...expenseTransactions, ...incomeTransactions, ...groupExpenseTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, incomeSources, groupExpenses]);

  const handleDelete = (id) => {
    // Frontend-only: would call API in real implementation
    alert(`Transaction ${id} would be deleted (frontend-only action)`);
  };

  const handleFlag = (id) => {
    // Frontend-only: would call API in real implementation
    alert(`Transaction ${id} would be flagged for review (frontend-only action)`);
  };

  const filteredTransactions = allTransactions.filter(transaction => {
    const matchesSearch = transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || 
                       transaction.type.toLowerCase() === filterType.toLowerCase() ||
                       (filterType === "expense" && transaction.type === "Group Expense");
    const matchesDate = !filterDate || transaction.date === filterDate;
    return matchesSearch && matchesType && matchesDate;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === "Expense" || t.type === "Group Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const uniqueUsers = [...new Set(allTransactions.map(t => t.notes || "Unknown"))];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Transactions Management</h1>
        <p>Monitor and manage all system transactions</p>
      </div>

      <div className="summary-cards-row">
        <div className="summary-card">
          <h3>Total Transactions</h3>
          <p className="summary-amount">{filteredTransactions.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Income</h3>
          <p className="summary-amount positive">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p className="summary-amount negative">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Net Balance</h3>
          <p className={`summary-amount ${totalIncome - totalExpenses >= 0 ? "positive" : "negative"}`}>
            ${(totalIncome - totalExpenses).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="content-section">
        <div className="section-card">
          <div className="section-header">
            <h2>All Transactions</h2>
            <div className="filters-container">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="filter-select"
              />
            </div>
          </div>

          {allTransactions.length === 0 ? (
            <p className="empty-state">
              No transactions found in the system.
              <br />
              Transactions will appear here as users add income and expenses.
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
                    <th>Details</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="empty-table">No transactions found matching filters</td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr key={`${transaction.source}-${transaction.id}`}>
                        <td>
                          <span className={`type-badge ${transaction.type.toLowerCase().replace(' ', '-')}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td>{transaction.category}</td>
                        <td className={transaction.type === "Income" ? "positive" : "negative"}>
                          {transaction.type === "Income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                        </td>
                        <td>{new Date(transaction.date).toLocaleDateString()}</td>
                        <td>{transaction.notes || "-"}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleFlag(transaction.id)}
                              className="btn-icon"
                              title="Flag for Review"
                            >
                              🚩
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="btn-icon delete"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsManagement;
