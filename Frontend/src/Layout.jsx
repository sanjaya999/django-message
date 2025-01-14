// src/component/Layout.jsx
import React, { useState } from 'react';
import Search from './component/Search';
import User from './component/User';
import Message from './component/Message';
import Nav from './component/Nav';





const Layout = () => {
  const[selectedUser , setSelectedUser] = useState(null)
  const [selectConv , setselectConv] = useState(null)
  const [messageUser , setmessageUser] = useState(null)

  const handleUserSelect = (userId) => {
    console.log("Layout: New user selected:", userId);
    setSelectedUser(userId);
  
    // Only reset states if selecting a different user
    if (userId !== selectedUser) {
      setmessageUser(null);
      setselectConv(null);
    }
  };
  

  const handleConvo = (conversationId)=>{
    setselectConv(conversationId)
  }

  const MessageUserSelect = (otherUserId)=>{
    setmessageUser(otherUserId)
  }
  return (
    <div>
      <Nav />
      <div className="body">
        <div className="userArea">
          <Search  onSelectUser = {handleUserSelect}/>
          <User userId={selectedUser}
          onSelectConvo={handleConvo}
          onSideSelect={MessageUserSelect}/>
        </div>

      {selectConv && messageUser && (
        <div className="messageArea">
        <Message
         key={`${selectConv}-${messageUser}`}
         conversationId={selectConv}
         otherUser={messageUser} />
      </div>
      )}
        
      </div>
    </div>
  );
};

export default Layout;
