import React, { useEffect, useState } from 'react'
import { get, post } from '../api/api'

function Message({conversationId ,otherUser}) {
  const currentUser = localStorage.getItem("user_id")

  const [convoFound , setconvoFound] = useState(null)
  const [currentConvo , setcurrentConvo] = useState("")
  const [Message , setMessage] = useState("")

  useEffect(()=>{
    //check if conversation exist or not and create new  if not
    const get_create_convo =async()=>{
      try {
        const response = await post(`/conversations`,
          {
            "user_id": `${currentUser}`,
             "user" : `${otherUser}`
          }
        )
        console.log("check convo" , response)
        if(response.message.includes("Existing conversation found.")){
          setconvoFound(true)
          setMessage(response)
        }else{
          setcurrentConvo(response.conversation_id)
        }
      
      } catch (error) {
        console.log(error)
        
      }
    }
    get_create_convo();
   
  },[conversationId])

  //fetch conversation
  useEffect(()=>{
    const fetchMessage =async ()=>{
      try {
        const response = await get(`getmessage/${conversationId}`)
        console.log("these are messages" , response.results);
        
      } catch (error) {
        console.log(error)
      }
    }
    fetchMessage();
  },[conversationId])
  return (

    <div>Message {conversationId}</div>
  )
}

export default Message