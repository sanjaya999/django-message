import React from "react";

function Nav(){


    return(
        <>
        <header className="nav">
            <div className="logo">
                Logo<img src="#" alt="" srcset="" />
            </div>
            <ul className="list right-section">
                <li>
                    notification
                </li>
                <li>
                    profile
                </li>
                <li>
                    <button className="Login">Login</button>
                </li>
            </ul>
        </header>
        </>
    )
}

export default Nav;