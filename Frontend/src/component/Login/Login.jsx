import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import { clearAlertMessage, loginUser } from "../../store/auth/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, alertMessage } = useSelector(state => state.auth);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard'); // Redirect to dashboard or home page
    }
    // Clear alert message when component unmounts
    return () => dispatch(clearAlertMessage());
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(data));
  };

  return (
    <div className="container">
      {alertMessage && (
        <div className={`alert ${!error ? "success" : "error"}`}>
          {alertMessage}
        </div>
      )}
      <div className="register">
        <h1>Login</h1>
        <form className="registerForm" onSubmit={handleSubmit}>
          <div className="inner">
            <input
              type="text"
              name="email"
              className="login-input"
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          <div className="inner">
            <input
              type="password"
              name="password"
              onChange={handleChange}
              className="login-input"
              placeholder="Password"
              required
            />
          </div>
          <div className="loginB">
            <input 
              type="submit" 
              className="loginButton" 
              value={loading ? "Logging in..." : "Login"} 
              disabled={loading}
            />
          </div>
          <h3>
            Don't have an account?
            <Link to="/register" className="linktoregister">
              Register
            </Link>
          </h3>
        </form>
      </div>
    </div>
  );
}

export default Login;