import { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import './LoginForm.css';

const LoginFormPage = () => {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password })).catch(
        async (res) => {
            const data = await res.json();
            if (data?.errors) setErrors(data.errors);
        }
    );
  };

  return (
    <div className="login-container">
        <div className="login-box">
            <h1>Log In</h1>
            <p>Unlock a world of rewards with one account across Expedia, Hotels.com, and Vrbo.</p>
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
                {errors.credential && <p>{errors.credential}</p>}
                <button type="submit">Log In</button>
            </form>
        </div>
    </div>
  );
};

export default LoginFormPage;