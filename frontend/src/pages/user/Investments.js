import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useAppContext } from "../../context/AppContext";
import "./UserPages.css";

function Investments() {
  const {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment
  } = useAppContext();

  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  const [investmentForm, setInvestmentForm] = useState({
    name: "",
    type: "",
    amount: ""
  });

  const investmentTypes = ["Stocks", "Mutual Fund", "Crypto", "FD", "Bonds", "Real Estate", "Other"];

  const totalValue = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalGain = totalValue * 0.15; // Dummy 15% gain

  const handleAddInvestment = (e) => {
    e.preventDefault();
    if (investmentForm.name && investmentForm.type && investmentForm.amount) {
      const newInvestment = {
        id: editingInvestment ? editingInvestment.id : Date.now(),
        name: investmentForm.name,
        type: investmentForm.type,
        amount: parseFloat(investmentForm.amount)
      };

      if (editingInvestment) {
        updateInvestment(editingInvestment.id, newInvestment);
        setEditingInvestment(null);
      } else {
        addInvestment(newInvestment);
      }

      setInvestmentForm({ name: "", type: "", amount: "" });
      setShowForm(false);
    }
  };

  const handleDeleteInvestment = (id) => {
    deleteInvestment(id);
  };

  const handleEditInvestment = (investment) => {
    setEditingInvestment(investment);
    setInvestmentForm({
      name: investment.name,
      type: investment.type,
      amount: investment.amount.toString()
    });
    setShowForm(true);
  };

  // Prepare data for pie chart
  const chartData = investments.map(inv => ({
    name: inv.name,
    value: inv.amount
  }));

  const COLORS = ['#818cf8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Investments</h1>
        <p>Track your investment portfolio</p>
      </div>

      <div className="portfolio-summary-cards">
        <div className="summary-card">
          <h3>Total Portfolio Value</h3>
          <p className="summary-amount">${totalValue.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Gain/Loss</h3>
          <p className="summary-amount positive">+${totalGain.toLocaleString()}</p>
          <p className="summary-subtext">+15% return</p>
        </div>
      </div>

      <div className="content-section">
        <div className="section-card">
          <div className="section-header">
            <h2>Add Investment</h2>
            <button onClick={() => {
              setEditingInvestment(null);
              setInvestmentForm({ name: "", type: "", amount: "" });
              setShowForm(!showForm);
            }} className="btn-primary">
              {showForm ? "Cancel" : "+ Add Investment"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddInvestment} className="form-grid">
              <input
                type="text"
                placeholder="Investment name"
                value={investmentForm.name}
                onChange={(e) => setInvestmentForm({ ...investmentForm, name: e.target.value })}
                required
              />
              <select
                value={investmentForm.type}
                onChange={(e) => setInvestmentForm({ ...investmentForm, type: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                {investmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount invested"
                value={investmentForm.amount}
                onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                step="0.01"
                required
              />
              <button type="submit" className="btn-primary">
                {editingInvestment ? "Update Investment" : "Add Investment"}
              </button>
            </form>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="charts-grid">
            <div className="section-card">
              <h2>Investment Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="section-card">
          <h2>Investment Holdings</h2>
          {investments.length === 0 ? (
            <p className="empty-state">No investments added yet. Add your first investment to start tracking your portfolio!</p>
          ) : (
            <div className="investments-list">
              {investments.map((investment) => {
                const gain = investment.amount * 0.15; // Dummy 15% gain
                const currentValue = investment.amount + gain;
                return (
                  <div key={investment.id} className="investment-item">
                    <div className="investment-info">
                      <h4>{investment.name}</h4>
                      <p className="investment-meta">
                        {investment.type} • Invested: ${investment.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="investment-value">
                      <p className="current-value">${currentValue.toLocaleString()}</p>
                      <p className="gain-loss positive">+${gain.toFixed(2)} (+15%)</p>
                    </div>
                    <div className="investment-actions">
                      <button onClick={() => handleEditInvestment(investment)} className="btn-icon">✏️</button>
                      <button onClick={() => handleDeleteInvestment(investment.id)} className="btn-icon delete">🗑️</button>
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

export default Investments;
