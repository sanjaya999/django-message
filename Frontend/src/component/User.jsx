import React, { useEffect, useState } from "react"
import { get ,post  } from "../api/api"
import { convertToRelativeTime } from "../functions/time"


function User ({userId ,  onSelectConvo ,onSideSelect}){
    const currentUser = localStorage.getItem("user_id");
    console.log("search selected id in userjsx" , userId);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversation , setconversation] = useState([])
    const [convoFound, setConvoFound] = useState(null);
    const [currentConvo, setCurrentConvo] = useState("");
    


    const get_create_convo = async () => {
        if (!userId) return; // Exit early if no userId
        try {
          onSelectConvo(null); // Reset conversation ID
          onSideSelect(null);  // Reset other user
      
          const response = await post('/conversations', { user_id: currentUser, user: userId });
          console.log("Conversation API response:", response);
      
          if (response.conversation_id) {
            setCurrentConvo(response.conversation_id);
            onSelectConvo(response.conversation_id); // Set conversation ID
            onSideSelect(userId);                   // Set other user ID
          } else {
            console.error("Failed to create or fetch conversation:", response);
          }
        } catch (error) {
          console.error('Error initializing conversation:', error);
        }
      };
      
      useEffect(() => {
        if (userId) get_create_convo();
      }, [userId]);
      
    



    useEffect(()=>{
        getconversation();
    },[userId])

    const getconversation =async()=>{
        setLoading(true);
        try {
            const response = await get(`get-user-conversations`)
            if(Array.isArray(response)){
                console.log("current message" , response)
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
        console.log("other user in userjsx", otherUserId);
        
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