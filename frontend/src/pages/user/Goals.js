import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import "./UserPages.css";

function Goals() {
  const {
    goals,
    addGoal,
    updateGoal,
    deleteGoal
  } = useAppContext();

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [addAmountForm, setAddAmountForm] = useState({ goalId: "", amount: "" });
  const [error, setError] = useState("");

  const [goalForm, setGoalForm] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: ""
  });

  const handleAddGoal = (e) => {
    e.preventDefault();
    setError("");
    
    if (!goalForm.name || !goalForm.targetAmount || !goalForm.targetDate) {
      setError("Please fill in all required fields");
      return;
    }

    const targetAmount = parseFloat(goalForm.targetAmount);
    const currentAmount = parseFloat(goalForm.currentAmount || 0);

    if (currentAmount > targetAmount) {
      setError("Current amount cannot exceed target amount");
      return;
    }

    if (targetAmount <= 0) {
      setError("Target amount must be greater than 0");
      return;
    }

    const newGoal = {
      id: editingGoal ? editingGoal.id : Date.now(),
      name: goalForm.name,
      targetAmount: targetAmount,
      currentAmount: editingGoal ? editingGoal.currentAmount : currentAmount,
      targetDate: goalForm.targetDate
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, newGoal);
      setEditingGoal(null);
    } else {
      addGoal(newGoal);
    }

    setGoalForm({ name: "", targetAmount: "", currentAmount: "", targetDate: "" });
    setShowForm(false);
  };

  const handleDeleteGoal = (id) => {
    deleteGoal(id);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate
    });
    setError("");
    setShowForm(true);
  };

  const handleAddAmount = (e) => {
    e.preventDefault();
    setError("");

    if (!addAmountForm.goalId || !addAmountForm.amount) {
      setError("Please select a goal and enter an amount");
      return;
    }

    const goal = goals.find(g => g.id === parseInt(addAmountForm.goalId));
    if (!goal) {
      setError("Goal not found");
      return;
    }

    const amountToAdd = parseFloat(addAmountForm.amount);
    
    if (amountToAdd <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const remainingAmount = goal.targetAmount - goal.currentAmount;
    
    if (amountToAdd > remainingAmount) {
      setError(`Amount exceeds remaining target. Maximum you can add is $${remainingAmount.toFixed(2)}`);
      return;
    }

    updateGoal(parseInt(addAmountForm.goalId), {
      ...goal,
      currentAmount: Math.min(goal.currentAmount + amountToAdd, goal.targetAmount)
    });
    
    setAddAmountForm({ goalId: "", amount: "" });
  };

  const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount);

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRemainingAmount = (goal) => {
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Financial Goals</h1>
        <p>Set and track your financial objectives</p>
      </div>

      <div className="content-section">
        <div className="section-card">
          <div className="section-header">
            <h2>Add New Goal</h2>
            <button onClick={() => {
              setEditingGoal(null);
              setGoalForm({ name: "", targetAmount: "", currentAmount: "", targetDate: "" });
              setError("");
              setShowForm(!showForm);
            }} className="btn-primary">
              {showForm ? "Cancel" : "+ Add Goal"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddGoal} className="form-grid">
              {error && <div className="error-message">{error}</div>}
              
              <input
                type="text"
                placeholder="Goal name"
                value={goalForm.name}
                onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Target amount"
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                step="0.01"
                min="0.01"
                required
              />
              <input
                type="number"
                placeholder="Current amount (optional)"
                value={goalForm.currentAmount}
                onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                step="0.01"
                min="0"
              />
              <input
                type="date"
                placeholder="Target date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                required
              />
              <button type="submit" className="btn-primary">
                {editingGoal ? "Update Goal" : "Create Goal"}
              </button>
            </form>
          )}
        </div>

        {activeGoals.length > 0 && (
          <div className="section-card">
            <h2>Add Amount to Goal</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleAddAmount} className="form-inline">
              <select
                value={addAmountForm.goalId}
                onChange={(e) => {
                  setAddAmountForm({ ...addAmountForm, goalId: e.target.value, amount: "" });
                  setError("");
                }}
                required
              >
                <option value="">Select Goal</option>
                {activeGoals.map(goal => {
                  const remaining = getRemainingAmount(goal);
                  return (
                    <option key={goal.id} value={goal.id}>
                      {goal.name} (Remaining: ${remaining.toFixed(2)})
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                placeholder="Amount to add"
                value={addAmountForm.amount}
                onChange={(e) => {
                  setAddAmountForm({ ...addAmountForm, amount: e.target.value });
                  setError("");
                }}
                step="0.01"
                min="0.01"
                max={addAmountForm.goalId ? getRemainingAmount(goals.find(g => g.id === parseInt(addAmountForm.goalId))) : ""}
                required
              />
              {addAmountForm.goalId && (
                <span className="remaining-amount-hint">
                  Max: ${getRemainingAmount(goals.find(g => g.id === parseInt(addAmountForm.goalId))).toFixed(2)}
                </span>
              )}
              <button type="submit" className="btn-primary">Add Amount</button>
            </form>
          </div>
        )}

        <div className="section-card">
          <h2>Active Goals</h2>
          {activeGoals.length === 0 ? (
            <p className="empty-state">No active goals. Create your first goal to get started!</p>
          ) : (
            <div className="goals-list">
              {activeGoals.map((goal) => {
                const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
                const daysRemaining = getDaysRemaining(goal.targetDate);
                const remaining = getRemainingAmount(goal);
                return (
                  <div key={goal.id} className="goal-item">
                    <div className="goal-header">
                      <h4>{goal.name}</h4>
                      <div className="goal-actions">
                        <button onClick={() => handleEditGoal(goal)} className="btn-icon">✏️</button>
                        <button onClick={() => handleDeleteGoal(goal.id)} className="btn-icon delete">🗑️</button>
                      </div>
                    </div>
                    <div className="goal-progress-info">
                      <span className="goal-amount">
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                      </span>
                      <span className="goal-percentage">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="goal-meta">
                      Remaining: <strong>${remaining.toLocaleString()}</strong> • 
                      Target: {new Date(goal.targetDate).toLocaleDateString()} • 
                      {daysRemaining > 0 ? ` ${daysRemaining} days remaining` : ' Deadline passed'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="section-card">
          <h2>Completed Goals</h2>
          {completedGoals.length === 0 ? (
            <p className="empty-state">No completed goals yet.</p>
          ) : (
            <div className="goals-list">
              {completedGoals.map((goal) => {
                const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
                return (
                  <div key={goal.id} className="goal-item completed">
                    <div className="goal-header">
                      <h4>{goal.name} ✓</h4>
                      <div className="goal-actions">
                        <button onClick={() => handleDeleteGoal(goal.id)} className="btn-icon delete">🗑️</button>
                      </div>
                    </div>
                    <div className="goal-progress-info">
                      <span className="goal-amount">
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                      </span>
                      <span className="goal-percentage">100%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar completed" style={{ width: "100%" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Goals;
