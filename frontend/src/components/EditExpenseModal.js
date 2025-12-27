import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Modal.css'; // You'll create this CSS file next

const EditExpenseModal = ({ expense, onClose, onUpdate }) => {
    const [form, setForm] = useState({
        name: expense.name,
        description: expense.description || '',
        amount: expense.amount,
        date: expense.date,
        categoryId: null, // We'll need to fetch this
        recurring: expense.recurring || false,
        recurrence: expense.recurrence || 'NONE',
        tags: (expense.tags && Array.isArray(expense.tags)) ? expense.tags.join(', ') : ''
    });
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch categories to populate the dropdown
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data);
                // Set the initial categoryId
                const currentCategory = res.data.find(cat => cat.name === expense.categoryName);
                if (currentCategory) {
                    setForm(prev => ({ ...prev, categoryId: currentCategory.id }));
                }
            } catch (err) {
                console.error('Error fetching categories', err);
            }
        };
        fetchCategories();
    }, [expense]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');
        try {
            const updatedExpense = {
                ...form,
                amount: parseFloat(form.amount),
                userId: expense.userId // Ensure user ID is preserved
            };
            // convert tags string to array if present
            if (form.tags) {
                updatedExpense.tags = form.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
            } else {
                updatedExpense.tags = [];
            }
            await api.put(`/expenses/${expense.id}`, updatedExpense);
            onUpdate(); // Tell the parent component to refresh the list
            onClose(); // Close the modal
        } catch (err) {
            setMessage(err.response?.data?.message || err.response?.data || 'Failed to update expense.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Edit Expense</h3>
                {message && <div className="alert alert-error">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
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
                        <select name="categoryId" value={form.categoryId || ''} onChange={handleChange} required>
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
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Updating...' : 'Update Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditExpenseModal;