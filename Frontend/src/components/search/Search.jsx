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

  const popularPaths = [
    { name: 'React Development', duration: '30 days' },
    { name: 'Python Programming', duration: '60 days' },
    { name: 'Data Science', duration: '90 days' },
    { name: 'Machine Learning', duration: '120 days' },
    { name: 'Web Design', duration: '45 days' }
  ];

  const handlePathClick = (path) => {
    setCourse(path.name);
    setTime(path.duration);
    // Optionally auto-trigger search:
    // handleSearch();
  };

  const handleSearch = async () => {
    if (!course.trim() || !time.trim()) {
      setError('Please enter both course and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await Roadmapfetch(course, time, token);
      navigate(`/roadmap`, { state: { course, time } });
    } catch (err) {
      setError(`Failed to fetch roadmap: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

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
          onKeyDown={handleKeyDown}
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
            onKeyDown={handleKeyDown}
          />
        </div>
        <button className='search-button' onClick={handleSearch} disabled={loading}>
          {loading ? '⏳' : '🔍'}
        </button>
      </div>

      {loading && <p className="loading">Loading roadmap...</p>}
      {error && <p className="error">{error}</p>}

      <div className='popular-paths-container'>
        <h3 className='popular-paths-title'>Popular learning paths</h3>
        <div className='popular-paths'>
          {popularPaths.map((path, index) => (
            <button
              key={index}
              className='path-button'
              onClick={() => handlePathClick(path)}
            >
              {path.name}
            </button>
          ))}
        </div>
      </div>

      <ProfileDropdown user={user} onLogout={logout} />
    </div>
  );
};

export default Search;