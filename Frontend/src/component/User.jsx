import React, { useEffect, useState } from "react"
import { get ,post  } from "../api/api"
import { convertToRelativeTime } from "../functions/time"
import { useDispatch, useSelector } from "react-redux";
import { setSelectConv , setMessageUser } from "../features/layoutSlice";


function User (){
    const currentUser = localStorage.getItem("user_id");
    const dispatch = useDispatch();
    //fetch selected user from search => state
    const userId = useSelector((state)=>state.Layout?.selectedUser)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversation , setconversation] = useState([])
    


    const get_create_convo = async () => {
        if (!userId) return; // Exit early if no userId
        try {
            dispatch(setSelectConv(null));
            dispatch(setMessageUser(null));

          const response = await post('/conversations', { user_id: currentUser, user: userId });
          console.log("Conversation API response:", response);
      
          if (response.conversation_id) {
            setCurrentConvo(response.conversation_id);
            dispatch(setSelectConv(response.conversation_id))
             dispatch(setMessageUser(userId));                 // Set other user ID
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

    const selectConvo = (conversationId, otherUserId) => {
        dispatch(setSelectConv(conversationId));
        dispatch(setMessageUser(otherUserId));
      };

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