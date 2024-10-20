import React from "react";
import { NavLink } from "react-router-dom";

function Nav(){


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
                    <button className="Login">
                        <NavLink  to="/login">Login</NavLink>
                    </button>
                </li>
            </ul>
        </header>
        </>
    )
}

export default Nav;