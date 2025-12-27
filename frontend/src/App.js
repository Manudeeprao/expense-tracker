import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import PrivateRoute from './components/PrivateRoute';
import AddExpense from './components/AddExpense';
import ExpensesList from './components/ExpensesList';
import CategoryManagement from './components/CategoryManagement';
import UserAccount from './components/UserAccount';
import CategoryBudgetManager from './components/CategoryBudgetManager';
import MonthlyReport from './components/MonthlyReport';
import './App.css';
const AppContent = () => {
    const { loading, isAuthenticated } = useAuth();
    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="container">
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} />
                {/* Public password reset routes removed */}

                {/* Private routes (accessible only if authenticated) */}
                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/add-expense" element={<AddExpense />} />
                    <Route path="/expenses" element={<ExpensesList />} />
                        <Route path="/reports" element={<MonthlyReport />} />
                    <Route path="/categories" element={<CategoryManagement />} />
                    <Route path="/category-budgets" element={<CategoryBudgetManager />} />
                    <Route path="/account" element={<UserAccount />} />
                </Route>
            </Routes>
        </div>
    );
};

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <Navbar />
                    <ToastContainer/>
                    <AppContent />
                    <Footer />
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}
export default App;