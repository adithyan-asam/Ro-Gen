import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState({});
  const [deletingCourse, setDeletingCourse] = useState(null);
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
    fetchProfile();
    window.addEventListener("focus", fetchProfile);
    return () => {
      window.removeEventListener("focus", fetchProfile);
    };
  }, [location.pathname]);

  const handleGo = (course, time) => {
    try {
      navigate(`/roadmap`, { state: { course, time } });
    } catch (err) {
      console.log(`Failed to fetch roadmap: ${err.message}`);
    }
  };

  const handleDelete = async (course, time) => {
    try {
      const key = course + time;
      setDeletingCourse(key);

      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5001/api/roadmap/delete",
        { course, time },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(res.data);

      await fetchProfile(); // Refresh after deletion
    } catch (err) {
      console.log("error in deleting roadmap: ", err);
    } finally {
      setDeletingCourse(null);
    }
  };

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

  if (!profileData) return <LoadingSpinner />;

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
        {courses.map((course, idx) => {
          const uniqueKey = course.course + course.totalTime;
          const isDeleting = deletingCourse === uniqueKey;

          return (
            <div key={idx} className="course-box">
              <div className="course-header">
                <h1>{course.course}</h1>
                <div className="course-stats">
                  <p className="level">Total Time: {course.totalTime}</p>
                  <p>Total Weeks: {course.weekScores.length}</p>
                  <p>Completed Weeks: {course.completedWeeks}</p>
                </div>
              </div>

              <div className="butt-ons">
                <div>
                  <button
                    className="toggle-weeks-btn"
                    onClick={() => toggleWeekList(idx)}
                  >
                    {expandedCourses[idx] ? "Hide Weeks" : "Show Weeks"}
                  </button>
                </div>
                <div className="to-butt">
                  <button
                    className="viewer-butt"
                    onClick={() =>
                      handleGo(course.course, course.totalTime)
                    }
                    disabled={isDeleting}
                  >
                    View
                  </button>
                  <button
                    className="delete-butt"
                    onClick={() =>
                      handleDelete(course.course, course.totalTime)
                    }
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "🗑"}
                  </button>
                </div>
              </div>

              {expandedCourses[idx] && (
                <div className="week-list">
                  {course.weekScores.map((week, i) => (
                    <div key={i} className="week-item">
                      <div>
                        <span className="level">Week {i + 1}</span>:{" "}
                        {week.topic}
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
          );
        })}
      </div>
    </div>
  );
};

export default Profile;
