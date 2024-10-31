import React,{useEffect, useState} from  "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./assets/css/App.css";
import "./assets/css/Nav.css";
import "./assets/css/login.css";
import "./assets/css/User.css";
import "./assets/css/Search.css";
import Layout from "./Layout.jsx";
import Register from "./component/Login/Register.jsx";
import Login from "./component/Login/Login.jsx";
import Cookies from 'js-cookie';




function App() {
    const isLoggedIn = localStorage.getItem('isLoggedIn')
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={ isLoggedIn? <Layout /> : <Login /> }
        />
        <Route path="home" element={isLoggedIn? <Layout />:<Login />} />

        <Route path="register" element={isLoggedIn? <Layout />:<Register />} />
        <Route path="login" element={isLoggedIn? <Layout/>:<Login  />} />

      </Routes>
    </Router>
  );
}

export default App;