// src/component/Layout.jsx
import React from 'react';
import Search from './component/Search';
import User from './component/User';
import Message from './component/Message';
import Nav from './component/Nav';




const Layout = () => {
  return (
    <div>
      <Nav />
      <div className="body">
        <div className="userArea">
          <Search />
          <User />
        </div>

        <div className="messageArea">
          <Message />
        </div>
      </div>
    </div>
  );
};

export default Layout;
