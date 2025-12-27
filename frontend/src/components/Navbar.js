import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (user) => {
        if (!user) return '';
        const source = (user.name && user.name.trim()) || user.email || '';
        const parts = source.split(/[\s._-]+/).filter(Boolean);
        if (parts.length === 0) return '';
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    };

    useEffect(() => {
        const onDocClick = (e) => {
            const open = document.querySelector('.avatar-dropdown.open');
            if (!open) return;
            if (!open.contains(e.target)) {
                open.classList.remove('open');
            }
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    return (
        <nav className="navbar">
            <div className="brand">
                <img src="/logo.svg" alt="logo" className="brand-logo" />
                <span className="brand-text">Expense Tracker</span>
            </div>
            <ul className="nav-links">
                {user ? (
                    <>
                        <li><NavLink to="/">Dashboard</NavLink></li>
                        <li><NavLink to="/expenses">Expenses</NavLink></li>
                        <li><NavLink to="/reports">Reports</NavLink></li>
                        <li><NavLink to="/add-expense">Add Expense</NavLink></li>
                        <li><NavLink to="/categories">Categories</NavLink></li>
                        <li><NavLink to="/category-budgets">Budget</NavLink></li> {/* ✅ New Link */}
                        <li className="nav-user" style={{position:'relative'}}>
                            <div className="user-wrapper" onClick={(e)=>e.stopPropagation()}>
                                <div className="user-avatar" title={user.name || user.email} onClick={(ev)=>{
                                    const el = ev.currentTarget.nextSibling;
                                    if (el) el.classList.toggle('open');
                                }}>{getInitials(user)}</div>
                            </div>
                            <div className="avatar-dropdown">
                                <NavLink to="/account" className="dropdown-item">Profile</NavLink>
                                <NavLink to="/account#settings" className="dropdown-item">Settings</NavLink>
                                <button className="dropdown-item" onClick={handleLogout}>Logout</button>
                            </div>
                        </li>
                        <li style={{marginLeft: '18px', display: 'flex', alignItems: 'center'}}>
                            <NavLink to="/account" className="nav-account">Account</NavLink>
                        </li>
                        <li style={{marginLeft: '12px', display: 'flex', alignItems: 'center'}}>
                            <label className="theme-toggle">
                                <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                                <span className="slider" />
                            </label>
                        </li>
                        <li style={{marginLeft: '12px', display: 'flex', alignItems: 'center'}}>
                            <button className="btn-ghost nav-logout" onClick={handleLogout}>Logout</button>
                        </li>
                        
                    </>
                ) : (
                    <>
                        <li><NavLink to="/login"><i className="fa fa-sign-in-alt" style={{marginRight:8}}></i>Login</NavLink></li>
                        <li><NavLink to="/register"><i className="fa fa-user-plus" style={{marginRight:8}}></i>Register</NavLink></li>
                        <li style={{marginLeft: '25px', display: 'flex', alignItems: 'center'}}>
                            <label className="theme-toggle">
                                <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                                <span className="slider" />
                            </label>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;