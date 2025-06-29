import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import RoadmapViewer from './RoadmapViewer';
import RoadmapOverview from './RoadmapOverview';
import axios from 'axios';
import './RoadmapViewer.css';

const levels = ['beginner', 'intermediate', 'advanced'];

const RoadmapTabs = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { level: urlLevel, week: urlWeek } = useParams();
    const { roadmap, course, time } = location.state || {};

    const [activeTab, setActiveTab] = useState('viewer');
    const [lockIndexes, setLockIndexes] = useState(null);
    
    // Convert URL params to indexes
    const getLevelIndex = (levelName) => {
        return levels.findIndex(l => l === levelName);
    };
    
    const getWeekIndex = (levelName, weekName) => {
        if (!roadmap || !roadmap[levelName]) return 0;
        const weeks = Object.keys(roadmap[levelName]);
        return weeks.findIndex(w => w === weekName);
    };

    // Initialize current indexes from URL params
    const currentLevelIndex = urlLevel ? getLevelIndex(urlLevel) : 0;
    const currentWeekIndex = urlWeek ? getWeekIndex(urlLevel, urlWeek) : 0;

    // Redirect to first week if no URL params
    useEffect(() => {
        if (roadmap && !urlLevel && !urlWeek) {
            const firstLevel = levels[0];
            const firstWeek = Object.keys(roadmap[firstLevel] || {})[0];
            if (firstWeek) {
                navigate(`/roadmap/${firstLevel}/${firstWeek}`, { 
                    state: { roadmap, course, time },
                    replace: true 
                });
            }
        }
    }, [roadmap, urlLevel, urlWeek, navigate, course, time]);

    // Function to update URL when level/week changes
    const updateURL = (levelIndex, weekIndex) => {
        const level = levels[levelIndex];
        const weeks = Object.keys(roadmap[level] || {});
        const week = weeks[weekIndex];
        
        if (level && week) {
            navigate(`/roadmap/${level}/${week}`, { 
                state: { roadmap, course, time },
                replace: true 
            });
        }
    };

    const handleOverview = async() => {
        const token = localStorage.getItem('token');

        try {
            const res = await axios.get('http://localhost:5001/api/quiz/lock-indexes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-type': 'application/json'
                },
                params: {
                    course,
                    time
                }
            });
            setLockIndexes(res.data.lockIndexes);
            setActiveTab("overview");
        } catch (error) {
            console.error('Failed to fetch lock indexes:', error);
        }
    };

    // If no roadmap data, redirect to home
    if (!roadmap) {
        navigate('/');
        return null;
    }

    return (
        <div className="roadmap-container">
            <div className="tabs">
                {activeTab === "viewer" ? (
                    <button
                        className="tab"
                        onClick={handleOverview}
                    >
                        Overview
                    </button>
                ) : (
                    <button
                        className="tab"
                        onClick={() => setActiveTab("viewer")}
                    >
                        Viewer
                    </button>
                )}
            </div>

            {activeTab === "viewer" && (
                <RoadmapViewer
                    roadmap={roadmap}
                    course={course}
                    currentLevelIndex={currentLevelIndex}
                    currentWeekIndex={currentWeekIndex}
                    updateURL={updateURL}
                    time={time}
                />
            )}

            {activeTab === "overview" && (
                <RoadmapOverview
                    roadmap={roadmap}
                    lockIndexes={lockIndexes}
                    updateURL={updateURL}
                    setActiveTab={setActiveTab}
                />
            )}
        </div>
    );
};

export default RoadmapTabs;