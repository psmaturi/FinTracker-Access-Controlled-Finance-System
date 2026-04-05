import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import "./UserPages.css";

function Group() {
  const {
    groups,
    groupExpenses,
    addGroup,
    updateGroup,
    addGroupExpense,
    updateGroupExpense,
    deleteGroupExpense
  } = useAppContext();

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [error, setError] = useState("");

  const [groupForm, setGroupForm] = useState({ name: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    groupId: "",
    description: "",
    amount: "",
    date: "",
    paidBy: "",
    splitBetween: []
  });

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (groupForm.name) {
      const newGroup = {
        id: Date.now(),
        name: groupForm.name,
        members: []
      };
      addGroup(newGroup);
      setGroupForm({ name: "" });
      setShowGroupForm(false);
    }
  };

  const handleAddMember = (groupId) => {
    if (memberEmail && memberEmail.trim()) {
      const group = groups.find(g => g.id === groupId);
      if (group) {
        updateGroup(groupId, {
          ...group,
          members: [...group.members, memberEmail.trim()]
        });
      }
      setMemberEmail("");
    }
  };

  const handleSplitChange = (member, checked) => {
    if (checked) {
      setExpenseForm({
        ...expenseForm,
        splitBetween: [...expenseForm.splitBetween, member]
      });
    } else {
      setExpenseForm({
        ...expenseForm,
        splitBetween: expenseForm.splitBetween.filter(m => m !== member)
      });
    }
  };

  const handleGroupChange = (groupId) => {
    const group = groups.find(g => g.id === parseInt(groupId));
    if (group && group.members.length > 0) {
      setExpenseForm({
        ...expenseForm,
        groupId: groupId,
        splitBetween: group.members, // Auto-select all members
        paidBy: group.members[0] // Set first member as default payer
      });
    } else {
      setExpenseForm({
        ...expenseForm,
        groupId: groupId,
        splitBetween: [],
        paidBy: ""
      });
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    setError("");
    
    if (!expenseForm.groupId || !expenseForm.description || !expenseForm.amount || !expenseForm.date || !expenseForm.paidBy) {
      setError("Please fill in all required fields");
      return;
    }

    if (expenseForm.splitBetween.length === 0) {
      setError("Please select at least one member to split the expense with");
      return;
    }

    const newExpense = {
      id: editingExpense ? editingExpense.id : Date.now(),
      groupId: parseInt(expenseForm.groupId),
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      paidBy: expenseForm.paidBy,
      date: expenseForm.date,
      splitBetween: expenseForm.splitBetween
    };

    if (editingExpense) {
      updateGroupExpense(editingExpense.id, newExpense);
      setEditingExpense(null);
    } else {
      addGroupExpense(newExpense);
    }

    setExpenseForm({ groupId: "", description: "", amount: "", date: "", paidBy: "", splitBetween: [] });
    setShowExpenseForm(false);
  };

  const handleDeleteExpense = (id) => {
    deleteGroupExpense(id);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      groupId: expense.groupId.toString(),
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      paidBy: expense.paidBy,
      splitBetween: expense.splitBetween
    });
    setShowExpenseForm(true);
  };

  const calculateBalance = (group) => {
    const expensesForGroup = groupExpenses.filter(exp => exp.groupId === group.id);
    const balance = {};

    group.members.forEach(member => {
      balance[member] = 0;
    });

    expensesForGroup.forEach(expense => {
      const splitAmount = expense.amount / expense.splitBetween.length;
      expense.splitBetween.forEach(member => {
        balance[member] -= splitAmount;
      });
      balance[expense.paidBy] += expense.amount;
    });

    return balance;
  };

  const getSplitAmount = (expense) => {
    if (expense.splitBetween.length === 0) return 0;
    return expense.amount / expense.splitBetween.length;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Group / Family Finance</h1>
        <p>Manage shared finances with your family or group</p>
      </div>

      <div className="content-section">
        <div className="section-card">
          <div className="section-header">
            <h2>Create Group</h2>
            <button onClick={() => setShowGroupForm(!showGroupForm)} className="btn-primary">
              {showGroupForm ? "Cancel" : "+ Create Group"}
            </button>
          </div>

          {showGroupForm && (
            <form onSubmit={handleCreateGroup} className="form-inline">
              <input
                type="text"
                placeholder="Group name"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">Create</button>
            </form>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="section-card">
            <h2>Your Groups</h2>
            <p className="empty-state">No groups created yet. Create your first group to start managing shared finances!</p>
          </div>
        ) : (
          groups.map((group) => {
            const balance = calculateBalance(group);
            return (
              <div key={group.id} className="section-card">
                <div className="section-header">
                  <h2>{group.name}</h2>
                </div>

                <div className="group-members-section">
                  <h3>Members</h3>
                  <div className="form-inline">
                    <input
                      type="email"
                      placeholder="Add member email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddMember(group.id);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddMember(group.id)}
                      className="btn-primary"
                    >
                      Add Member
                    </button>
                  </div>
                  <div className="members-list">
                    {group.members.length === 0 ? (
                      <p className="empty-state" style={{ padding: "12px", margin: "12px 0" }}>No members added yet. Add members to your group.</p>
                    ) : (
                      group.members.map((member, index) => (
                        <span key={index} className="member-tag">{member}</span>
                      ))
                    )}
                  </div>
                </div>

                {group.members.length > 0 && (
                  <div className="group-balance-section">
                    <h3>Balance Summary</h3>
                    <div className="balance-list">
                      {Object.entries(balance).map(([member, amount]) => (
                        <div key={member} className="balance-item">
                          <span className="balance-member">{member}</span>
                          <span className={`balance-amount ${amount >= 0 ? 'positive' : 'negative'}`}>
                            {amount >= 0 ? '+' : ''}${amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="section-card">
          <div className="section-header">
            <h2>Shared Expenses</h2>
            <button onClick={() => {
              setEditingExpense(null);
              setExpenseForm({ groupId: "", description: "", amount: "", date: "", paidBy: "", splitBetween: [] });
              setError("");
              setShowExpenseForm(!showExpenseForm);
            }} className="btn-primary">
              {showExpenseForm ? "Cancel" : "+ Add Expense"}
            </button>
          </div>

          {showExpenseForm && (
            <form onSubmit={handleAddExpense} className="expense-form-full">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label>Select Group *</label>
                <select
                  value={expenseForm.groupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  required
                >
                  <option value="">Select Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              {expenseForm.groupId && (
                <>
                  <div className="form-group">
                    <label>Split Between *</label>
                    <div className="split-members-checkbox">
                      {groups.find(g => g.id === parseInt(expenseForm.groupId))?.members.map(member => (
                        <label key={member} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={expenseForm.splitBetween.includes(member)}
                            onChange={(e) => handleSplitChange(member, e.target.checked)}
                          />
                          <span>{member}</span>
                        </label>
                      ))}
                    </div>
                    {expenseForm.splitBetween.length > 0 && expenseForm.amount && (
                      <p className="split-info">
                        Each member will pay: <strong>${(parseFloat(expenseForm.amount) / expenseForm.splitBetween.length).toFixed(2)}</strong>
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Paid By *</label>
                    <select
                      value={expenseForm.paidBy}
                      onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                      required
                    >
                      <option value="">Select Member</option>
                      {groups.find(g => g.id === parseInt(expenseForm.groupId))?.members.map(member => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  placeholder="Expense description"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  placeholder="Total amount"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-primary">
                {editingExpense ? "Update Expense" : "Add Expense"}
              </button>
            </form>
          )}

          <div className="expenses-list">
            {groupExpenses.length === 0 ? (
              <p className="empty-state">No shared expenses recorded. Add expenses to your groups to see them here.</p>
            ) : (
              groupExpenses.map((expense) => {
                const group = groups.find(g => g.id === expense.groupId);
                const splitAmount = getSplitAmount(expense);
                return (
                  <div key={expense.id} className="expense-item">
                    <div className="expense-info">
                      <h4>{expense.description}</h4>
                      <p className="expense-meta">
                        {group?.name} • Paid by {expense.paidBy} • {new Date(expense.date).toLocaleDateString()}
                      </p>
                      <p className="expense-split">
                        Split between {expense.splitBetween.length} member(s): {expense.splitBetween.join(", ")}
                      </p>
                      <p className="expense-split-amount">
                        <strong>${splitAmount.toFixed(2)} per person</strong> (Total: ${expense.amount.toFixed(2)})
                      </p>
                    </div>
                    <div className="expense-actions">
                      <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                      <button onClick={() => handleEditExpense(expense)} className="btn-icon">✏️</button>
                      <button onClick={() => handleDeleteExpense(expense.id)} className="btn-icon delete">🗑️</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Group;
