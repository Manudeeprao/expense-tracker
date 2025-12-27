import React from 'react';
import './Modal.css';
import * as XLSX from 'xlsx';

// Normalize date string to YYYY-MM-DD when possible
function normalizeDate(d) {
  if (!d) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const m = String(d).match(/^(\d{1,2})[-/ ]?(\d{1,2})[-/ ]?(\d{4})$/);
  if (m) return `${m[3]}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
  return String(d);
}

function exportXlsx(expenses, categoryName, month, year) {
  if (!expenses || expenses.length === 0) return;
  const wsData = [['Date', 'Name', 'Description', 'Amount']];
  for (const e of expenses) {
    const d = normalizeDate(e.date);
    let excelDate = '';
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      excelDate = new Date(d + 'T00:00:00');
    }
    wsData.push([excelDate, e.name || '', e.description || '', Number(e.amount || 0)]);
  }

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // mark date cells as date type when present
  for (let i = 2; i <= wsData.length; i++) {
    const addr = `A${i}`;
    const cell = ws[addr];
    if (cell && cell.v instanceof Date) cell.t = 'd';
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  const fileName = `expenses_${categoryName}_${month}_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// XLSX export removed — retained CSV export only

const ExpensesModal = ({ open, onClose, expenses = [], categoryName, month, year }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Expenses — {categoryName} ({month}/{year})</h3>
        <div style={{ maxHeight: 320, overflow: 'auto' }}>
          {expenses.length === 0 ? (
            <div>No expenses for this category/month.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.date}</td>
                    <td>{exp.name}</td>
                    <td>{exp.description}</td>
                    <td className="text-end">${Number(exp.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={() => exportXlsx(expenses, categoryName, month, year)} disabled={expenses.length === 0}>Export XLSX</button>
        </div>
      </div>
    </div>
  );
};
export default ExpensesModal;