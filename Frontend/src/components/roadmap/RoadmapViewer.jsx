import './RoadmapViewer.css';

const RoadmapViewer = ({ roadmap }) => {

  if (!roadmap) {
    return null;
  }

  return (
    <div className="roadmap-result">
      <h2 className="roadmap-title">Your Learning Roadmap</h2>
      
      {['beginner', 'intermediate', 'advanced'].map(level => {
        return (
          <div key={level} className="roadmap-level">
            <h3 className="level-title">
              {level.charAt(0).toUpperCase() + level.slice(1)} Level
            </h3>
            {Object.entries(roadmap[level]).map(([week, content], index) => {
              return (
                <div key={index} className="week-block">
                  <h4 className="week-title">
                    {week.charAt(0).toUpperCase() + week.slice(1)}: {content.topic}
                  </h4>
                  {content.subtopics && content.subtopics.length > 0 ? (
                    <ul className="subtopics-list">
                      {content.subtopics.map((sub, i) => {
                        return (
                          <li key={i} className="subtopic-item">
                            <div className="subtopic-header">
                              <strong>{sub.subtopic}</strong>
                              {sub.time && <span className="time-badge">({sub.time})</span>}
                            </div>
                            
                            {sub.points && sub.points.length > 0 && (
                              <ul className="points-list">
                                {sub.points.map((point, j) => (
                                  <li key={j} className="point-item">{point}</li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="no-subtopics">No subtopics available</p>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapViewer;