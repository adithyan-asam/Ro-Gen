import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";
import "./Profile.css";

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const location = useLocation();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfileData(res.data);
    } catch (err) {
      console.error("Error fetching profile data:", err);
    }
  };

  useEffect(() => {
    fetchProfile(); // refetch on route navigation

    // refetch on tab focus
    window.addEventListener("focus", fetchProfile);

    return () => {
      window.removeEventListener("focus", fetchProfile);
    };
  }, [location.pathname]);

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleWeekList = (courseIndex) => {
    setExpandedCourses((prev) => ({
      ...prev,
      [courseIndex]: !prev[courseIndex],
    }));
  };

  if (!profileData) return <LoadingSpinner/>;

  const { user, courses } = profileData;

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="avatar">{getInitials(user.name)}</div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <p>Joined on: {new Date(user.createdAt).toLocaleDateString()}</p>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="course-grid">
        {courses.map((course, idx) => (
          <div key={idx} className="course-box">
            <div className="course-header">
              <h1>{course.course}</h1>
              <div className="course-stats">
                <p className="level">Total Time: {course.totalTime}</p>
                <p>Total Weeks: {course.weekScores.length}</p>
                <p>Completed Weeks: {course.completedWeeks}</p>
              </div>
            </div>

            <button
              className="toggle-weeks-btn"
              onClick={() => toggleWeekList(idx)}
            >
              {expandedCourses[idx] ? "Hide Weeks" : "Show Weeks"}
            </button>

            {expandedCourses[idx] && (
              <div className="week-list">
                {course.weekScores.map((week, i) => (
                  <div key={i} className="week-item">
                    <div>
                      <span className="level">Week {i + 1}</span>: {week.topic}
                    </div>
                    <div
                      className={`score ${
                        week.avgScore === "-"
                          ? "gray"
                          : week.avgScore >= 75
                          ? "green"
                          : week.avgScore >= 50
                          ? "yellow"
                          : "red"
                      }`}
                    >
                      {week.avgScore !== "-" ? `${week.avgScore}%` : "-- --"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
