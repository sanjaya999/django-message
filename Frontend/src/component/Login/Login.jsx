import React from "react";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="container">
      <div className="register">
        <h1>Login</h1>

        <form action="" className="registerForm">
          <div className="inner">
            <input type="text" className="login-input" placeholder="Email" />
          </div>
          <div className="inner">
            <input
              type="password"
              className="login-input"
              placeholder="Password"
            />
          </div>
          <div className="loginB">
            <input type="submit" className="loginButton" value="Login" />
          </div>
          <h3>
            Doesnt have an account ?
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
