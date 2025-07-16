import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import Login from './components/secure/Login';
import Signup from './components/secure/Signup';
import Search from './components/search/Search';
import RoadmapTabs from './components/roadmap/RoadmapTabs';
import Quiz from './components/quiz/Quiz';
import Profile from './components/profile/Profile';
import ResourcesPage from './components/resources/ResourcesPage';
// import Navbar from './components/Navbar';

function App() {
    return (
        <AuthProvider>
            <Router>
                {/* <Navbar /> */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route 
                        path="/search" 
                        element={
                            <ProtectedRoute>
                                <Search />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/roadmap/:level?/:week?"
                        element={
                            <ProtectedRoute>
                                <RoadmapTabs />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/quiz"
                        element={
                            <ProtectedRoute>
                                <Quiz />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/resources"
                        element={
                            <ProtectedRoute>
                                <ResourcesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;