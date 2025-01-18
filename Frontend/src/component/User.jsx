import React, { useEffect, useState, useRef } from "react"
import { get, post } from "../api/api"
import { convertToRelativeTime } from "../functions/time"
import { useDispatch, useSelector } from "react-redux";
import { setSelectConv, setMessageUser } from "../features/layoutSlice";

function User() {
    const currentUser = localStorage.getItem("user_id");
    const dispatch = useDispatch();
    const userId = useSelector((state) => state.Layout?.selectedUser);
    const socketRef = useRef(null);
    const selectedConversation = useSelector((state) => state.Layout?.selectConv);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversations, setConversations] = useState([]);

    // Initialize WebSocket connection when selected conversation changes
    useEffect(() => {
        if (!selectedConversation) return;

        const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
        socketRef.current = new WebSocket(`${wsScheme}://127.0.0.1:9000/ws/chat/${selectedConversation}`);

        socketRef.current.onopen = () => {
            console.log("Chat WebSocket connected successfully");
        };

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received message in User component:", data);
            
            if (data.type === "chat_message") {
                const messageData = data.message;
                // Update conversations list with new message
                setConversations(prevConversations => {
                    const updatedConversations = prevConversations.map(convo => {
                        if (convo.conversation_id === selectedConversation) {
                            return {
                                ...convo,
                                last_message: {
                                    content: messageData.content, // Access the content from the message object
                                    timestamp: messageData.timestamp // Use the timestamp from the message object
                                }
                            };
                        }
                        return convo;
                    });

                    // Sort conversations by latest message
                    return updatedConversations.sort((a, b) => {
                        const timeA = a.last_message?.timestamp ? new Date(a.last_message.timestamp) : new Date(0);
                        const timeB = b.last_message?.timestamp ? new Date(b.last_message.timestamp) : new Date(0);
                        return timeB - timeA;
                    });
                });
            }
        };

        socketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [selectedConversation]);

    const get_create_convo = async () => {
        if (!userId) return;
        try {
            dispatch(setSelectConv(null));
            dispatch(setMessageUser(null));

            const response = await post('/conversations', { user_id: userId });
            console.log("Conversation API response:", response);

            if (response.conversation_id) {
                dispatch(setSelectConv(response.conversation_id))
                dispatch(setMessageUser(userId));
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

    useEffect(() => {
        getConversations();
    }, [userId]);

    const getConversations = async () => {
        setLoading(true);
        try {
            const response = await get(`get-user-conversations`)
            if (Array.isArray(response)) {
                console.log("current conversations", response)
                // Sort conversations by latest message when fetching
                const sortedConversations = response.sort((a, b) => {
                    const timeA = a.last_message?.timestamp ? new Date(a.last_message.timestamp) : new Date(0);
                    const timeB = b.last_message?.timestamp ? new Date(b.last_message.timestamp) : new Date(0);
                    return timeB - timeA;
                });
                setConversations(sortedConversations);
            } else {
                setConversations([]);
            }
        } catch (error) {
            console.log(error);
            setError("Failed to load conversations.");
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="conversations-container">
            {conversations.length === 0 ? (
                <div>No conversations found.</div>
            ) : (
                conversations.map((convo) => (
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
    );
}

export default User