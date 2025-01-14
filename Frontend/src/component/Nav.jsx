import React from "react";
import { NavLink } from "react-router-dom";

function Nav(){
    const currentuser = localStorage.getItem("fullname")
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const handleLogout =()=>{
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('fullname');
        localStorage.removeItem('user_id');
        localStorage.removeItem('authToken');
        window.location.href="/login"

    }
    return(
        <>
        <header className="nav">
            <div className="logo">
                Logo<img src="#" alt="" srcset="" />
            </div>
            <ul className="list right-section">
                <li>
                    <NavLink className="navNAV" to="/" >Notification</NavLink>
                </li>
                <li>
                    <NavLink className="navNAV" to="/" >profile</NavLink>
                </li>
                <li>
                    {currentuser}
                </li>
                <li>
                {isLoggedIn ? (
                        <NavLink className="navNAV" onClick={handleLogout}>
                           Logout
                        </NavLink>
                    ) : (
                        <NavLink className="navNAV" to="/login" >
                            Login
                        </NavLink>
                    )}
                </li>
            </ul>
        </header>
        </>
    )
}

export default Nav;