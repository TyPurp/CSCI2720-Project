/*
CSCI2720 Project:
Members:
Chow Ho Yee (1155214324)
Ho Chi Tung (1155213294)
Lam Tsz Yi (1155212543)
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

import styles from '../components/styles'; // 导入相同的样式
import NavBar from '../components/NavBar';
import * as api from '../api'; // 导入api函数

// Helper function to read from LocalStorage
function getLocalLikesDataDirect() {
  try {
    const stored = localStorage.getItem('event_likes_data');
    return stored ? JSON.parse(stored) : { users: {}, events: {} };
  } catch (e) {
    console.warn('Failed to parse local likes data:', e);
    return { users: {}, events: {} };
  }
}

export default function EventList() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ 
    keyword: '', 
    venue: 'All', 
    date: '',
    maxDistance: ''
  });
  const [sortConfig, setSortConfig] = useState({ field: 'venueName', order: 'asc' });
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uniqueVenues, setUniqueVenues] = useState(['All']);
  
  // Like related states
  const [likedEvents, setLikedEvents] = useState({}); // {eventId: true/false}
  const [likeCounts, setLikeCounts] = useState({}); // {eventId: count}
  const [likeLoading, setLikeLoading] = useState({}); // {eventId: true/false}

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/events');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setEvents(data);
          
          // Extract unique venue names
          const venues = ['All'];
          const venueSet = new Set();
          data.forEach(event => {
            if (event?.venueName) {
              venueSet.add(event.venueName);
            }
          });
          const sortedVenues = Array.from(venueSet).sort();
          setUniqueVenues([...venues, ...sortedVenues]);
        } else {
          setEvents([]);
        }
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Ensure events is an array
  const safeEvents = Array.isArray(events) ? events : [];

  // Load like status from LocalStorage on page load
  useEffect(() => {
    if (safeEvents.length === 0) return;
    
    const loadLikesFromStorage = () => {
      try {
        const likesData = getLocalLikesDataDirect();
        
        const likedMap = {};
        const countMap = {};
        
        // Initialize like status for all events
        safeEvents.forEach(event => {
          if (event?._id) {
            const eventId = event._id;
            
            // 1. Set user like status
            if (user?.username && likesData.users?.[user.username]?.[eventId]) {
              likedMap[eventId] = true;
            } else {
              likedMap[eventId] = false;
            }
            
            // 2. Set like counts
            if (likesData.events?.[eventId]?.count !== undefined) {
              countMap[eventId] = likesData.events[eventId].count;
            } else {
              countMap[eventId] = 0;
            }
          }
        });
        
        setLikedEvents(likedMap);
        setLikeCounts(countMap);
        
      } catch (error) {
        console.error('Error loading likes from storage:', error);
      }
    };
    
    loadLikesFromStorage();
  }, [user, safeEvents]);

  // Filter events
  const filteredEvents = safeEvents.filter(event => {
    if (!event) return false;
    
    // Keyword search
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const matches = 
        (event.titleEn || '').toLowerCase().includes(kw) ||
        (event.venueName || '').toLowerCase().includes(kw) ||
        (event.presenterEn || '').toLowerCase().includes(kw) ||
        (event.description || '').toLowerCase().includes(kw);
      if (!matches) return false;
    }
    
    // Venue filter
    if (filters.venue !== 'All') {
      if (event.venueName !== filters.venue) return false;
    }
    
    // Date filter
    if (filters.date) {
      if (!event.dateTime || !event.dateTime.toLowerCase().includes(filters.date.toLowerCase())) return false;
    }
    
    return true;
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const { field, order } = sortConfig;
    let aVal, bVal;
    
    if (field === 'titleEn') {
      aVal = (a.titleEn || '').toLowerCase();
      bVal = (b.titleEn || '').toLowerCase();
    } else if (field === 'dateTime') {
      aVal = a.dateTime || '';
      bVal = b.dateTime || '';
    } else if (field === 'venueName') {
      aVal = (a.venueName || '').toLowerCase();
      bVal = (b.venueName || '').toLowerCase();
    } else if (field === 'presenterEn') {
      aVal = (a.presenterEn || '').toLowerCase();
      bVal = (b.presenterEn || '').toLowerCase();
    } else {
      return 0;
    }

    return order === 'asc' 
      ? aVal.localeCompare(bVal) 
      : bVal.localeCompare(aVal);
  });

  const handleSort = (field) => {
    setSortConfig((prev) => {
      const newOrder = prev.field === field && prev.order === 'asc' ? 'desc' : 'asc';
      return { field, order: newOrder };
    });
  };

  const getSortIndicator = (field) => {
    if (sortConfig.field !== field) return ' ↕️';
    return sortConfig.order === 'asc' ? ' ↑' : ' ↓';
  };

  // Handle like/unlike
  const handleLikeToggle = async (eventId, eventTitle) => {
    if (!user || !user.username) {
      alert('Please login to like events');
      return;
    }
    
    // Prevent duplicate clicks
    if (likeLoading[eventId]) return;
    
    try {
      setLikeLoading(prev => ({...prev, [eventId]: true}));
      
      const currentLiked = likedEvents[eventId] || false;
      const action = currentLiked ? 'unlike' : 'like';
      const newLikedState = !currentLiked;
      
      // Optimistic UI update
      const currentCount = likeCounts[eventId] || 0;
      const newCount = Math.max(0, currentCount + (currentLiked ? -1 : 1));
      
      setLikedEvents(prev => ({...prev, [eventId]: newLikedState}));
      setLikeCounts(prev => ({...prev, [eventId]: newCount}));
      
      try {
        // Call API
        const result = await api.toggleLike(eventId, user.username, action);
        
        // Update counts from API result
        if (result && result.likeCount !== undefined) {
          setLikeCounts(prev => ({...prev, [eventId]: result.likeCount}));
          
          // Also update liked state if API returns it
          if (result.liked !== undefined) {
            setLikedEvents(prev => ({...prev, [eventId]: result.liked}));
          }
        }
        
      } catch (apiErr) {
        // API not implemented is normal, we rely on LocalStorage
      }
      
    } catch (err) {
      console.error('Error in like toggle:', err);
      
      // Revert to original state
      const currentLiked = likedEvents[eventId] || false;
      setLikedEvents(prev => ({...prev, [eventId]: currentLiked}));
      setLikeCounts(prev => ({
        ...prev, 
        [eventId]: Math.max(0, (prev[eventId] || 0))
      }));
    } finally {
      setLikeLoading(prev => ({...prev, [eventId]: false}));
    }
  };

  // Search bar styles - matching VenueSearchBar
  const containerStyle = {
    marginTop: 20,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  };

  const searchBoxStyle = {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minWidth: 280,
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc'
  };

  const searchInputStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 16,
    width: '100%',
    color: 'black'
  };

  const selectBoxStyle = {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minWidth: 180,
    position: 'relative',
    border: '1px solid #ccc'
  };

  const selectStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 16,
    width: '100%',
    appearance: 'none',
    paddingRight: 24,
    cursor: 'pointer',
    color: 'black'
  };

  const dateBoxStyle = {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minWidth: 180,
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc'
  };

  const dateInputStyle = {
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: 16,
    width: '100%',
    color: 'black'
  };

  const arrowStyle = {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    fontSize: 20,
    color: '#666'
  };

  const clearButtonStyle = {
    ...styles.button,
    alignSelf: 'center',
    fontSize: 16,
    fontWeight: '500',
    cursor: 'pointer',
    minWidth: 140,
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid #ccc'
  };

  const getVenueLink = (event) => {
    if (event.venueId) {
      return `/locations/${event.venueId}`;
    }
    
    return `/locations/name/${encodeURIComponent(event.venueName || '')}`;
  };

  if (loading) {
    return (
      <div>
        <NavBar>
          <div style={{ padding: 20 }}>
            <h2>Loading events...</h2>
          </div>
        </NavBar>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavBar>
          <div style={{ padding: 20, color: 'red' }}>
            <h2>Error Loading Events</h2>
            <p>{error}</p>
          </div>
        </NavBar>
      </div>
    );
  }

  return (
    <div>
      <NavBar>
        {/* Search bar - matching Locations page style */}
        <div style={containerStyle}>
          {/* Search box */}
          <div style={searchBoxStyle}>
            <input
              type="text"
              placeholder="Search events..."
              value={filters.keyword || ''}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              style={searchInputStyle}
            />
          </div>

          {/* Venue selector */}
          <div style={selectBoxStyle}>
            <select
              value={filters.venue || 'All'}
              onChange={(e) => setFilters({ ...filters, venue: e.target.value })}
              style={selectStyle}
            >
              {uniqueVenues.map((venue, idx) => (
                <option key={idx} value={venue} style={{ color: 'black', backgroundColor: 'white' }}>
                  {venue}
                </option>
              ))}
            </select>
            <span style={arrowStyle}>▼</span>
          </div>

          {/* Date filter */}
          <div style={dateBoxStyle}>
            <input
              type="text"
              placeholder="Filter by date..."
              value={filters.date || ''}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              style={dateInputStyle}
            />
          </div>

          {/* Clear button */}
          <button
            onClick={() => setFilters({ keyword: '', venue: 'All', date: '', maxDistance: '' })}
            style={clearButtonStyle}
          >
            Clear Filters
          </button>
        </div>
      </NavBar>
      
      <div style={{ padding: 20, textAlign: 'left' }}>
        <h2>Events</h2>
        <p>{sortedEvents.length} result(s). Click headers to sort. {user?.username ? '' : '(Login to like events)'}</p>
        
        <table style={{ ...styles.table, tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: '15%' }} /> {/* Venue */}
            <col style={{ width: '15%' }} /> {/* Date */}
            <col style={{ width: '20%' }} /> {/* Title */}
            <col style={{ width: '15%' }} /> {/* Presenter */}
            <col style={{ width: '25%' }} /> {/* Description */}
            <col style={{ width: '10%' }} /> {/* Likes */}
          </colgroup>
          <thead>
            <tr>
              <th style={styles.th} onClick={() => handleSort('venueName')}>
                Venue {getSortIndicator('venueName')}
              </th>
              <th style={styles.th} onClick={() => handleSort('dateTime')}>
                Date {getSortIndicator('dateTime')}
              </th>
              <th style={styles.th} onClick={() => handleSort('titleEn')}>
                Title {getSortIndicator('titleEn')}
              </th>
              <th style={styles.th} onClick={() => handleSort('presenterEn')}>
                Presenter {getSortIndicator('presenterEn')}
              </th>
              <th style={styles.th}>
                Description
              </th>
              <th style={{ ...styles.th, textAlign: 'center', padding: '8px', width: '80px' }}>
                Likes
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.length ? sortedEvents.map((event) => (
              <tr key={event._id} style={styles.tr}>
                <td style={{ 
                  ...styles.td, 
                  width: '15%', 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  <Link 
                    to={getVenueLink(event)}
                    style={styles.link}
                  >
                    {event.venueName || 'Unknown Venue'}
                  </Link>
                </td>
                <td style={{ 
                  ...styles.td, 
                  width: '15%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {event.dateTime || 'N/A'}
                </td>
                <td style={{ 
                  ...styles.td, 
                  width: '20%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word'
                }}>
                  {event.titleEn || 'Untitled Event'}
                </td>
                <td style={{ 
                  ...styles.td, 
                  width: '15%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {event.presenterEn || 'N/A'}
                </td>
                <td style={{ 
                  ...styles.td, 
                  width: '25%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'break-word'
                }}>
                  {event.description || 'No description'}
                </td>
                <td style={{ 
                  ...styles.td, 
                  textAlign: 'center', 
                  padding: '8px', 
                  width: '80px',
                  whiteSpace: 'nowrap'
                }}>
                  <button
                    onClick={() => handleLikeToggle(event._id, event.titleEn)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '20px',
                      backgroundColor: likedEvents[event._id] ? '#ff6b6b' : '#f0f0f0',
                      color: likedEvents[event._id] ? 'white' : '#666',
                      cursor: user?.username ? 'pointer' : 'not-allowed',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      opacity: likeLoading[event._id] ? 0.7 : 1,
                      minWidth: '50px',
                      maxWidth: '60px',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box'
                    }}
                    disabled={!user?.username || likeLoading[event._id]}
                    title={user?.username ? (likedEvents[event._id] ? 'Click to unlike' : 'Click to like') : 'Login to like'}
                  >
                    <span style={{ fontSize: '12px' }}>
                      {likedEvents[event._id] ? '❤️' : '🤍'}
                    </span>
                    <span style={{ minWidth: '16px', textAlign: 'center' }}>
                      {likeCounts[event._id] || 0}
                    </span>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ ...styles.td, textAlign: 'center' }}>
                  No events match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Additional debug info (optional) */}
        {sortedEvents.length > 0 && (
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p>Showing {sortedEvents.length} of {safeEvents.length} total events</p>
            {!user?.username && (
              <p style={{ color: '#ff6b6b', marginTop: '5px' }}>
                ⓘ Login to like events
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}