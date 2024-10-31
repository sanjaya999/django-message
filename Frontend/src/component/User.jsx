import React, { useEffect, useState } from "react"
import { get } from "../api/api"
import { convertToRelativeTime } from "../functions/time"

function User ({userId ,  onSelectConvo ,onSideSelect}){
    const [conversation , setconversation] = useState([])
    
    
    useEffect(()=>{
        
        getconversation();
    },[userId])

    const getconversation =async()=>{
        try {
            const response = await get(`get-user-conversations`)
            setconversation(response)
            
        } catch (error) {
                console.log(error)
        }
    }

    const selectConvo = (conversationId , otherUserId)=>{
        onSelectConvo(conversationId)
        onSideSelect(otherUserId)
    }




    return(

        <>
        <div className="conversations-container">
            {conversation?.map((convo) => (
                <div key={convo.conversation_id} 
                onClick={()=>selectConvo(convo.conversation_id , convo.other_user.id)}
                className="conversation-card"> 
                    <div className="user-name">{convo.other_user.fullname}</div>
                    <div className="message-content">{convo.last_message.content}</div>
                    <div className="timestamp">{convertToRelativeTime(convo.last_message.timestamp)}</div>
                </div>
            ))}
        </div>
        </>
    )
}

export default User