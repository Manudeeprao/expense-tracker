import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const { login } = useAuth();
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
   const handleSubmit = async (e) => {
  e.preventDefault(); // ✅ prevent default page refresh
  setMessage('');
  try {
    // Use login from context
    await login(form.email, form.password); 
    navigate('/'); // redirect after successful login
  } catch (err) {
    const errorMessage = err.response?.data || 'Login failed. Please try again.';
    setMessage(errorMessage);
    setMessageType('error');
  }
};
    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h2>Welcome back</h2>
                <p className="muted">Sign in to access your dashboard</p>
                {message && <div className={`alert alert-${messageType}`}>{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required />
                    </div>
                    <div style={{height:12}} />
                    <div style={{display:'flex', gap:12, alignItems:'center'}}>
                      <button type="submit" className="btn cta-btn">Login</button>
                      <button type="button" className="btn btn-secondary" onClick={() => navigate('/register')}>Create account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default LoginPage;