import { FaLock, FaUnlock } from 'react-icons/fa';
import { useContext } from 'react';
import ProfileDropdown from '../search/ProfileDropdown';
import AuthContext from '../../context/AuthContext';
import './RoadmapViewer.css';

const RoadmapOverview = ({
  roadmap,
  lockIndexes,
  updateURL,
  setActiveTab
}) => {
  const levels = ['beginner', 'intermediate', 'advanced'];
  const { user, logout } = useContext(AuthContext);

  const isWeekUnlocked = (level, weekIndex) => {
    const lockIndex = lockIndexes?.[level] ?? -1;
    return weekIndex < lockIndex;
  };

  const handleSelect = (levelIndex, weekIndex) => {
    const level = levels[levelIndex];
    if (!isWeekUnlocked(level, weekIndex)) return;

    updateURL(levelIndex, weekIndex); // sync URL
    setActiveTab('viewer');           // switch back to viewer
  };

  return (
    <div className="roadmap-overview">
      <ProfileDropdown user={user} onLogout={logout} />

      {levels.map((level, levelIndex) => {
        const weeks = Object.entries(roadmap[level] || {});
        return (
          <div key={level} className="overview-level">
            <h2 className="overview-level-title">
              {level.charAt(0).toUpperCase() + level.slice(1)} Level
            </h2>
            <ul className="overview-weeks">
              {weeks.map(([weekName, weekData], weekIndex) => {
                const unlocked = isWeekUnlocked(level, weekIndex);
                return (
                  <li
                    key={weekName}
                    className={`overview-week ${!unlocked ? 'locked-week' : ''}`}
                    onClick={() => handleSelect(levelIndex, weekIndex)}
                  >
                    <div className="overview-week-content">
                      <div className="week-lock-icon">
                        {unlocked ? <FaUnlock /> : <FaLock />}
                      </div>
                      <div>
                        <strong>{weekName.charAt(0).toUpperCase() + weekName.slice(1)}</strong>
                        : {weekData.topic}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapOverview;
