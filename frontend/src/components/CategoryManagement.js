import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', id: null, parentId: '' });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            setMessage('Failed to fetch categories.');
            setMessageType('error');
        }
    }, [setCategories, setMessage, setMessageType]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleEdit = useCallback((category) => {
        setForm({ name: category.name, description: category.description, id: category.id, parentId: category.parent ? category.parent.id : '' });
        setMessage('');
    }, [setForm, setMessage]);

    const handleDelete = useCallback(async (id) => {
        try {
            await api.delete(`/categories/${id}`);
            setMessage('Category deleted successfully!');
            setMessageType('success');
            fetchCategories();
        } catch (err) {
            setMessage('Failed to delete category.');
            setMessageType('error');
        }
    }, [fetchCategories, setMessage, setMessageType]);

    // Wire up global events emitted by renderCategory buttons to component handlers
    useEffect(() => {
        const onEdit = (e) => handleEdit(e.detail);
        const onDelete = (e) => handleDelete(e.detail);
        window.addEventListener('editCategory', onEdit);
        window.addEventListener('deleteCategory', onDelete);
        return () => {
            window.removeEventListener('editCategory', onEdit);
            window.removeEventListener('deleteCategory', onDelete);
        };
    }, [handleEdit, handleDelete]);

    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            if (form.id) {
                const payload = { name: form.name, description: form.description };
                if (form.parentId) payload.parent = { id: form.parentId };
                else payload.parent = null;
                await api.put(`/categories/${form.id}`, payload);
                setMessage('Category updated successfully!');
            } else {
                const payload = { name: form.name, description: form.description };
                if (form.parentId) payload.parent = { id: form.parentId };
                await api.post('/categories', payload);
                setMessage('Category created successfully!');
            }
            setMessageType('success');
            setForm({ name: '', description: '', id: null, parentId: '' });
            fetchCategories();
        } catch (err) {
            setMessage(err.response?.data?.message || err.response?.data || 'Failed to save category.');
            setMessageType('error');
        }
    };

    return (
        <div className="container">
            <div className="card">
                <h2>Category Management</h2>
                {message && <div className={`alert alert-${messageType}`}>{message}</div>}

                <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Category Name</label>
                            <input name="name" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input name="description" value={form.description} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Parent Category (optional)</label>
                            <select name="parentId" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                                <option value="">None</option>
                                {categories.filter(c => c.id !== form.id).map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    <button type="submit" className="btn">{form.id ? 'Update Category' : 'Create Category'}</button>
                    {form.id && <button type="button" onClick={() => setForm({ name: '', description: '', id: null })} className="btn btn-secondary" style={{ marginLeft: '10px' }}>Cancel</button>}
                </form>
            </div>

            <div className="list-container">
                <h3>All Categories</h3>
                <ul>
                    {buildTree(categories).map(cat => renderCategory(cat, 0))}
                </ul>
            </div>
        </div>
    );
};

// helpers to build tree and render recursively
function buildTree(flat) {
    if (!flat) return [];
    const map = {};
    flat.forEach(c => { map[c.id] = { ...c, children: [] }; });
    const roots = [];
    flat.forEach(c => {
        const parentId = c.parent && c.parent.id ? c.parent.id : (c.parentId ? c.parentId : null);
        if (parentId && map[parentId]) {
            map[parentId].children.push(map[c.id]);
        } else {
            roots.push(map[c.id]);
        }
    });
    return roots;
}

function renderCategory(cat, level) {
    return (
        <li key={cat.id} style={{ marginLeft: level * 16 }}>
            <span>{cat.name}</span>
            <div>
                <button className="btn" onClick={() => window.dispatchEvent(new CustomEvent('editCategory', { detail: cat }))}>Edit</button>
                <button className="btn btn-secondary" onClick={() => window.dispatchEvent(new CustomEvent('deleteCategory', { detail: cat.id }))} style={{ marginLeft: '10px' }}>Delete</button>
            </div>
            {cat.children && cat.children.length > 0 && (
                <ul>
                    {cat.children.map(child => renderCategory(child, level + 1))}
                </ul>
            )}
        </li>
    );
}

export default CategoryManagement;