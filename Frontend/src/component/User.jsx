import React, { useEffect, useState, useRef } from "react";
import { get } from "../api/api";
import { convertToRelativeTime } from "../functions/time";
import { useDispatch, useSelector } from "react-redux";
import { setSelectConv, setMessageUser } from "../features/layoutSlice";

function User() {
    const currentUser = localStorage.getItem("user_id");
    const dispatch = useDispatch();
    const selectedConversation = useSelector((state) => state.Layout?.selectConv);
    
    const sockets = useRef({}); // Store WebSocket connections for all conversations
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [notifications, setNotifications] = useState([]); // Store notifications for new messages

    // Fetch conversations and initialize WebSocket connections when the component mounts
    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            try {
                // Fetch all conversations for the current user
                const response = await get('get-user-conversations');
                setConversations(response);

                // Initialize WebSocket connections for each conversation
                response.forEach(convo => {

                    // Check if a WebSocket connection already exists for this conversation
                    if (!sockets.current[convo.conversation_id]) {
                        const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
                        const socket = new WebSocket(`${wsScheme}://127.0.0.1:9000/ws/chat/${convo.conversation_id}`);

                        // Store the WebSocket connection in the ref
                        sockets.current[convo.conversation_id] = socket;

                        // Handle WebSocket connection open event
                        socket.onopen = () => {
                            console.log(`WebSocket connected for conversation ${convo.conversation_id}`);
                        };

                        // Handle incoming messages from the WebSocket
                        socket.onmessage = (event) => {
                            const data = JSON.parse(event.data);
                            if (data.type === "chat_message") {
                                const messageData = data.message;
                                
                                if(messageData.sender.id.toString() === currentUser){
                                    return;
                                }
                                // Check if the user is currently viewing this conversation
                                const isViewingConversation = convo.conversation_id === selectedConversation;

                                // If the user is NOT viewing the conversation, add a notification
                                if (!isViewingConversation) {
                                    setNotifications((prev) => {
                                        // Check if the notification already exists to avoid duplicates
                                        const isDuplicate = prev.some(
                                            (notification) =>
                                                notification.conversationId === convo.conversation_id &&
                                                notification.message === messageData.content
                                        );

                                        // Only add the notification if it's not a duplicate
                                        if (!isDuplicate) {
                                            return [
                                                ...prev,
                                                {
                                                    conversationId: convo.conversation_id,
                                                    senderId: data.senderId,
                                                    message: messageData.content,
                                                    timestamp: new Date().toISOString(),
                                                },
                                            ];
                                        }
                                        return prev; // Return the previous state if it's a duplicate
                                    });
                                }

                                // Update the conversation's last message in the conversations state
                                setConversations((prevConversations) =>
                                    prevConversations.map((prevConvo) =>
                                        prevConvo.conversation_id === convo.conversation_id
                                            ? {
                                                ...prevConvo,
                                                last_message: {
                                                    content: messageData.content,
                                                    timestamp: messageData.timestamp,
                                                },
                                            }
                                            : prevConvo
                                    )
                                );
                            }
                        };

                        // Handle WebSocket errors
                        socket.onerror = (error) => {
                            console.error("WebSocket error:", error);
                        };

                        // Handle WebSocket connection close event
                        socket.onclose = () => {
                            console.log(`WebSocket closed for conversation ${convo.conversation_id}`);
                            delete sockets.current[convo.conversation_id]; // Remove the closed socket from the ref
                        };
                    }
                });
            } catch (error) {
                console.error('Error fetching conversations:', error);
                setError("Failed to load conversations.");
            } finally {
                setLoading(false);
            }
        };

        // Call the fetchConversations function
        fetchConversations();

        // Cleanup function: Close all WebSocket connections when the component unmounts
        return () => {
            Object.values(sockets.current).forEach(socket => socket.close());
        };
    }, [dispatch]);

    // Handle selecting a conversation
    const selectConvo = (conversationId, otherUserId) => {
        // Dispatch actions to set the selected conversation and message user in Redux
        dispatch(setSelectConv(conversationId));
        dispatch(setMessageUser(otherUserId));

        // Clear notifications for the selected conversation
        setNotifications((prev) =>
            prev.filter((notification) => notification.conversationId !== conversationId)
        );
    };

    // Show a loading spinner while fetching conversations
    if (loading) {
        return <div>Loading conversations...</div>;
    }

    // Show an error message if fetching conversations fails
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="conversations-container">
            {notifications.length > 0 && (
                <div className="notification-badge">
                    <span>{notifications.length}</span>
                </div>
            )}

            {conversations.length === 0 ? (
                <div>No conversations found.</div>
            ) : (
                conversations.map((convo) => (
                    <div
                        key={convo.conversation_id}
                        onClick={() => selectConvo(convo.conversation_id, convo.other_user?.id)}
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

export default User;