import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Quiz.css";

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { quiz, course, level, weekIndex, subtopicIndex, time, weekName } =
    location.state || {};

  const questions = quiz?.questions || [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const correctIndex = Number(currentQuestion.answerIndex);

  useEffect(() => {
    if (!quiz) {
      navigate(-1);
    }
  }, [quiz, navigate]);

  const handleOptionSelect = (index) => {
    if (showFeedback) return;
    setSelectedOptionIndex(index);
    setShowFeedback(true);
    if (index === correctIndex) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setShowFeedback(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinish = async () => {
    const score = Math.round((correctCount / questions.length) * 100);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/quiz/submit-score",
        {
          course,
          level,
          weekIndex,
          subtopicIndex,
          score,
          time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.completed && res.data.unlocked) {
        alert(res.data.message);
      }

      // Reconstruct return URL and navigate with course/time only
      navigate(`/roadmap/${level}/${weekName}`, {
        state: { course, time },
      });
    } catch (error) {
      console.error("Error submitting quiz score:", error);
      alert("Failed to save score. Please try again.");
    }
  };


  if (!quiz) return null;

  return (
    <>
      <div className="quiz-container">
        <h1 className="quiz-title">Quiz</h1>

        {!isFinished ? (
          <div className="question-card">
            <h2 className="question-text">
              {currentQuestionIndex + 1}. {currentQuestion.question}
            </h2>

            <ul className="options-list">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === correctIndex;
                const isSelected = index === selectedOptionIndex;
                const buttonClass = showFeedback
                  ? isCorrect
                    ? "option-button correct"
                    : isSelected
                    ? "option-button incorrect"
                    : "option-button"
                  : "option-button";

                return (
                  <li key={index} className="option-item">
                    <button
                      className={buttonClass}
                      onClick={() => handleOptionSelect(index)}
                      disabled={showFeedback}
                    >
                      {index + 1}. {option}
                    </button>
                  </li>
                );
              })}
            </ul>

            {showFeedback && (
              <div className="feedback-box">
                <p className="feedback-result">
                  {selectedOptionIndex === correctIndex
                    ? "✅ Correct!"
                    : "❌ Incorrect."}
                </p>
                <p>
                  <strong>Reason:</strong> {currentQuestion.reason}
                </p>
              </div>
            )}

            <button
              className="next-button"
              onClick={handleNextQuestion}
              disabled={!showFeedback}
            >
              {currentQuestionIndex < questions.length - 1
                ? "Next ➜"
                : "Finish"}
            </button>
          </div>
        ) : (
          <div className="question-card">
            <h2 className="question-text">🎉 Quiz Complete!</h2>
            <p className="quiz-result">
              Your Score: <strong>{correctCount}</strong> / {questions.length}
            </p>
            <button className="next-button" onClick={handleFinish}>
              Return
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Quiz;
