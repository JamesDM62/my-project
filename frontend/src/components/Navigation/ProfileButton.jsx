import { useDispatch } from "react-redux";
import { useEffect, useState, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import * as sessionActions from '../../store/session';
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignupFormModal/SignupFormModal";

function ProfileButton({ user }) {
    const dispatch = useDispatch();
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();

    const toggleMenu = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
          if (!ulRef.current.contains(e.target)) {
            setShowMenu(false);
          }
        };
    
        document.addEventListener('click', closeMenu);
    
        return () => document.removeEventListener('click', closeMenu);
      }, [showMenu]);
  
      const logout = (e) => {
        e.preventDefault();
        dispatch(sessionActions.logout());
      };
  
    const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");
  
    return (
      <div className="credentials-list">
        <button onClick={toggleMenu}>
          <FaUserCircle />
        </button>
        <ul className={ulClassName} ref={ulRef}>
          {user ? (
            <>
              <li>{user.username}</li>
              <li>{user.firstName} {user.lastName}</li>
              <li>{user.email}</li>
              <li>
                <button onClick={logout}>Log Out</button>
              </li>
            </>
          ) : (
            <div className="modal-list">
              <li>
                <OpenModalButton
                  buttonText="Log In"
                  modalComponent={<LoginFormModal />}
                />
              </li>
              <li>
                <OpenModalButton
                  buttonText="Sign Up"
                  modalComponent={<SignupFormModal />}
                />
              </li>
            </div>
          )}
        </ul>
      </div>
    );
  }
  

export default ProfileButton;