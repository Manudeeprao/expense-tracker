import React, { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { useAuth } from '../context/AuthContext';
import EditExpenseModal from "./EditExpenseModal";
import { debounce } from '../utils/debounce';

const ExpensesList = () => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [editingExpense, setEditingExpense] = useState(null);
    // import functionality removed per user request

    const [filters, setFilters] = useState({
        name: '',
        categoryId: '',
        startDate: '',
        endDate: '',
        minAmount: '',
        maxAmount: ''
    });
    const [categories, setCategories] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);

    const debouncedFetch = useRef(debounce(async (currentFilters) => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            // Build params excluding empty values
            const paramsObj = {};
            Object.entries(currentFilters).forEach(([k,v]) => {
                if (v !== null && v !== undefined && String(v).trim() !== '') paramsObj[k] = v;
            });
            const params = new URLSearchParams(paramsObj).toString();
            const response = await api.get(`/expenses/by-user/${user.id}?${params}`);
            setExpenses(response.data);
        } catch (error) {
            setMessage('Failed to fetch expenses.');
            setMessageType('error');
            console.error("Error fetching expenses:", error);
        } finally {
            setLoading(false);
        }
    }, 500)).current;

    useEffect(() => {
        debouncedFetch(filters);

        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Error fetching categories', err);
            }
        };
        fetchCategories();
    }, [user, filters, debouncedFetch]);

    // Use server-side filtered results directly. When the expenses list updates,
    // show the server-returned data. This avoids mismatches between client/server
    // filtering and ensures category filters behave consistently.
    useEffect(() => {
        setFilteredExpenses(expenses);
    }, [expenses]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) {
            return;
        }
        try {
            await api.delete(`/expenses/${id}`);
            setMessage('Expense deleted successfully!');
            setMessageType('success');
            debouncedFetch(filters);
        } catch (error) {
            setMessage('Failed to delete expense.');
            setMessageType('error');
        }
    };

    const handleOpenEditModal = (expense) => {
        setEditingExpense(expense);
    };

    const handleCloseEditModal = () => {
        setEditingExpense(null);
        debouncedFetch(filters);
    };

    // import handlers removed

    if (loading) {
        return <div className="list-container">Loading expenses...</div>;
    }

    return (
        <div className="list-container">
            <h2>All Expenses</h2>
            {message && <div className={`alert alert-${messageType}`}>{message}</div>}

            <div className="card" style={{marginBottom: '20px'}}>
                <form>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        <div className="form-group">
                            <label>Search by Name</label>
                            <input className="form-control" 
                                type="text" 
                                value={filters.name} 
                                onChange={(e) => setFilters({...filters, name: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select className="form-control" 
                                value={filters.categoryId} 
                                onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input className="form-control"
                                type="date" 
                                value={filters.startDate} 
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input className="form-control"
                                type="date" 
                                value={filters.endDate} 
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})} 
                            />
                        </div>
                        <div className="form-group">
                            <label>Min Amount</label>
                            <input className="form-control"
                                type="number" 
                                value={filters.minAmount} 
                                onChange={(e) => setFilters({...filters, minAmount: e.target.value})} 
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Amount</label>
                            <input className="form-control"
                                type="number" 
                                value={filters.maxAmount} 
                                onChange={(e) => setFilters({...filters, maxAmount: e.target.value})} 
                                placeholder="0"
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* Import feature removed */}

            {filteredExpenses.length === 0 ? (
                <p>No expenses found. Add one to get started!</p>
            ) : (
                <ul>
                        {filteredExpenses.map((expense) => (
                            <li key={expense.id} className="expenses-list-item">
                                <div className="left">
                                    <div className="expense-badge" title={expense.categoryName || ''}>
                                        {expense.categoryName ? expense.categoryName.charAt(0).toUpperCase() : expense.name.charAt(0).toUpperCase()}
                                    </div>

                                    <div className="info">
                                        <div className="title-row">
                                            <span className="title">{expense.name}</span>
                                            <span className="muted" style={{marginLeft:6}}>{expense.categoryName ? `(${expense.categoryName})` : ''}</span>
                                            {expense.recurring ? <small className="recurring" style={{marginLeft:8, color:'#007bff'}}>· {expense.recurrence}</small> : null}
                                        </div>
                                        <div className="meta-row">
                                            <small className="date">{expense.date}</small>
                                            {expense.tags && expense.tags.length > 0 && (
                                                <small className="muted tags" style={{marginLeft:12}}>Tags: {expense.tags.join(', ')}</small>
                                            )}
                                        </div>
                                        <div className="amount-left"><span className="amount-value">{(localStorage.getItem('currency') || '₹')}{expense.amount}</span></div>
                                    </div>
                                </div>

                                <div className="actions">
                                    <button className="btn icon-btn" onClick={() => handleOpenEditModal(expense)} aria-label={`Edit ${expense.name}`}><i className="fa fa-edit" aria-hidden="true"></i><span className="btn-label">Edit</span></button>
                                    <button className="btn icon-btn btn-secondary" onClick={() => handleDelete(expense.id)} aria-label={`Delete ${expense.name}`}><i className="fa fa-trash" aria-hidden="true"></i><span className="btn-label">Delete</span></button>
                                </div>
                            </li>
                        ))}
                </ul>
            )}

            {editingExpense && (
                <EditExpenseModal
                    expense={editingExpense}
                    onClose={handleCloseEditModal}
                    onUpdate={() => debouncedFetch(filters)}
                />
            )}
        </div>
    );
};

export default ExpensesList;