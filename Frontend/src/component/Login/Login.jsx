import React from 'react'
import { Link } from "react-router-dom";


function Login() {
  return (
    <div className='container'>
      <div className="form">
        <h2>Login</h2>
        <input type="text" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button type="submit">Login</button>
        <h3>Doesnt have an account ? 
        <Link to="/register" className="linktoregister">Register</Link>
      </h3>
      </div>
     
    </div>
  )
}

export default Login