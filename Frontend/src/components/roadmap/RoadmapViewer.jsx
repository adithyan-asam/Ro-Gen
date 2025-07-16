import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import QuizApi from "../api/QuizApi";
import ProfileDropdown from "../search/ProfileDropdown";
import AuthContext from "../../context/AuthContext";
import { FaCheckCircle } from "react-icons/fa";
import LoadingSpinner from "../ui/LoadingSpinner";
import Notification from "../ui/Notification";
import "./RoadmapViewer.css";

const RoadmapViewer = ({
  roadmap,
  course,
  time,
  currentLevelIndex,
  currentWeekIndex,
  updateURL,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(0);
  const { user, logout } = useContext(AuthContext);
  const [notification, setNotification] = useState(null);

  const levels = ["beginner", "intermediate", "advanced"];
  const currentLevel = levels[currentLevelIndex];
  const weeks = Object.entries(roadmap?.[currentLevel] || {});
  const [week, weekData] = weeks[currentWeekIndex] || [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentWeekIndex, currentLevelIndex]);

  if (!roadmap) {
    navigate("/");
    return null;
  }

  const handleQuiz = async (
    course,
    level,
    topic,
    subtopic,
    points,
    weekIndex,
    subtopicIndex,
    time
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = await QuizApi(
        course,
        level,
        topic,
        subtopic,
        points,
        time,
        token
      );
      const currentWeekName = Object.keys(roadmap[level])[weekIndex];

      navigate("/quiz", {
        state: {
          quiz: data,
          course,
          level,
          weekIndex,
          subtopicIndex,
          time,
          weekName: currentWeekName,
          roadmapState: { roadmap, course, time },
        },
      });
    } catch (err) {
      console.error(`Failed to fetch quiz: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const goNextWeek = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:5001/api/quiz/check-score",
        {
          course,
          level: currentLevel,
          weekIndex: currentWeekIndex,
          time,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.allowed) {
        if (res.data.message) {
          setNotification({
            message: res.data.message,
            type: "success",
          });
        }

        if (currentWeekIndex < weeks.length - 1) {
          setDirection(1);
          updateURL(currentLevelIndex, currentWeekIndex + 1);
        } else if (currentLevelIndex < levels.length - 1) {
          const nextWeeks = Object.entries(
            roadmap[levels[currentLevelIndex + 1]] || {}
          );
          if (nextWeeks.length) {
            setDirection(1);
            updateURL(currentLevelIndex + 1, 0);
          }
        }
      } else {
        setNotification({
          message: res.data.message || "Score too low to proceed.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Failed to check score:", err);
      setNotification({
        message: "Error checking score. Try again.",
        type: "error",
      });
    }
  };

  const goPrevWeek = () => {
    if (currentWeekIndex > 0) {
      setDirection(-1);
      updateURL(currentLevelIndex, currentWeekIndex - 1);
    } else if (currentLevelIndex > 0) {
      const prevWeeks = Object.entries(
        roadmap[levels[currentLevelIndex - 1]] || {}
      );
      if (prevWeeks.length) {
        setDirection(-1);
        updateURL(currentLevelIndex - 1, prevWeeks.length - 1);
      }
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.5,
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.3,
      },
    }),
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Notification
        message={notification?.message}
        type={notification?.type}
        onClose={() => setNotification(null)}
      />
      <div className="roadmap-result">
        <ProfileDropdown user={user} onLogout={logout} />

        <div className="roadmap-title">
          <h1>
            <strong>{course}</strong>
          </h1>
        </div>

        <div className="roadmap-level">
          <h2 className="level-title">
            {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)} Level
            :
          </h2>

          <AnimatePresence mode="wait" custom={direction} initial={false}>
            {week && (
              <motion.div
                key={`${currentLevel}-${week}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="week-card animated-week"
                style={{ originX: 0.5 }}
              >
                {weekData.isCompleted && (
                  <div className="week-completed-badge">
                    <span>Completed</span>
                    <FaCheckCircle className="completed-icon" />
                  </div>
                )}

                <div className="week-header">
                  <div className="week-info">
                    <p className="week-num">
                      {week.charAt(0).toUpperCase() + week.slice(1)}
                    </p>
                    <h3 className="week-topic">{weekData.topic}</h3>
                  </div>
                </div>

                <div className="subtopics">
                  {weekData.subtopics.map((sub, i) => (
                    <div key={i} className="sub-container">
                      <div className="subtopic-info">
                        <p className="sub-num">{i + 1}</p>
                        <h4>{sub.subtopic}</h4>
                        <p className="time">{sub.time}</p>
                      </div>
                      <div className="points">
                        <ul>
                          {sub.points.map((point, j) => (
                            <li key={j}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="buttons-container">
                        <button
                          className="quiz-butt"
                          onClick={() =>
                            handleQuiz(
                              course,
                              currentLevel,
                              weekData.topic,
                              sub.subtopic,
                              sub.points,
                              currentWeekIndex,
                              i,
                              time
                            )
                          }
                        >
                          Quiz
                        </button>
                        <button
                          className="resource-butt"
                          onClick={() =>
                            navigate("/resources", {
                              state: {
                                course,
                                level: currentLevel,
                                weekTopic: weekData.topic,
                                subtopicTitle: sub.subtopic,
                                points: sub.points,
                                time,
                              },
                            })
                          }
                        >
                          Resources
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="week-navigation">
            <button
              onClick={goPrevWeek}
              disabled={currentLevelIndex === 0 && currentWeekIndex === 0}
              className="nav-butt"
            >
              Prev
            </button>
            <button
              onClick={goNextWeek}
              disabled={
                currentLevelIndex === levels.length - 1 &&
                currentWeekIndex === weeks.length - 1
              }
              className="nav-butt"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoadmapViewer;
