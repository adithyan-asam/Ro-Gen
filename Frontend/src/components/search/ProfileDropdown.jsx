import { useState, useRef, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import './ProfileDropdown.css';

const ProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="profile-menu" ref={dropdownRef}>
      <button className="menu-butt" onClick={() => setIsOpen(prev => !prev)}>
        <div className="prof-pic">
          {getInitials(user?.name)}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="my-profile-box">
              <button
                className="my-profile-butt"
                onClick={() => navigate('/profile')}
              >
                <User className="user-pic" />
                <span>My Profile</span>
              </button>
            </div>
            <div className="logout-box">
              <button className="logout-butt" onClick={onLogout}>
                <LogOut className="logout-pic" />
                <span>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
