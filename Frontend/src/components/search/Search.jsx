import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Roadmapfetch from '../api/RoadmapApi';
import ProfileDropdown from './ProfileDropdown';
import './Search.css';

const Search = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [course, setCourse] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!course.trim() || !time.trim()) {
      setError('Please enter both course and time');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const data = await Roadmapfetch(course, time, token);
      const beginnerWeeks = Object.keys(data.beginner || {});
      const firstWeek = beginnerWeeks[0];
      navigate(`/roadmap/beginner/${firstWeek}`, { state: { roadmap: data, course, time } });
    } catch (err) {
      setError(`Failed to fetch roadmap: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
          <h1>Welcome, {user?.name}!</h1>
          <h2 className='title'>What do you want to learn?</h2>
          
          <div className='search-box'>
            <span className='icon'>📚</span>
            <input 
              type="text" 
              placeholder='Enter a Course (e.g., React, Python)'
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              onKeyDown={handleKeyDown}  // Add keydown listener
            />
          </div>

          <div className='search-input-container'>
            <div className='search-box'>
              <span className='icon'>⏰</span>
              <input
                type="text" 
                placeholder='Enter Duration (e.g., 30 days)'
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onKeyDown={handleKeyDown}  // Add keydown listener
              />
            </div>
            <button className='search-button' onClick={handleSearch} disabled={loading}>
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
      {loading && <p className="loading">Loading roadmap...</p>}
      {error && <p className="error">{error}</p>}
      <ProfileDropdown user={user} onLogout={logout} />
    </div>
  );
};

export default Search;