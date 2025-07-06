// Create a new file: components/LoadingSpinner.jsx
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p className="loading-text">
        <span className="preparing-word">Loading...</span>{' '}
      </p>
    </div>
  );
};

export default LoadingSpinner;