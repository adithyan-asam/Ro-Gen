import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import Login from './components/secure/Login';
import Signup from './components/secure/Signup';
import Search from './components/Search';
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
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;