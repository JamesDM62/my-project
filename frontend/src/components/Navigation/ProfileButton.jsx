import { useDispatch } from "react-redux";
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from 'react-icons/fa';
import * as sessionActions from '../../store/session';
import LoginFormModal from "../LoginFormModal/LoginFormModal";
import SignupFormModal from "../SignupFormModal/SignupFormModal";
import OpenModalMenuItem from "./OpenModalMenuItem";
import './Navigation.css';

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    navigate("/");
  };

  // ✅ Redirect to home after successful signup/login
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <div className="credentials-list">
      <button className="profile-button" onClick={toggleMenu}>
        <div className="profile-icon-container">
          <div className="menu-lines">
            <span className="menu-line"></span>
            <span className="menu-line"></span>
            <span className="menu-line"></span>
          </div>
          <FaUserCircle className="profile-icon" />
        </div>
      </button>
      <ul className={ulClassName} ref={ulRef}>
        {user ? (
          <>
            <li>Hello, {user.firstName}</li>
            <li>{user.email}</li>
            <div className="dropdown-divider"></div>
            <li>
              <button
                className="manage-spots-button"
                onClick={() => {
                  closeMenu();
                  navigate("/spots/current");
                }}
              >
                Manage Spots
              </button>
            </li>
            <li>
              <button
                className="manage-reviews-button"
                onClick={() => {
                  alert("Feature Coming Soon...")
                  closeMenu();
                  // navigate("/reviews/current")
                }}
              >
                Manage Reviews
              </button>
            </li>
            <div className="dropdown-divider"></div>
            <li>
              <button onClick={logout}>Log Out</button>
            </li>
          </>
        ) : (
          <div className="modal-list">
            <>
              <OpenModalMenuItem
                itemText="Log In"
                onItemClick={closeMenu}
                modalComponent={<LoginFormModal />}
              />
            </>
            <>
              <OpenModalMenuItem
                itemText="Sign Up"
                onItemClick={closeMenu}
                modalComponent={<SignupFormModal />}
              />
            </>
          </div>
        )}
      </ul>
    </div>
  );
}


export default ProfileButton;