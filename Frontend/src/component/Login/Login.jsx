import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { post } from "../../api/api";
import {generateKeys , storePrivateKey} from "../../Encry/rsa"

function Login() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };


const handleSubmit = async (e) => {
    e.preventDefault();
try {
      const response = await post(`/login` ,data)
      if(response.status === "200"){
        localStorage.setItem("authToken", response.access_token);
        localStorage.setItem("fullname", response.user_name);
        localStorage.setItem("user_id", response.user_id);
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("userId" , response.user_id)

        if (!response.publicKey) {
          const { publicKey, privateKey } = generateKeys();
          
          storePrivateKey(privateKey);

          try{await post("/key", { public_key: publicKey });}
          catch(error){
            console.log("key error" , error)
          }
        }
        window.location.href = '/home';

      }
  
} catch (error) {
  const errorMessage = error.response.data.message || "";
  if (errorMessage.includes("Invalid email or password")) {
    setAlertMessage("Invalid email or password");
    setIsSuccess(false);
  } else if(errorMessage.includes("User does not exist")){
    setAlertMessage("User does not exist");
    setIsSuccess(false);
  }
  
}    
  };

  return (
    <div className="container">
      {alertMessage && (
          <div className={`alert ${isSuccess ? "success" : "error"}`}>
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
              value="Login"
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