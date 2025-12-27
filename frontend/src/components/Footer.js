import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-left">
                    <img src="/logo.svg" alt="logo" className="footer-logo" />
                    <div className="brand-info">
                        <div className="brand-title">Expense Tracker</div>
                        <div className="brand-sub">Simple, secure personal finance tracking</div>
                    </div>
                </div>

                <div className="footer-links">
                    <Link to="/">Home</Link>
                    <Link to="/expenses">Expenses</Link>
                    <Link to="/reports">Reports</Link>
                    <Link to="/categories">Categories</Link>
                </div>

                <div className="trusted-logos" aria-hidden="true">
                    <img src="/trusted1.svg" alt="" />
                    <img src="/trusted2.svg" alt="" />
                    <img src="/trusted3.svg" alt="" />
                </div>

                <div className="footer-right">
                    <div className="copyright">© {new Date().getFullYear()} Expense Tracker</div>
                    <div className="copyright-sub">Made with care • Privacy-first</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
