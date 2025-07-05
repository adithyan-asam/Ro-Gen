import { useState, useRef, useEffect } from 'react';
import { User, LogOut} from 'lucide-react';
import './ProfileDropdown.css';

const ProfileDropdown = ({user,onLogout}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown',handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    },[]);

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <div className='profile-menu' ref={dropdownRef}>
            <button className='menu-butt' onClick={() => setIsOpen(!isOpen)}>
                <div className='prof-pic'>
                    {getInitials(user?.name)}
                </div>
            </button>

            {isOpen && (
                <div className='dropdown'>
                    <div className='my-profile-box'>
                        <button className='my-profile-butt'>
                            <User className='user-pic'/>
                            <span>My Profile</span>
                        </button>
                    </div>
                    <div className='logout-box'>
                        <button className='logout-butt' onClick={() => {
                            setIsOpen(false);
                            onLogout();
                        }}>
                            <LogOut className="logout-pic"/>
                            <span>Log out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;