import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './CategoryBudgetManager.css';

const CategoryBudgetManager = () => {
    const { user } = useAuth();
    const currency = localStorage.getItem('currency') || (user?.currency || '₹');
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [form, setForm] = useState({
        id: null,
        userId: user?.id,
        categoryId: '',
        amount: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCategoriesAndBudgets = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const categoriesRes = await api.get('/categories');
            const categoriesData = categoriesRes.data || [];
            setCategories(categoriesData);

            const budgetsRes = await api.get(`/category-budgets/by-user/${user.id}`);
            const budgetsData = budgetsRes.data || [];
            // Map budget entries to include categoryName for display
            const mapped = budgetsData.map(b => {
                const cat = categoriesData.find(c => String(c.id) === String(b.categoryId));
                return { ...b, categoryName: cat ? cat.name : 'Unknown' };
            });
            setBudgets(mapped);
        } catch (err) {
            setMessage('Failed to load data.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCategoriesAndBudgets();    
    }, [fetchCategoriesAndBudgets]);

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const data = {
                id: form.id,
                userId: user.id,
                categoryId: form.categoryId,
                amount: parseFloat(form.amount)
            };
            await api.post('/category-budgets', data);
            setMessage('Category budget saved successfully!');
            setMessageType('success');
            setForm({ id: null, userId: user.id, categoryId: '', amount: '' });
            fetchCategoriesAndBudgets();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to save budget.');
            setMessageType('error');
        }
    };

    const handleEdit = (budget) => {
        setForm({
            id: budget.id,
            userId: user ? user.id : null,
            categoryId: budget.categoryId,
            amount: budget.amount
        });
        setMessage('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category budget?")) {
            return;
        }

        try {
            await api.delete(`/category-budgets/${id}`);
            setMessage('Budget deleted successfully!');
            setMessageType('success');
            fetchCategoriesAndBudgets();
        } catch (err) {
            setMessage('Failed to delete budget.');
            setMessageType('error');
        }
    };

    if (loading) {
        return <div className="category-budget-card">Loading...</div>;
    }

    return (
        <div className="category-budget-container">
            <div className="category-budget-card">
                <h2>Set Category Budgets</h2>
                {message && <div className={`alert alert-${messageType}`}>{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Category</label>
                        <select name="categoryId" value={form.categoryId} onChange={handleFormChange} required>
                                <option value="">Select a Category</option>
                                {(() => {
                                    // build a set of already-budgeted category IDs
                                    const budgetedIds = new Set(budgets.map(b => String(b.categoryId)));
                                    return categories.map(cat => {
                                        const isBudgeted = budgetedIds.has(String(cat.id));
                                        // allow selecting if currently editing that budget's category
                                        const editingSame = form.id && String(form.categoryId) === String(cat.id);
                                        return (
                                            <option
                                                key={cat.id}
                                                value={cat.id}
                                                disabled={isBudgeted && !editingSame}
                                            >{cat.name}{isBudgeted && !editingSame ? ' (already budgeted)' : ''}</option>
                                        );
                                    });
                                })()}
                            </select>
                    </div>
                    <div className="form-group">
                        <label>Budget Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleFormChange}
                            required
                        />
                    </div>
                    <div className="category-budget-actions">
                        <button type="submit" className="btn">Save Budget</button>
                        {form.id && (
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                style={{marginTop: '10px'}}
                                onClick={() => setForm({id: null, userId: user.id, categoryId: '', amount: ''})}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <div className="category-budget-card">
                <h2>Your Category Budgets</h2>
                {budgets.length === 0 ? (
                    <p>No category budgets set yet.</p>
                ) : (
                    <table className="budget-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Budget Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map(budget => (
                                <tr key={budget.id}>
                                    <td>{budget.categoryName}</td>
                            <td>{currency}{Number(budget.amount).toFixed(2)}</td>
                                    <td>
                                        <button className="btn" onClick={() => handleEdit(budget)}>Edit</button>
                                        <button className="btn btn-secondary" onClick={() => handleDelete(budget.id)} style={{marginLeft: '10px'}}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CategoryBudgetManager;
