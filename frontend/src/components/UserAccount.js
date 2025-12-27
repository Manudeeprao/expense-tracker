import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import API from "../api/axios";

// Helper function to decode JWT and get userId or email
function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Prefer numeric userId, fallback to email if not present
    return payload.id || payload.userId || payload.sub || payload.email;
  } catch {
    return null;
  }
}

const UserAccount = () => {
  const [user, setUser] = useState({ username: "", email: "" });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Dynamically get userId or email from JWT
  const userIdOrEmail = getUserIdFromToken();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userIdOrEmail) {
      setError("User not logged in.");
      return;
    }
    // If userIdOrEmail is a number, use /users/{id}, else use /users/by-email/{email}
    const isNumeric = !isNaN(userIdOrEmail);
    const endpoint = isNumeric
      ? `/users/${userIdOrEmail}`
      : `/users/by-email/${encodeURIComponent(userIdOrEmail)}`;
    API.get(endpoint)
      .then(response => setUser(response.data))
      .catch(() => setError("Failed to load user info."));
  }, [userIdOrEmail]);

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    // Use correct endpoint for update
    const isNumeric = !isNaN(userIdOrEmail);
    const endpoint = isNumeric
      ? `/users/${userIdOrEmail}`
      : `/users/by-email/${encodeURIComponent(userIdOrEmail)}`;
    try {
      await API.put(endpoint, {
        username: user.username,
        email: user.email,
        currency: user.currency
      });
      setSuccess("Account updated successfully!");
      if (user.currency) localStorage.setItem('currency', user.currency);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data ||
        "Failed to update account."
      );
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    setLoading(true);
    // Use correct endpoint for password change
    const isNumeric = !isNaN(userIdOrEmail);
    const endpoint = isNumeric
      ? `/users/${userIdOrEmail}/password`
      : `/users/by-email/${encodeURIComponent(userIdOrEmail)}/password`;
    try {
      const res = await API.put(endpoint, {
        oldPassword,
        newPassword,
      });
      setSuccess(res.data);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data ||
        "Failed to change password."
      );
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setLoading(true);
    setError('');
    try {
      const isNumeric = !isNaN(userIdOrEmail);
      const endpoint = isNumeric
        ? `/users/${userIdOrEmail}`
        : `/users/by-email/${encodeURIComponent(userIdOrEmail)}`;
      await API.delete(endpoint);
      // clear local auth and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('currency');
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account.');
    }
    setLoading(false);
  };

  return (
    <div className="card account-card" style={{ maxWidth: 520, margin: '40px auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>My Account</h2>
      {(error || success) && (
        <p className={error ? 'alert alert-error' : 'alert alert-success'} style={{ marginBottom: 16 }}>
          {error || success}
        </p>
      )}
      <form onSubmit={handleUpdateAccount} style={{ marginBottom: 32 }}>
        <label className="form-label">Username</label>
        <input
          className="form-control"
          type="text"
          value={user.username}
          onChange={e => setUser({ ...user, username: e.target.value })}
          required
        />
        <label className="form-label">Email</label>
        <input
          className="form-control"
          type="email"
          value={user.email}
          onChange={e => setUser({ ...user, email: e.target.value })}
          required
        />
        <label className="form-label">Preferred Currency</label>
        <select className="form-control" value={user.currency || '₹'} onChange={e => setUser({...user, currency: e.target.value})}>
          <option value="₹">₹ INR</option>
          <option value="$">$ USD</option>
          <option value="€">€ EUR</option>
        </select>
        <button className="btn" type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'Updating...' : 'Update Account'}
        </button>
      </form>
      <hr style={{ margin: '24px 0', borderColor: 'var(--border-color)' }} />
      <h3 style={{ marginBottom: 16 }}>Change Password</h3>
      <form onSubmit={handleChangePassword}>
        <label className="form-label">Old Password</label>
        <input
          className="form-control"
          type="password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
        />
        <label className="form-label">New Password</label>
        <input
          className="form-control"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <label className="form-label">Confirm New Password</label>
        <input
          className="form-control"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button className="btn" type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
      <button
        className="btn btn-secondary"
        style={{ width: '100%', marginTop: 16, background: 'var(--error-color)' }}
        onClick={handleDeleteAccount}
        disabled={loading}
        title="Delete your account"
      >
        {loading ? 'Processing...' : 'Delete Account'}
      </button>
    </div>
  );
};
export default UserAccount;