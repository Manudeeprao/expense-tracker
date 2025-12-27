import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ExpensesModal from './ExpensesModal';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6B9A', '#66D2FF', '#B2FF66'
];

const MonthlyReportChart = ({ report, month, year }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expenses, setExpenses] = useState([]);

  if (!report) return null;

  const { totalExpenses, categoryTotals } = report;

  const currency = localStorage.getItem('currency') || (user?.currency || '₹');

  const data = Object.entries(categoryTotals || {}).map(([name, value]) => ({ name, value }));
  const total = Number(totalExpenses) || data.reduce((s, d) => s + Number(d.value || 0), 0);

  const openCategory = async (categoryName) => {
    if (!user || !user.id) return;
    setSelectedCategory(categoryName);
    setModalOpen(true);

    // find category id by matching name? Backend endpoint accepts categoryId; but we can call without it
    // To fetch only this category we must map name -> id. For simplicity call backend with categoryId omitted and filter client-side.
    try {
      const res = await api.get(`/expenses/by-user/${user.id}/by-category`, { params: { month, year } });
      const all = res.data || [];
      const filtered = all.filter(e => (e.categoryName || 'Uncategorized') === categoryName);
      setExpenses(filtered);
    } catch (err) {
      setExpenses([]);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCategory(null);
    setExpenses([]);
  };

  return (
    <div className="card mt-3 p-3" style={{ minHeight: 350 }}>
      <h5 className="mb-4 text-center">Monthly Expense Chart — {month}/{year}</h5>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, height: 300 }}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  onClick={(entry) => openCategory(entry.name)}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${currency}${Number(val).toFixed(2)}`, `${((val / total) * 100).toFixed(1)}%`]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="alert alert-secondary">No categories to display.</div>
          )}
  </div>

        <div style={{ width: 320 }}>
          <div className="mb-3">
            <strong>Total expenses:</strong>
            <div className="h4">{currency}{Number(totalExpenses || 0).toFixed(2)}</div>
          </div>
          <div>
            <h6>By category</h6>
            <ul className="list-group">
              {data.map((d, i) => {
                const pct = total > 0 ? ((Number(d.value) / total) * 100) : 0;
                return (
                  <li key={d.name} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>
                      <span style={{ display: 'inline-block', width: 12, height: 12, background: COLORS[i % COLORS.length], marginRight: 8 }}></span>
                      {d.name}
                    </span>
                    <span>{currency}{Number(d.value).toFixed(2)} <small className="text-muted">({pct.toFixed(1)}%)</small></span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <ExpensesModal open={modalOpen} onClose={closeModal} expenses={expenses} categoryName={selectedCategory} month={month} year={year} />
    </div>
  );
};

export default MonthlyReportChart;
