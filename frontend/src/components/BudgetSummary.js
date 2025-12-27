import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const BudgetSummary = () => {
  const { user, loading: authLoading } = useAuth();
  const [budget, setBudget] = useState(null);
  const [newBudget, setNewBudget] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [dismissAlert, setDismissAlert] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const fetchBudgetStatus = useCallback(async () => {
    if (!user || !user.id) {
        return;
    }
  try {
    setDataLoading(true);
    const res = await api.get(`/budget/status/${user.id}`);
    // The response data might be null, so check for it.
    setBudget(res.data);
    setMessage('');
  } catch (err) {
        // ✅ Handle the error if the backend still throws one.
        const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to fetch budget status.';
        setMessage(errorMessage);
        setMessageType('error');
    } finally {
        setDataLoading(false);
    }
}, [user]);

  useEffect(() => {
    if (user) {
      fetchBudgetStatus();
    }
  }, [user, fetchBudgetStatus]);

  // show toast when nearLimit flag is true
  useEffect(() => {
    if (budget && budget.nearLimit) {
      try {
        window.dispatchEvent(new CustomEvent('showToast', { detail: { message: `You're nearing your budget limit. Remaining ${budget.remainingBudget < 0 ? '' : ''}`, type: 'warning' } }));
      } catch (e) {
        window.dispatchEvent(new Event('showToast'));
      }
    }
  }, [budget]);

  // Listen for month/year changes from DashboardSummary and refetch budget for that month
  useEffect(() => {
    const handler = (e) => {
      const { month, year } = e.detail || {};
      if (!user || !user.id) return;
      // fetch budget status for selected month/year
      (async () => {
        try {
          setDataLoading(true);
          const res = await api.get(`/budget/status/${user.id}?month=${month}&year=${year}`);
          setBudget(res.data);
          setMessage('');
        } catch (err) {
          const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to fetch budget status.';
          setMessage(errorMessage);
          setMessageType('error');
        } finally {
          setDataLoading(false);
        }
      })();
    };
    window.addEventListener('reportMonthChanged', handler);
    return () => window.removeEventListener('reportMonthChanged', handler);
  }, [user]);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!user || !user.id) {
      setMessage('User not logged in. Please log in again.');
      setMessageType('error');
      return;
    }

    setMessage('');
    try {
      setDataLoading(true);
      const res = await api.post(`/budget/${user.id}`, { totalBudget: parseFloat(newBudget) });
      setBudget(res.data);
      setMessage('Budget updated successfully!');
      setMessageType('success');
      setNewBudget('');
        // Notify other components (dashboard) that budget changed so they can refresh
        try {
          window.dispatchEvent(new Event('budgetUpdated'));
        } catch (e) {
          // ignore: some environments may restrict Event
        }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || 'Failed to update budget.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setDataLoading(false);
    }
  };

  if (authLoading || dataLoading) {
    return <div className="card">Loading budget...</div>;
  }
  
  if (!user) {
    return <div className="card"><div className="alert alert-error">User not logged in.</div></div>;
  }

  // Your existing rendering logic here...
  const currency = localStorage.getItem('currency') || (user?.currency || '₹');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now = new Date();
  const displayMonth = monthNames[now.getMonth()];
  const displayYear = now.getFullYear();

  return (
    <div className="card">
      <h2 style={{marginBottom:6}}>{budget ? 'Budget Status' : 'Set Your Monthly Budget'}</h2>
      <div style={{color:'#6b7280', fontSize:13, marginBottom:12}}>Showing values for {displayMonth} {displayYear}</div>
      {message && <div className={`alert alert-${messageType}`}>{message}</div>}
      
      {budget ? (
        <>
          {budget.nearLimit && !dismissAlert && (
            <div className="alert alert-error" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <strong>Warning:</strong> You're nearing your budget limit. Remaining{' '}
                {budget.remainingBudget < 0
                  ? `Over budget ${currency}${Math.abs(Number(budget.remainingBudget)).toFixed(2)}`
                  : `${currency}${Number(budget.remainingBudget).toFixed(2)}`}
                {'. '}Threshold: {currency}{Number(budget.alertThreshold).toFixed(2)}.
              </div>
              <div>
                <button className="btn btn-secondary" onClick={() => setDismissAlert(true)}>Dismiss</button>
              </div>
            </div>
          )}
          <div className="dashboard-grid">
            <div className="summary-box">
              <h3>Total Budget</h3>
              <p>{currency}{Number(budget.totalBudget).toFixed(2)}</p>
            </div>
            <div className="summary-box">
              <h3>Total Expenses (this month)</h3>
              <p>{currency}{Number(budget.totalExpenses).toFixed(2)}</p>
            </div>
            <div className="summary-box">
              <h3>Remaining Budget</h3>
              <p>{budget.remainingBudget < 0 ? `Over budget ${currency}${Math.abs(Number(budget.remainingBudget)).toFixed(2)}` : `${currency}${Number(budget.remainingBudget).toFixed(2)}`}</p>
            </div>
          </div>
          <form onSubmit={handleSetBudget} style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label>Update Budget Amount</label>
              <input 
                type="number" 
                value={newBudget} 
                onChange={(e) => setNewBudget(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn">Update Budget</button>
          </form>
        </>
      ) : (
        <form onSubmit={handleSetBudget}>
          <div className="form-group">
            <label>Monthly Budget Amount</label>
            <input 
              type="number" 
              value={newBudget} 
              onChange={(e) => setNewBudget(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn">Set Budget</button>
        </form>
      )}
    </div>
  );
};

export default BudgetSummary;