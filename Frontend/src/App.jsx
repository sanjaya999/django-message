import { useState } from 'react'

import './App.css'
import Nav from './component/Nav.jsx'
import "./assets/css/App.css"
import "./assets/css/Nav.css"
import Search from './component/Search.jsx'
import Message from './component/Message.jsx'
import User from './component/User.jsx'

function App() {

  return (
    <>
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


    </>
  )
}

export default App
