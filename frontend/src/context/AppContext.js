import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

// Helper function to get current user ID from localStorage
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user?.id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

// Helper function to generate user-scoped storage key
const getUserStorageKey = (baseKey, userId) => {
  if (!userId) return null;
  return `fintracker_${userId}_${baseKey}`;
};

// Helper functions for localStorage with user scoping
const loadFromStorage = (baseKey, defaultValue = []) => {
  const userId = getCurrentUserId();
  if (!userId) return defaultValue;
  
  const key = getUserStorageKey(baseKey, userId);
  if (!key) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (baseKey, value) => {
  const userId = getCurrentUserId();
  if (!userId) return;
  
  const key = getUserStorageKey(baseKey, userId);
  if (!key) return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const AppProvider = ({ children }) => {
  // Track current user ID to detect user changes
  const [currentUserId, setCurrentUserId] = useState(() => getCurrentUserId());

  // Initialize state from localStorage (user-scoped)
  const [budgetCategories, setBudgetCategories] = useState(() => 
    loadFromStorage('budgets', [])
  );
  const [expenses, setExpenses] = useState(() => 
    loadFromStorage('expenses', [])
  );
  const [goals, setGoals] = useState(() => 
    loadFromStorage('goals', [])
  );
  const [investments, setInvestments] = useState(() => 
    loadFromStorage('investments', [])
  );
  const [groups, setGroups] = useState(() => 
    loadFromStorage('groups', [])
  );
  const [groupExpenses, setGroupExpenses] = useState(() => 
    loadFromStorage('groupExpenses', [])
  );
  const [incomeSources, setIncomeSources] = useState(() => 
    loadFromStorage('income', [])
  );
  const [savingsEntries, setSavingsEntries] = useState(() => 
    loadFromStorage('savings', [])
  );

  // Monitor user changes and reset state when user changes
  useEffect(() => {
    const checkUserChange = () => {
      const newUserId = getCurrentUserId();
      
      // If user changed (or logged out)
      if (newUserId !== currentUserId) {
        if (newUserId === null) {
          // User logged out - clear all state
          setBudgetCategories([]);
          setExpenses([]);
          setGoals([]);
          setInvestments([]);
          setGroups([]);
          setGroupExpenses([]);
          setIncomeSources([]);
          setSavingsEntries([]);
        } else {
          // User changed - load new user's data
          setBudgetCategories(loadFromStorage('budgets', []));
          setExpenses(loadFromStorage('expenses', []));
          setGoals(loadFromStorage('goals', []));
          setInvestments(loadFromStorage('investments', []));
          setGroups(loadFromStorage('groups', []));
          setGroupExpenses(loadFromStorage('groupExpenses', []));
          setIncomeSources(loadFromStorage('income', []));
          setSavingsEntries(loadFromStorage('savings', []));
        }
        setCurrentUserId(newUserId);
      }
    };

    // Check on mount
    checkUserChange();

    // Listen to storage events (for cross-tab sync and immediate detection)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        // Small delay to ensure localStorage is updated
        setTimeout(checkUserChange, 100);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically (less frequent to avoid performance issues)
    const interval = setInterval(checkUserChange, 2000); // Check every 2 seconds

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUserId]);

  // Save to localStorage whenever state changes (user-scoped)
  useEffect(() => {
    if (currentUserId) {
      saveToStorage('budgets', budgetCategories);
    }
  }, [budgetCategories, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      saveToStorage('expenses', expenses);
    }
  }, [expenses, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      saveToStorage('goals', goals);
    }
  }, [goals, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      saveToStorage('investments', investments);
    }
  }, [investments, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      saveToStorage('groups', groups);
    }
  }, [groups, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      saveToStorage('groupExpenses', groupExpenses);
    }
  }, [groupExpenses, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      saveToStorage('income', incomeSources);
    }
  }, [incomeSources, currentUserId]);

  useEffect(() => {
    if (currentUserId) {
      saveToStorage('savings', savingsEntries);
    }
  }, [savingsEntries, currentUserId]);

  // Budget Categories Methods
  const addBudgetCategory = (category) => {
    setBudgetCategories(prev => [...prev, category]);
  };

  const updateBudgetCategory = (id, updates) => {
    setBudgetCategories(prev =>
      prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
    );
  };

  const deleteBudgetCategory = (id) => {
    setBudgetCategories(prev => prev.filter(cat => cat.id !== id));
  };

  // Expenses Methods
  const addExpense = (expense) => {
    setExpenses(prev => [...prev, expense]);
    // Update spent amount in budget category
    setBudgetCategories(prev => {
      const category = prev.find(cat => cat.name === expense.category);
      if (category) {
        return prev.map(cat =>
          cat.id === category.id
            ? { ...cat, spent: cat.spent + expense.amount }
            : cat
        );
      }
      return prev;
    });
  };

  const updateExpense = (id, updatedExpense) => {
    setExpenses(prev => {
      const oldExpense = prev.find(exp => exp.id === id);
      
      // Update budget categories based on old and new expense
      if (oldExpense) {
        setBudgetCategories(prevCats => {
          let updatedCats = [...prevCats];
          
          // Subtract old expense amount from old category
          const oldCategory = updatedCats.find(cat => cat.name === oldExpense.category);
          if (oldCategory) {
            updatedCats = updatedCats.map(cat =>
              cat.id === oldCategory.id
                ? { ...cat, spent: Math.max(0, cat.spent - oldExpense.amount) }
                : cat
            );
          }
          
          // Add new expense amount to new category
          const newCategory = updatedCats.find(cat => cat.name === updatedExpense.category);
          if (newCategory) {
            updatedCats = updatedCats.map(cat =>
              cat.id === newCategory.id
                ? { ...cat, spent: cat.spent + updatedExpense.amount }
                : cat
            );
          }
          
          return updatedCats;
        });
      }
      
      return prev.map(exp => exp.id === id ? updatedExpense : exp);
    });
  };

  const deleteExpense = (id) => {
    setExpenses(prev => {
      const expense = prev.find(exp => exp.id === id);
      if (expense) {
        // Update budget category spent amount
        setBudgetCategories(prevCats => {
          const category = prevCats.find(cat => cat.name === expense.category);
          if (category) {
            return prevCats.map(cat =>
              cat.id === category.id
                ? { ...cat, spent: Math.max(0, cat.spent - expense.amount) }
                : cat
            );
          }
          return prevCats;
        });
        return prev.filter(exp => exp.id !== id);
      }
      return prev;
    });
  };

  // Goals Methods
  const addGoal = (goal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (id, updates) => {
    setGoals(prev =>
      prev.map(goal => goal.id === id ? { ...goal, ...updates } : goal)
    );
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  // Investments Methods
  const addInvestment = (investment) => {
    setInvestments(prev => [...prev, investment]);
  };

  const updateInvestment = (id, updates) => {
    setInvestments(prev =>
      prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv)
    );
  };

  const deleteInvestment = (id) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
  };

  // Groups Methods
  const addGroup = (group) => {
    setGroups(prev => [...prev, group]);
  };

  const updateGroup = (id, updates) => {
    setGroups(prev =>
      prev.map(group => group.id === id ? { ...group, ...updates } : group)
    );
  };

  const deleteGroup = (id) => {
    setGroups(prev => prev.filter(group => group.id !== id));
  };

  // Group Expenses Methods
  const addGroupExpense = (expense) => {
    setGroupExpenses(prev => [...prev, expense]);
  };

  const updateGroupExpense = (id, updatedExpense) => {
    setGroupExpenses(prev =>
      prev.map(exp => exp.id === id ? updatedExpense : exp)
    );
  };

  const deleteGroupExpense = (id) => {
    setGroupExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  // Income Methods
  const addIncome = (income) => {
    setIncomeSources(prev => [...prev, income]);
  };

  const updateIncome = (id, updatedIncome) => {
    setIncomeSources(prev =>
      prev.map(income => income.id === id ? updatedIncome : income)
    );
  };

  const deleteIncome = (id) => {
    setIncomeSources(prev => prev.filter(income => income.id !== id));
  };

  // Savings Methods
  const addSavings = (savings) => {
    setSavingsEntries(prev => [...prev, savings]);
  };

  const updateSavings = (id, updatedSavings) => {
    setSavingsEntries(prev =>
      prev.map(savings => savings.id === id ? updatedSavings : savings)
    );
  };

  const deleteSavings = (id) => {
    setSavingsEntries(prev => prev.filter(savings => savings.id !== id));
  };

  const value = {
    // State
    budgetCategories,
    expenses,
    goals,
    investments,
    groups,
    groupExpenses,
    incomeSources,
    savingsEntries,
    
    // Budget Methods
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    setBudgetCategories,
    
    // Expense Methods
    addExpense,
    updateExpense,
    deleteExpense,
    setExpenses,
    
    // Goal Methods
    addGoal,
    updateGoal,
    deleteGoal,
    setGoals,
    
    // Investment Methods
    addInvestment,
    updateInvestment,
    deleteInvestment,
    setInvestments,
    
    // Group Methods
    addGroup,
    updateGroup,
    deleteGroup,
    setGroups,
    
    // Group Expense Methods
    addGroupExpense,
    updateGroupExpense,
    deleteGroupExpense,
    setGroupExpenses,
    
    // Income Methods
    addIncome,
    updateIncome,
    deleteIncome,
    setIncomeSources,
    
    // Savings Methods
    addSavings,
    updateSavings,
    deleteSavings,
    setSavingsEntries
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
