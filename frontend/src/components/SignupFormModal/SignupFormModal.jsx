import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import * as sessionActions from '../../store/session';
import './SignupForm.css';

const SignupFormModal = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const { closeModal } = useModal();

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        let validationErrors = {};
    
        if (!firstName) validationErrors.firstName = "Must enter a first name.";
        if (!lastName) validationErrors.lastName = "Must enter a last name.";
        if (!email) validationErrors.email = "Please provide a valid email.";
        if (!username) validationErrors.username = "Please provide a username with at least 4 characters.";
        if (username.length < 4) validationErrors.username = "Username must be at least 4 characters.";
        if (!password) validationErrors.password = "Password must be 6 characters or more.";
        if (password.length < 6) validationErrors.password = "Password must be at least 6 characters.";
        if (password !== confirmPassword) validationErrors.confirmPassword = "Confirm Password field must be the same as the Password field";
    
        // If any errors exist, set them and stop submission
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    
        // If no errors, attempt signup
        try {
            await dispatch(
                sessionActions.signup({
                    email,
                    username,
                    firstName,
                    lastName,
                    password
                })
            );
            closeModal();
        } catch (res) {
            const data = await res.json();
            if (data?.errors) {
                setErrors((prevErrors) => ({ ...prevErrors, ...data.errors }));
            }
        }
    };
    

    return(
        <div className="signup-container">
            <div className="signup-box">

                <h1>Sign Up</h1>
                <form onSubmit={handleSubmit}>
                    <label className="signup-info">
                        First Name
                        {errors.firstName && <p className="err-message">{errors.firstName}</p>}
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required 
                        />
                    </label>
                    <label className="signup-info">
                        Last Name
                        {errors.lastName && <p className="err-message">{errors.lastName}</p>}
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required 
                        />
                    </label>
                    <label className="signup-info">
                        Email
                        {errors.email && <p className="err-message">{errors.email}</p>}
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </label>
                    <label className="signup-info">
                        Username
                        {errors.username && <p className="err-message">{errors.username}</p>}
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required 
                        />
                    </label>
                    <label className="signup-info">
                        Password
                        {errors.password && <p className="err-message">{errors.password}</p>}
                        <input
                            type="text"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </label>
                    <label className="signup-info">
                        Confirm Password
                        {errors.confirmPassword && <p className="err-message">{errors.confirmPassword}</p>}
                        <input
                            type="text"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required 
                        />
                    </label>
                    <button type="submit" className="signup-button" disabled={!email || !username || !firstName || !lastName || !password || !confirmPassword || username.length < 4 || password.length < 6}>
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignupFormModal;