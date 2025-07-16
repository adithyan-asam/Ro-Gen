import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import axios from "axios";
import LoadingSpinner from "../ui/LoadingSpinner";
import ProfileDropdown from "../search/ProfileDropdown";
import "./ResourcesPage.css";

const ResourcesPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [resourcesByType, setResourcesByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedVideo, setExpandedVideo] = useState(null);

  const { course, level, weekTopic, subtopicTitle, points, time } = state || {};

  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const toggleVideo = (resourceIdx) => {
    setExpandedVideo(expandedVideo === resourceIdx ? null : resourceIdx);
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "http://localhost:5001/api/resources",
          { course, level, weekTopic, subtopicTitle, points, time },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const grouped = res.data.reduce((acc, res) => {
          if (!acc[res.type]) acc[res.type] = [];
          acc[res.type].push(res);
          return acc;
        }, {});

        setResourcesByType(grouped);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      } finally {
        setLoading(false);
      }
    };

    if (state) {
      fetchResources();
    } else {  
      navigate("/");
    }
  }, [course, level, weekTopic, subtopicTitle, points, time, navigate, state]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="resources-page">
      <ProfileDropdown user={user} onLogout={logout} />
      <h1 className="resource-heading">{subtopicTitle} - Resources</h1>

      <div className="resource-list">
        {["article", "video", "interactive"].map((type) =>
          resourcesByType[type] ? (
            <div key={type} className="resource-group">
              <h2 className="group-heading">
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </h2>
              <div className="resource-type-list">
                {resourcesByType[type].map((res, idx) => (
                  <div key={idx} className="resource-card">
                    <div className="resource-header">
                      <span className={`type-badge ${res.type}`}>
                        {res.type}
                      </span>
                      {type === "video" ? (
                        <>
                          <h3 
                            className="resource-title clickable"
                            onClick={() => toggleVideo(idx)}
                          >
                            {res.title}
                          </h3>
                          {expandedVideo === idx && (
                            <div className="video-container">
                              {getYouTubeId(res.url) ? (
                                <iframe
                                  width="100%"
                                  height="315"
                                  src={`https://www.youtube.com/embed/${getYouTubeId(res.url)}`}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={res.title}
                                ></iframe>
                              ) : (
                                <video controls width="100%">
                                  <source src={res.url} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <a href={res.url} target="_blank" rel="noopener noreferrer">
                          <h3 className="resource-title">{res.title}</h3>
                        </a>
                      )}
                      <p className="resource-domain">{res.source}</p>
                    </div>
                    <p className="recommended">{res.recommendedFor}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>

      <div className="back-button-container">
        <button className="nav-butt" onClick={() => navigate(-1)}>
          Back to Roadmap
        </button>
      </div>
    </div>
  );
};

export default ResourcesPage;