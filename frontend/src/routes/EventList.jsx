import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

import styles from '../components/styles'; // 导入相同的样式
import NavBar from '../components/NavBar';

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
          
          // 提取唯一的场地名称
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

  // 确保events是数组
  const safeEvents = Array.isArray(events) ? events : [];

  // Filter events - 更新为使用filters对象
  const filteredEvents = safeEvents.filter(event => {
    if (!event) return false;
    
    // 关键字搜索
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const matches = 
        (event.titleEn || '').toLowerCase().includes(kw) ||
        (event.venueName || '').toLowerCase().includes(kw) ||
        (event.presenterEn || '').toLowerCase().includes(kw) ||
        (event.description || '').toLowerCase().includes(kw);
      if (!matches) return false;
    }
    
    // 场地过滤
    if (filters.venue !== 'All') {
      if (event.venueName !== filters.venue) return false;
    }
    
    // 日期过滤
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

  // 搜索栏样式 - 与VenueSearchBar保持一致
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

  // 添加一个函数来获取或映射venueId
  // 注意：如果API没有直接提供venueId，你可能需要根据venueName来映射
  const getVenueLink = (event) => {
    // 如果event有venueId，直接使用
    if (event.venueId) {
      return `/locations/${event.venueId}`;
    }
    
    // 否则，你可能需要创建一个映射表或使用venueName
    // 这里我们使用一个简单的映射，或者你可以修改API来提供venueId
    // 临时方案：使用venueName作为参数，但这不是最佳实践
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
        {/* 搜索栏 - 使用与Locations页面相同的样式 */}
        <div style={containerStyle}>
          {/* 搜索框 */}
          <div style={searchBoxStyle}>
            <input
              type="text"
              placeholder="Search events..."
              value={filters.keyword || ''}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              style={searchInputStyle}
            />
          </div>

          {/* 场地选择器 */}
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

          {/* 日期过滤器 */}
          <div style={dateBoxStyle}>
            <input
              type="text"
              placeholder="Filter by date..."
              value={filters.date || ''}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              style={dateInputStyle}
            />
          </div>

          {/* 清除按钮 */}
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
        <p>{sortedEvents.length} result(s). Click headers to sort.</p>
        
        <table style={styles.table}>
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
            </tr>
          </thead>
          <tbody>
            {sortedEvents.length ? sortedEvents.map((event) => (
              <tr key={event._id} style={styles.tr}>
                <td style={styles.td}>
                  <Link 
                    to={getVenueLink(event)}
                    style={styles.link}
                  >
                    {event.venueName || 'Unknown Venue'}
                  </Link>
                </td>
                <td style={styles.td}>{event.dateTime || 'N/A'}</td>
                <td style={styles.td}>{event.titleEn || 'Untitled Event'}</td>
                <td style={styles.td}>{event.presenterEn || 'N/A'}</td>
                <td style={styles.td}>{event.description || 'No description'}</td>
              </tr>
            )) : (
              <tr>
                {/* 注意：colSpan现在是5，因为我们有5列 */}
                <td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>
                  No events match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* 额外的调试信息（可选） */}
        {sortedEvents.length > 0 && (
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p>Showing {sortedEvents.length} of {safeEvents.length} total events</p>
          </div>
        )}
      </div>
    </div>
  );
}