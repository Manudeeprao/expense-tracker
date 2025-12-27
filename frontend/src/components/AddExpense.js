import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AddExpense = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    userId: user?.id,
    categoryId: '',
    name: '',
    description: '',
    amount: '',
    date: '',
    recurring: false,
    recurrence: 'NONE'
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error fetching categories', err));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const expenseData = {
        ...form,
        amount: parseFloat(form.amount),
        userId: user.id
      };
      // handle tags: if form.tags is a comma-separated string, convert to array
      if (form.tags) {
        expenseData.tags = form.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
      await api.post('/expenses', expenseData);
      setMessage('Expense added successfully!');
      setMessageType('success');
  setForm({ userId: user.id, categoryId: '', name: '', description: '', amount: '', date: '', tags: '' });
      // reset recurrence fields as well
      setForm(prev => ({ ...prev, recurring: false, recurrence: 'NONE' }));
    } catch (err) {
      // FIX: Only display string error messages
      let errorMsg = 'Failed to add expense. Please try again.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
      }
      setMessage(errorMsg);
      setMessageType('error');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <h2>Add New Expense</h2>
      {message && <div className={`alert alert-${messageType}`}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Expense Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input name="description" value={form.description} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Amount</label>
          <input name="amount" type="number" value={form.amount} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input name="tags" value={form.tags || ''} onChange={handleChange} placeholder="Work, Personal, Trip" />
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" name="recurring" checked={form.recurring} onChange={(e) => setForm({...form, recurring: e.target.checked})} />
            Recurring expense
          </label>
        </div>
        {form.recurring && (
          <div className="form-group">
            <label>Recurrence</label>
            <select name="recurrence" value={form.recurrence} onChange={(e) => setForm({...form, recurrence: e.target.value})}>
              <option value="NONE">None</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
        )}
        <button type="submit" className="btn">Add Expense</button>
      </form>
    </div>
  );
};

export default AddExpense;