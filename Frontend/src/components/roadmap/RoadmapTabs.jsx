import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import RoadmapViewer from "./RoadmapViewer";
import RoadmapOverview from "./RoadmapOverview";
import Roadmapfetch from "../api/RoadmapApi";
import LoadingSpinner from "../ui/LoadingSpinner";
import axios from "axios";
import "./RoadmapViewer.css";

const levels = ["beginner", "intermediate", "advanced"];

const RoadmapTabs = () => {
  const { level: urlLevel, week: urlWeek } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { course, time } = location.state || {};

  const [roadmap, setRoadmap] = useState(null);
  const [activeTab, setActiveTab] = useState("viewer");
  const [lockIndexes, setLockIndexes] = useState(null);
  // In RoadmapTabs.jsx
  const [isLoading, setIsLoading] = useState(true); // Start in loading state
  const [minimumLoadTimePassed, setMinimumLoadTimePassed] = useState(false);

  useEffect(() => {
    if (!course || !time) {
      navigate("/search");
      return;
    }

    const MIN_LOAD_TIME = 800; // Minimum loading time in ms

    const fetchData = async () => {
      const startTime = performance.now();

      try {
        const token = localStorage.getItem("token");
        const data = await Roadmapfetch(course, time, token);
        setRoadmap(data);

        // Calculate remaining time to meet minimum load duration
        const elapsed = performance.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOAD_TIME - elapsed);

        await new Promise((resolve) => setTimeout(resolve, remainingTime));
      } catch (err) {
        console.error("Failed to fetch roadmap:", err);
        navigate("/search");
      } finally {
        setMinimumLoadTimePassed(true);
        setIsLoading(false);
      }
    };

    // Start with artificial delay only if API responds too fast
    const loadTimer = setTimeout(() => {
      setMinimumLoadTimePassed(true);
    }, MIN_LOAD_TIME);

    fetchData();

    return () => clearTimeout(loadTimer);
  }, [course, time, navigate, location.key, location.pathname]);

  const updateURL = (levelIndex, weekIndex) => {
    const level = levels[levelIndex];
    const weeks = Object.keys(roadmap[level] || {});
    const week = weeks[weekIndex];

    if (level && week) {
      navigate(`/roadmap/${level}/${week}`, {
        state: { course, time },
        replace: true, // avoids full remount
      });
    }
  };

  const handleOverview = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        "http://localhost:5001/api/quiz/lock-indexes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
          params: { course, time },
        }
      );
      setLockIndexes(res.data.lockIndexes);
      setActiveTab("overview");
    } catch (error) {
      console.error("Failed to fetch lock indexes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !minimumLoadTimePassed)
    return <LoadingSpinner/>;

  // Parse current indexes based on URL
  const currentLevelIndex =
    levels.indexOf(urlLevel) !== -1 ? levels.indexOf(urlLevel) : 0;
  const weeks = Object.keys(roadmap[levels[currentLevelIndex]] || {});
  const currentWeekIndex =
    weeks.indexOf(urlWeek) !== -1 ? weeks.indexOf(urlWeek) : 0;

  return (
    <div className="roadmap-container">
      <div className="tabs">
        {activeTab === "viewer" ? (
          <button className="tab" onClick={handleOverview}>
            Overview
          </button>
        ) : (
          <button className="tab" onClick={() => setActiveTab("viewer")}>
            Viewer
          </button>
        )}
      </div>

      {activeTab === "viewer" ? (
        <RoadmapViewer
          roadmap={roadmap}
          course={course}
          time={time}
          currentLevelIndex={currentLevelIndex}
          currentWeekIndex={currentWeekIndex}
          updateURL={updateURL}
        />
      ) : (
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
