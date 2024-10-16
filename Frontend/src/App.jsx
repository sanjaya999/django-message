import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import "./App.css";
import Nav from "./component/Nav.jsx";
import "./assets/css/App.css";
import "./assets/css/Nav.css";
import Layout from "./Layout.jsx";
import Register from "./component/Login/Register.jsx";
import Login from "./component/Login/Login.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={< Login/>} />

      </Routes>
    </Router>
  );
}

export default App;
