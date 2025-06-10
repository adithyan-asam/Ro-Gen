import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import Roadmapfetch from './api/RoadmapApi';
import RoadmapViewer from './roadmap/RoadmapViewer';
import './Search.css';

const Search = () => {
  const { user, logout } = useContext(AuthContext);
  const [course, setCourse] = useState('');
  const [time, setTime] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!course.trim() || !time.trim()) {
      setError('Please enter both course and time');
      return;
    }
    
    setLoading(true);
    setError('');
    setRoadmap(null);
    
    try {
      const token = localStorage.getItem('token');
      const data = await Roadmapfetch(course, time, token);
      setRoadmap(data);
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
      
      {!roadmap ? (
        <>
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
                placeholder='Enter Time Duration (e.g., 30 days)'
                value={time}
                onChange={(e) => setTime(e.target.value)}
                onKeyDown={handleKeyDown}  // Add keydown listener
              />
            </div>
            <button className='search-button' onClick={handleSearch} disabled={loading}>
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
        </>
      ) : (
        <RoadmapViewer roadmap={roadmap} />
      )}

      {loading && <p className="loading">Loading roadmap...</p>}
      {error && <p className="error">{error}</p>}
      
      <button className='logout-butt' onClick={logout}>Logout</button>
    </div>
  );
};

export default Search;