import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import "./UserPages.css";

function Budget() {
  const {
    budgetCategories,
    expenses,
    incomeSources,
    savingsEntries,
    addBudgetCategory,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    addSavings,
    updateSavings,
    deleteSavings
  } = useAppContext();

  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingIncome, setEditingIncome] = useState(null);
  const [editingSavings, setEditingSavings] = useState(null);

  const [budgetForm, setBudgetForm] = useState({ name: "", amount: "" });
  const [expenseForm, setExpenseForm] = useState({ category: "", amount: "", date: "", notes: "" });
  const [incomeForm, setIncomeForm] = useState({ sourceName: "", amount: "", date: "" });
  const [savingsForm, setSavingsForm] = useState({ amount: "", date: "", note: "" });

  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalIncome = incomeSources.reduce((sum, inc) => sum + inc.amount, 0);
  const totalSavings = savingsEntries.reduce((sum, sav) => sum + sav.amount, 0);
  const remaining = totalBudget - totalSpent;

  const handleAddBudget = (e) => {
    e.preventDefault();
    if (budgetForm.name && budgetForm.amount) {
      const newCategory = {
        id: Date.now(),
        name: budgetForm.name,
        budget: parseFloat(budgetForm.amount),
        spent: 0
      };
      addBudgetCategory(newCategory);
      setBudgetForm({ name: "", amount: "" });
      setShowBudgetForm(false);
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (expenseForm.category && expenseForm.amount && expenseForm.date) {
      const newExpense = {
        id: editingExpense ? editingExpense.id : Date.now(),
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        date: expenseForm.date,
        notes: expenseForm.notes || ""
      };

      if (editingExpense) {
        updateExpense(editingExpense.id, newExpense);
        setEditingExpense(null);
      } else {
        addExpense(newExpense);
      }

      setExpenseForm({ category: "", amount: "", date: "", notes: "" });
      setShowExpenseForm(false);
    }
  };

  const handleDeleteExpense = (id) => {
    deleteExpense(id);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      notes: expense.notes
    });
    setShowExpenseForm(true);
  };

  const handleAddIncome = (e) => {
    e.preventDefault();
    if (incomeForm.sourceName && incomeForm.amount && incomeForm.date) {
      const newIncome = {
        id: editingIncome ? editingIncome.id : Date.now(),
        sourceName: incomeForm.sourceName,
        amount: parseFloat(incomeForm.amount),
        date: incomeForm.date
      };

      if (editingIncome) {
        updateIncome(editingIncome.id, newIncome);
        setEditingIncome(null);
      } else {
        addIncome(newIncome);
      }

      setIncomeForm({ sourceName: "", amount: "", date: "" });
      setShowIncomeForm(false);
    }
  };

  const handleDeleteIncome = (id) => {
    deleteIncome(id);
  };

  const handleEditIncome = (income) => {
    setEditingIncome(income);
    setIncomeForm({
      sourceName: income.sourceName,
      amount: income.amount.toString(),
      date: income.date
    });
    setShowIncomeForm(true);
  };

  const handleAddSavings = (e) => {
    e.preventDefault();
    if (savingsForm.amount && savingsForm.date) {
      const newSavings = {
        id: editingSavings ? editingSavings.id : Date.now(),
        amount: parseFloat(savingsForm.amount),
        date: savingsForm.date,
        note: savingsForm.note || ""
      };

      if (editingSavings) {
        updateSavings(editingSavings.id, newSavings);
        setEditingSavings(null);
      } else {
        addSavings(newSavings);
      }

      setSavingsForm({ amount: "", date: "", note: "" });
      setShowSavingsForm(false);
    }
  };

  const handleDeleteSavings = (id) => {
    deleteSavings(id);
  };

  const handleEditSavings = (savings) => {
    setEditingSavings(savings);
    setSavingsForm({
      amount: savings.amount.toString(),
      date: savings.date,
      note: savings.note || ""
    });
    setShowSavingsForm(true);
  };

  const cancelEdit = () => {
    setEditingExpense(null);
    setExpenseForm({ category: "", amount: "", date: "", notes: "" });
    setShowExpenseForm(false);
  };

  const cancelIncomeEdit = () => {
    setEditingIncome(null);
    setIncomeForm({ sourceName: "", amount: "", date: "" });
    setShowIncomeForm(false);
  };

  const cancelSavingsEdit = () => {
    setEditingSavings(null);
    setSavingsForm({ amount: "", date: "", note: "" });
    setShowSavingsForm(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Budget & Expenses</h1>
        <p>Track and manage your monthly budget, income, expenses, and savings</p>
      </div>

      <div className="budget-summary-cards">
        <div className="summary-card">
          <h3>Total Income</h3>
          <p className="summary-amount positive">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Budget</h3>
          <p className="summary-amount">${totalBudget.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Spent</h3>
          <p className="summary-amount spent">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Remaining Budget</h3>
          <p className={`summary-amount ${remaining >= 0 ? 'positive' : 'negative'}`}>
            ${remaining.toLocaleString()}
          </p>
        </div>
        <div className="summary-card">
          <h3>Total Savings</h3>
          <p className="summary-amount positive">${totalSavings.toLocaleString()}</p>
        </div>
      </div>

      <div className="content-section">
        <div className="section-card">
          <div className="section-header">
            <h2>Income Sources</h2>
            <button onClick={() => {
              cancelIncomeEdit();
              setShowIncomeForm(!showIncomeForm);
            }} className="btn-primary">
              {showIncomeForm ? "Cancel" : "+ Add Income"}
            </button>
          </div>

          {showIncomeForm && (
            <form onSubmit={handleAddIncome} className="form-grid">
              <input
                type="text"
                placeholder="Income source (e.g., Salary, Freelance, Business)"
                value={incomeForm.sourceName}
                onChange={(e) => setIncomeForm({ ...incomeForm, sourceName: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={incomeForm.amount}
                onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                step="0.01"
                min="0.01"
                required
              />
              <input
                type="date"
                value={incomeForm.date}
                onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">
                {editingIncome ? "Update Income" : "Add Income"}
              </button>
            </form>
          )}

          <div className="expenses-list">
            {incomeSources.length === 0 ? (
              <p className="empty-state">No income sources recorded yet. Add your first income to start tracking!</p>
            ) : (
              incomeSources.map((income) => (
                <div key={income.id} className="expense-item">
                  <div className="expense-info">
                    <h4>{income.sourceName}</h4>
                    <p className="expense-meta">
                      {new Date(income.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="expense-actions">
                    <span className="expense-amount positive">+${income.amount.toFixed(2)}</span>
                    <button onClick={() => handleEditIncome(income)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDeleteIncome(income.id)} className="btn-icon delete">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2>Savings</h2>
            <button onClick={() => {
              cancelSavingsEdit();
              setShowSavingsForm(!showSavingsForm);
            }} className="btn-primary">
              {showSavingsForm ? "Cancel" : "+ Add Savings"}
            </button>
          </div>

          {showSavingsForm && (
            <form onSubmit={handleAddSavings} className="form-grid">
              <input
                type="number"
                placeholder="Savings amount"
                value={savingsForm.amount}
                onChange={(e) => setSavingsForm({ ...savingsForm, amount: e.target.value })}
                step="0.01"
                min="0.01"
                required
              />
              <input
                type="date"
                value={savingsForm.date}
                onChange={(e) => setSavingsForm({ ...savingsForm, date: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Note (optional)"
                value={savingsForm.note}
                onChange={(e) => setSavingsForm({ ...savingsForm, note: e.target.value })}
              />
              <button type="submit" className="btn-primary">
                {editingSavings ? "Update Savings" : "Add Savings"}
              </button>
            </form>
          )}

          <div className="expenses-list">
            {savingsEntries.length === 0 ? (
              <p className="empty-state">No savings recorded yet. Add your first savings entry to start tracking!</p>
            ) : (
              savingsEntries.map((savings) => (
                <div key={savings.id} className="expense-item">
                  <div className="expense-info">
                    <h4>Savings Entry</h4>
                    <p className="expense-meta">
                      {new Date(savings.date).toLocaleDateString()} • {savings.note || "No note"}
                    </p>
                  </div>
                  <div className="expense-actions">
                    <span className="expense-amount positive">${savings.amount.toFixed(2)}</span>
                    <button onClick={() => handleEditSavings(savings)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDeleteSavings(savings.id)} className="btn-icon delete">🗑️</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2>Budget Categories</h2>
            <button onClick={() => setShowBudgetForm(!showBudgetForm)} className="btn-primary">
              {showBudgetForm ? "Cancel" : "+ Add Category"}
            </button>
          </div>

          {showBudgetForm && (
            <form onSubmit={handleAddBudget} className="form-inline">
              <input
                type="text"
                placeholder="Category name"
                value={budgetForm.name}
                onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Budget amount"
                value={budgetForm.amount}
                onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
                step="0.01"
                required
              />
              <button type="submit" className="btn-primary">Add</button>
            </form>
          )}

          <div className="budget-categories-list">
            {budgetCategories.length === 0 ? (
              <p className="empty-state">No budget categories set up yet. Create your first category to get started!</p>
            ) : (
              budgetCategories.map((category) => {
                const percentage = (category.spent / category.budget) * 100;
                return (
                  <div key={category.id} className="budget-category-item">
                    <div className="category-header">
                      <h4>{category.name}</h4>
                      <span className="category-amount">
                        ${category.spent.toFixed(2)} / ${category.budget.toFixed(2)}
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className={`progress-bar ${percentage > 100 ? 'over-budget' : ''}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <p className="category-remaining">
                      {percentage > 100
                        ? `Over budget by $${(category.spent - category.budget).toFixed(2)}`
                        : `$${(category.budget - category.spent).toFixed(2)} remaining`}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h2>Expenses</h2>
            <button onClick={() => {
              cancelEdit();
              setShowExpenseForm(!showExpenseForm);
            }} className="btn-primary">
              {showExpenseForm ? "Cancel" : "+ Add Expense"}
            </button>
          </div>

          {showExpenseForm && (
            <form onSubmit={handleAddExpense} className="form-grid">
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {budgetCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                step="0.01"
                required
              />
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
              />
              <button type="submit" className="btn-primary">
                {editingExpense ? "Update Expense" : "Add Expense"}
              </button>
            </form>
          )}

          <div className="expenses-list">
            {expenses.length === 0 ? (
              <p className="empty-state">No expenses recorded yet. Add your first expense to start tracking!</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-info">
                    <h4>{expense.category}</h4>
                    <p className="expense-meta">
                      {new Date(expense.date).toLocaleDateString()} • {expense.notes || "No notes"}
                    </p>
                  </div>
                  <div className="expense-actions">
                    <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                    <button onClick={() => handleEditExpense(expense)} className="btn-icon">✏️</button>
                    <button onClick={() => handleDeleteExpense(expense.id)} className="btn-icon delete">🗑️</button>
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

export default Budget;
