import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// use CSS classes for theme-aware styles
const DashboardSummary = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    if (!user || !user.id) return;
    setLoading(true);
    const fetch = () => {
      setLoading(true);
      api.get(`/reports/${user.id}?month=${selectedMonth}&year=${selectedYear}`)
        .then(res => setData(res.data))
        .catch(err => console.error('Failed to fetch report', err))
        .finally(() => setLoading(false));
    };
    fetch();

    const onBudgetUpdated = () => fetch();
    window.addEventListener('budgetUpdated', onBudgetUpdated);

    // notify other components about the selected month/year
    try {
      window.dispatchEvent(new CustomEvent('reportMonthChanged', { detail: { month: selectedMonth, year: selectedYear } }));
    } catch (e) {
      // ignore environments where CustomEvent is restricted
    }

    return () => window.removeEventListener('budgetUpdated', onBudgetUpdated);
  }, [user, selectedMonth, selectedYear]);

  if (loading) return <div>Loading summary...</div>;
  if (!data) return <div>No summary available</div>;
  const currency = localStorage.getItem('currency') || '₹';
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const displayMonth = monthNames[selectedMonth - 1];
  const displayYear = selectedYear;

  return (
    <div className="card" style={{padding: '24px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12}}>
        <div style={{flex: '1 1 auto'}}>
          <h3 style={{textAlign: 'left', marginBottom: 6, color: 'var(--accent-color)'}}>Dashboard Summary — {displayMonth} {displayYear}</h3>
          <div style={{color:'var(--muted-color)', fontSize:13}}>All metrics below refer to the selected month</div>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <label style={{fontSize:13, color:'var(--text-color)'}}>Month</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
            {monthNames.map((m, idx) => (
              <option key={m} value={idx + 1}>{m}</option>
            ))}
          </select>
          <label style={{fontSize:13, color:'var(--text-color)'}}>Year</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {Array.from({ length: 6 }).map((_, i) => {
              const y = (new Date()).getFullYear() - 3 + i; // range: currentYear-3 .. currentYear+2
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'stretch', flexWrap: 'wrap'}}>
        <div style={{flex: '1 1 260px'}}>
          <div className="metric-card">
            <div className="label">Total spent this month</div>
            <div className="value">{currency}{(data.totalExpenses || 0).toFixed(2)}</div>
          </div>
        </div>
        <div style={{flex: '1 1 260px'}}>
          <div className="metric-card">
            <div className="label">Top category</div>
            <div className="value" style={{fontSize:20, fontWeight:600}}>{data.topCategory || '—'}</div>
          </div>
        </div>
        <div style={{flex: '1 1 260px'}}>
          <div className="metric-card">
            <div className="label">Remaining budget</div>
            <div className="value" style={{fontSize:28, fontWeight:700}}>
              {data.remainingBudget == null ? 'No budget set' : (
                data.remainingBudget < 0 ? `Over budget ${currency}${Math.abs(data.remainingBudget).toFixed(2)}` : `${currency}${data.remainingBudget.toFixed(2)}`
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardSummary;