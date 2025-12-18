/*
CSCI2720 Project:
Members:
Chow Ho Yee (1155214324)
Ho Chi Tung (1155213294)
Lam Tsz Yi (1155212543)
 */
// src/routes/AdminEvents.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NavBar from "../components/NavBar";

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function AdminEvents() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    titleEn: '',
    venueId: '',
    venueName: '',
    dateTime: '',
    presenterEn: '',
    description: '',
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/locations');
    }
  }, [user, navigate]);

  // Fetch events
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/events`);
      const data = await res.json();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      alert('Failed to load events.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEvents();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `${API_BASE}/api/admin/events/${editingId}`
        : `${API_BASE}/api/admin/events`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Save failed');

      setFormData({
        titleEn: '',
        venueId: '',
        venueName: '',
        dateTime: '',
        presenterEn: '',
        description: '',
      });
      setEditingId(null);
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      alert('Failed to save event.');
      console.error(err);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setFormData({
      titleEn: event.titleEn,
      venueId: event.venueId,
      venueName: event.venueName,
      dateTime: event.dateTime,
      presenterEn: event.presenterEn,
      description: event.description || '',
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event forever?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/events/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchEvents();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      titleEn: '',
      venueId: '',
      venueName: '',
      dateTime: '',
      presenterEn: '',
      description: '',
    });
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <>
      <NavBar />
      <div 
        className="admin-container"
        style={{
          padding: '24px 40px',
          maxWidth: '1400px',
          margin: '0 auto',
          minHeight: '100vh',
        }}
      >
        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: 'inherit' }}>
          Admin Panel — Manage Events
        </h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>
          Add, edit, or delete cultural events.
        </p>

        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                titleEn: '',
                venueId: '',
                venueName: '',
                dateTime: '',
                presenterEn: '',
                description: '',
              });
            }}
            style={{
              padding: '14px 32px',
              backgroundColor: '#0bb8b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '32px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            + Add New Event
          </button>
        )}

        {showForm && (
          <div
            className="admin-form-card"
            style={{
              background: '#ffffff', // light mode default; dark mode can override via CSS if needed
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              marginBottom: '40px',
            }}
          >
            <h2 style={{ marginBottom: '20px', color: '#1890ff' }}>
              {editingId ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Title (English)</label>
                <input name="titleEn" value={formData.titleEn} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Venue ID</label>
                <input name="venueId" value={formData.venueId} onChange={handleChange} required placeholder="e.g., 35510044" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Venue Name</label>
                <input name="venueName" value={formData.venueName} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Date & Time</label>
                <input name="dateTime" value={formData.dateTime} onChange={handleChange} required placeholder="e.g., 30-31 Jan 2026" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Presenter / Organizer</label>
                <input name="presenterEn" value={formData.presenterEn} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Description (Optional)</label>
                <input name="description" value={formData.description} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    backgroundColor: '#1890ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {editingId ? 'Update Event' : 'Add Event'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '12px 28px',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <h2 style={{ marginBottom: '20px', color: 'inherit' }}>
          All Events ({events.length})
        </h2>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr>
                  <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Title</th>
                  <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Venue</th>
                  <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date/Time</th>
                  <th style={{ padding: '14px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Presenter</th>
                  <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id}>
                    <td style={{ padding: '14px' }}>{event.titleEn}</td>
                    <td style={{ padding: '14px' }}>{event.venueName} <small>({event.venueId})</small></td>
                    <td style={{ padding: '14px' }}>{event.dateTime}</td>
                    <td style={{ padding: '14px' }}>{event.presenterEn}</td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEdit(event)}
                        style={{
                          marginRight: '8px',
                          padding: '6px 14px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}