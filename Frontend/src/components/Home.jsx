import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">AI-Powered Personalized Learning</h1>
        <p className="home-subtitle">Master new skills with adaptive lessons tailored just for you</p>
        
        <button 
          className="home-button"
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;