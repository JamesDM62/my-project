import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);

    return (
        <ul className="navbar">
            <li className="navbar-title">
                <NavLink to="/" className="navbar-logo">
                    <img src="/favicon.ico" alt="App Logo" className="logo" />
                    <span className="app-title">A Taste of Home</span>
                </NavLink>
            </li>
            {sessionUser && (
                <li>
                    <NavLink to="/spots/new" className="create-spot-button">
                        Create a New Spot
                    </NavLink>
                </li>
            )}
            {isLoaded && (
                <li>
                    <ProfileButton user={sessionUser} />
                </li>
            )}
        </ul>
    );
}

export default Navigation;