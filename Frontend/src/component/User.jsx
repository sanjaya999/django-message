import React, { useEffect, useState } from "react"
import { get } from "../api/api"
import { convertToRelativeTime } from "../functions/time"

function User ({userId ,  onSelectConvo ,onSideSelect}){
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversation , setconversation] = useState([])
    
    
    useEffect(()=>{
        getconversation();
    },[userId])

    const getconversation =async()=>{
        setLoading(true);
        try {
            const response = await get(`get-user-conversations`)
            if(Array.isArray(response)){
                setconversation(response)
            }else{
                setconversation([])
            }
            
        } catch (error) {
                console.log(error)
                setError("Failed to load conversations.");

        }finally {
            setLoading(false);
        }
    }

    const selectConvo = (conversationId , otherUserId)=>{
        onSelectConvo(conversationId)
        onSideSelect(otherUserId)
    }

    if (loading) {
        return <div>Loading conversations...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }


    return(

        <>
         <div className="conversations-container">
            {conversation.length === 0 ? (
                <div>No conversations found.</div>
            ) : (
                conversation.map((convo) => (
                    <div
                        key={convo.conversation_id}
                        onClick={() =>
                            selectConvo(convo.conversation_id, convo.other_user?.id)
                        }
                        className="conversation-card"
                    >
                        <div className="user-name">{convo.other_user?.fullname || "Unknown User"}</div>
                        <div className="message-content">{convo.last_message?.content || "No messages yet."}</div>
                        <div className="timestamp">
                            {convo.last_message?.timestamp
                                ? convertToRelativeTime(convo.last_message.timestamp)
                                : ""}
                        </div>
                    </div>
                ))
            )}
        </div>
        </>
    )
}

export default User