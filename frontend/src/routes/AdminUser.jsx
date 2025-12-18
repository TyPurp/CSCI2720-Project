// src/routes/AdminUsers.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      navigate('/locations');
    }
  }, [currentUser, navigate]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`);
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  // Start creating new user
  const startCreate = () => {
    setShowForm(true);
    setIsEditing(false);
    setEditingUserId(null);
    setUsername('');
    setPassword('');
    setRole('user');
    setError('');
    setSuccess('');
  };

  // Start editing a user (any user, including admins and self)
  const startEdit = (user) => {
    setShowForm(true);
    setIsEditing(true);
    setEditingUserId(user._id);
    setUsername(user.username);
    setPassword(''); // blank = no change
    setRole(user.role);
    setError('');
    setSuccess('');
  };

  // Submit create or update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const url = isEditing
        ? `${API_BASE}/api/admin/users/${editingUserId}`
        : `${API_BASE}/api/admin/users`;

      const method = isEditing ? 'PUT' : 'POST';

      const body = {
        username: username.trim(),
        role,
      };

      // Only include password if provided
      if (password) {
        body.password = password;
      }

      // For create: password is required + favourites
      if (!isEditing) {
        if (!password) {
          setError('Password is required for new users');
          return;
        }
        body.favourites = [];
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Operation failed');
      }

      setShowForm(false);
      setSuccess(isEditing ? 'User updated successfully!' : 'User created successfully!');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed. Username may already exist or invalid data.');
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingUserId(null);
    setUsername('');
    setPassword('');
    setRole('user');
    setError('');
  };

  // Delete user — only block self-delete
  const handleDelete = async (userId, username) => {
    if (userId === currentUser._id || username === currentUser.username) {
      alert('You cannot delete your own account!');
      return;
    }

    if (!window.confirm(`Permanently delete user "${username}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      setSuccess(`User "${username}" deleted successfully.`);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1000px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#333' }}>
        Admin Panel — Manage Users
      </h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Create, edit (including username & password), or delete users.
      </p>

      {/* Add New User Button */}
      {!showForm && (
        <button
          onClick={startCreate}
          style={{
            padding: '14px 32px',
            backgroundColor: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '32px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          + Add New User
        </button>
      )}

      {/* Form: Create or Edit */}
      {showForm && (
        <div
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '40px',
          }}
        >
          <h2 style={{ marginBottom: '20px', color: '#1890ff' }}>
            {isEditing ? 'Edit User' : 'Create New User'}
          </h2>

          {error && (
            <div style={{ padding: '12px', background: '#fff2f0', border: '1px solid #ffccc7', color: '#ff4d4f', borderRadius: '6px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', color: '#52c41a', borderRadius: '6px', marginBottom: '16px' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={isEditing ? 'Change username' : 'e.g., john123'}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Password {isEditing && '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? 'New password' : 'e.g., 234455'}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#1890ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '42px',
                }}
              >
                {isEditing ? 'Update User' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  height: '42px',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <h2 style={{ marginBottom: '20px' }}>All Users ({users.length})</h2>
      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f7ff' }}>
                <th style={{ padding: '14px', textAlign: 'left' }}>Username</th>
                <th style={{ padding: '14px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '14px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isCurrentUser = user._id === currentUser._id;

                return (
                  <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '14px', fontWeight: isCurrentUser ? 'bold' : 'normal' }}>
                      {user.username}
                      {isCurrentUser && <span style={{ color: '#1890ff', marginLeft: '8px' }}>(You)</span>}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '4px',
                          backgroundColor: user.role === 'admin' ? '#fff1f0' : '#f6ffed',
                          color: user.role === 'admin' ? '#d9363e' : '#52c41a',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button
                        onClick={() => startEdit(user)}
                        style={{
                          marginRight: '8px',
                          padding: '6px 14px',
                          backgroundColor: '#52c41a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, user.username)}
                        disabled={isCurrentUser}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: isCurrentUser ? '#ccc' : '#ff4d4f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isCurrentUser ? 'not-allowed' : 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}