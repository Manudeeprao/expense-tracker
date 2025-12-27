import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BudgetSummary from '../components/BudgetSummary';
import DashboardSummary from '../components/DashboardSummary';
// Link import removed - not used on this page

const HomePage = () => {
    const { user } = useAuth();

    if (!user) {
        return <div>Please log in.</div>;
    }

    // Prefer a proper display name; fall back to the email local-part if name not provided
    const getDisplayName = () => {
        if (user.name && user.name.trim().length > 0) return user.name;
        if (user.email) {
            const local = user.email.split('@')[0];
            // Capitalize words in case email local part contains dots or dashes
            return local.split(/[.\-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        }
        return 'Welcome';
    };
    const displayName = getDisplayName();

    return (
        <div>
            <section className="hero container">
                <div className="hero-left">
                    <div className="hero-content">
                                              <h1 className="page-title">Welcome, {displayName}!</h1>
                                              <p className="page-subtitle">Your personalized expense tracker dashboard. Track expenses, manage budgets, export reports and stay on top of your finances.</p>
                      <div style={{height:12}} />
                      <div style={{display:'flex', gap:12, marginTop:12}}>
                          <Link className="btn cta-btn" to="/add-expense" aria-label="Add Expense">Add Expense</Link>
                          <Link className="btn btn-secondary" to="/reports" aria-label="View Reports">View Reports</Link>
                      </div>
                    </div>
                </div>
                <div className="hero-right">
                    <div className="hero-illustration-card" aria-hidden="true">
                        {/* show the public asset; if it fails, fall back to a simple inline SVG */}
                        <img src="/hero-large.svg" alt="" className="hero-illustration" onError={(e)=>{ e.currentTarget.style.display='none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display='block'); }} />
                        <div className="hero-illustration-fallback" style={{display:'none'}} aria-hidden="true">
                            <svg width="320" height="220" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
                                <rect width="320" height="220" rx="12" fill="#f3fcfb" />
                                <g transform="translate(18,18)" fill="#0f172a">
                                    <rect x="0" y="0" width="140" height="18" rx="8" fill="#ff9a3c" />
                                    <rect x="0" y="36" width="240" height="10" rx="6" fill="#e6f8f5" />
                                    <rect x="0" y="60" width="160" height="10" rx="6" fill="#e6f8f5" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container" style={{marginTop: 18}}>
                <DashboardSummary />
                <div style={{height:18}} />
                {/* Show budget status above the feature cards as requested */}
                <BudgetSummary />
                <div style={{height:18}} />
                <div className="card">
                    <h3>Why use Expense Tracker?</h3>
                    <div className="features" style={{marginTop:12}}>
                        <div className="feature-card">
                            <i className="fa fa-chart-line feature-icon" aria-hidden="true" />
                            <strong>Easy tracking</strong>
                            <div className="muted">Add expenses quickly, categorize them, and search by tags or category.</div>
                        </div>
                        <div className="feature-card">
                            <i className="fa fa-wallet feature-icon" aria-hidden="true" />
                            <strong>Smart Budgets</strong>
                            <div className="muted">Create monthly budgets, get alerts, and see visual trends at a glance.</div>
                        </div>
                        <div className="feature-card">
                            <i className="fa fa-file-pdf feature-icon" aria-hidden="true" />
                            <strong>Reports & Export</strong>
                            <div className="muted">Export detailed monthly PDF reports, including category breakdowns and tags.</div>
                        </div>
                    </div>
                </div>
                <div style={{height:18}} />
                {/* Testimonial / social proof */}
                <div className="card testimonial-card">
                    <div className="testimonial-inner">
                        <img src="/testimonial-avatar.svg" alt="Avatar" className="testimonial-avatar" />
                        <div>
                            <div className="testimonial-quote">"Expense Tracker helped me cut my monthly spend by 20% — the budgets and tags made everything easy to find."</div>
                            <div className="testimonial-author">— Priya R., Freelance Designer</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;