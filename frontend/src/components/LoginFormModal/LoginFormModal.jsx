import { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import './LoginForm.css';

const LoginFormModal = ({ onLoginSuccess }) => {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
      .then(() => {
        closeModal();
        if (onLoginSuccess) {
          setTimeout(() => onLoginSuccess(), 100); // Navigate after modal closes
        }
      })
      .catch(async (res) => {
        await res.json();
        setErrors({ credential: "The Provided credentials were invalid" });
      });
};


  const handleDemoLogin = async (e) => {
    e.preventDefault();
    await dispatch(sessionActions.loginDemoUser());
    closeModal();
    if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(), 100); // Navigate after modal closes
    }
  };

  return (
    <div className="login-container">
        <div className="login-box">
            <h1>Log In</h1>
            <form onSubmit={handleSubmit}>
                <label className="credentials">
                    Username or Email
                    <input
                        type="text"
                        placeholder="Username or Email"
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        required
                    />
                </label>
                <label className="credentials">
                    Password
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                {errors.credential && (<p className="error-message">{errors.credential}</p>)}
                <button type="submit" className="login-button" disabled={credential.length < 4 || password.length < 6}>Log In</button>
                <button type="button" className="demo-login-button" onClick={handleDemoLogin}>Log in as Demo User</button>
            </form>
        </div>
    </div>
  );
};

export default LoginFormModal;