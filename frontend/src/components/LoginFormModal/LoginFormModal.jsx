import { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import './LoginForm.css';

const LoginFormModal = () => {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password }))
        .then(closeModal)
        .catch(async (res) => {
            // const data = await res.json();
            // if (data && data.errors) {
            //     setErrors(data.errors);
            // }
            await res.json();
            setErrors({ credential: "The Provided credentials were invalid" });
        }
    );
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    await dispatch(sessionActions.loginDemoUser());
    closeModal();
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
                {errors.credential && (<p>{errors.credential}</p>)}
                <button type="submit" disabled={credential.length < 4 || password.length < 6}>Log In</button>
                <button type="button" className="demo-login-button" onClick={handleDemoLogin}>Log in as Demo User</button>
            </form>
        </div>
    </div>
  );
};

export default LoginFormModal;