import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import MonthlyReportChart from './MonthlyReportChart';
import { useAuth } from '../context/AuthContext';

const MonthlyReport = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (!user || !user.id) return;
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/reports/${user.id}`, { params: { month, year } });
        setReport(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [user, month, year]);

  const handleMonthChange = (e) => setMonth(Number(e.target.value));
  const handleYearChange = (e) => setYear(Number(e.target.value));

  return (
    <div className="card p-3">
      <h2>Monthly Expense Report</h2>

      <div className="d-flex gap-2 align-items-center mb-3">
        <label>
          Month:
          <select value={month} onChange={handleMonthChange} className="form-select ms-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </label>

        <label>
          Year:
          <input type="number" value={year} onChange={handleYearChange} className="form-control ms-2" style={{ width: 110 }} />
        </label>
      </div>

      {loading && <div className="alert alert-info">Loading report...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && report && (
        <MonthlyReportChart report={report} month={month} year={year} />
  )}
      {!loading && !error && report && (
        <div style={{ marginTop: 12 }}>
          <button className="btn cta-btn" onClick={async () => {
            try {
              const res = await api.get('/reports/monthly/pdf', { params: { userId: user.id, month, year }, responseType: 'blob' });
              const blob = new Blob([res.data], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `monthly-report-${year}-${String(month).padStart(2,'0')}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error('Failed to download PDF', err);
              alert('Failed to download PDF');
            }
          }}>Download PDF</button>
        </div>
      )}
      {!loading && !error && !report && (
        <div className="alert alert-secondary">No data for selected month.</div>
      )}
    </div>
  );
};
export default MonthlyReport;