import React, { useEffect, useState } from "react"
import { get ,post  } from "../api/api"
import { convertToRelativeTime } from "../functions/time"


function User ({userId ,  onSelectConvo ,onSideSelect}){
    const currentUser = localStorage.getItem("user_id");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversation , setconversation] = useState([])
    const [convoFound, setConvoFound] = useState(null);
    const [currentConvo, setCurrentConvo] = useState("");
    
    useEffect(() => {
        setCurrentConvo("");
        setConvoFound(null);
    }, [userId]);

        useEffect(() => {
            console.log("searched and clicked " , userId);
    
            const get_create_convo = async () => {
                if (!userId) return; // Exit early if no userId
              try {
                const response = await post('/conversations', {
                  user_id: currentUser,
                  user: userId
                });
                
                if (response.message?.includes("Existing conversation found.")) {
                  setConvoFound(true);
                  console.log("conversation found after fetch" , response)
                  setCurrentConvo(response.conversation_id);

                  onSelectConvo(response.conversation_id);
                  onSideSelect(userId); 

                  // Sort messages by timestamp when receiving them
                 
                } else {
                  console.log("conversation created" , response)
                  if (response.conversation_id) {
                    onSelectConvo(response.conversation_id);
                    onSideSelect(userId);
                }
                }
                getconversation();

              } catch (error) {
                console.error('Error initializing conversation:', error);
              }
            };

            if (userId) {  // Only run if userId is present
                get_create_convo();
            }
          }, [ currentUser, userId]);
    



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