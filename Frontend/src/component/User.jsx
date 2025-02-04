import React, { useEffect, useState, useRef } from "react";
import { get,post } from "../api/api";
import { convertToRelativeTime } from "../functions/time";
import { useDispatch, useSelector } from "react-redux";
import { setSelectConv, setMessageUser } from "../features/layoutSlice";
import Call from "./Call";

function User() {
    const currentUser = localStorage.getItem("user_id");
    const [isCallActive, setIsCallActive] = useState(false);
    const dispatch = useDispatch();
    const selectedConversation = useSelector((state) => state.Layout?.selectConv);
    const sockets = useRef({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [notificationCounts, setNotificationCounts] = useState({}); // Track notification counts per conversation

    useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            try {
                const response = await get('get-user-conversations');
                // Initialize conversations and notification counts
                const initialNotificationCounts = {};
                response.forEach(convo => {
                    initialNotificationCounts[convo.conversation_id] = 0; // Initialize notification count to 0
                });
                setNotificationCounts(initialNotificationCounts);
                setConversations(response);

                response.forEach(convo => {
                    if (!sockets.current[convo.conversation_id]) {
                        const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
                        const socket = new WebSocket(`${wsScheme}://127.0.0.1:9000/ws/chat/${convo.conversation_id}`);
                        sockets.current[convo.conversation_id] = socket;

                        socket.onopen = () => {
                            console.log(`WebSocket connected for conversation ${convo.conversation_id}`);
                        };

                        socket.onmessage = (event) => {
                            const data = JSON.parse(event.data);
                            if (data.type === "chat_message") {
                                const messageData = data.message;

                                // Skip notifications for messages sent by the current user
                                if (messageData.sender.id.toString() === currentUser) {
                                    // Update the sender's conversation list with the new message
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
                                    return;
                                }

                                // Skip notifications if the user is currently viewing this conversation
                                const isViewingConversation = convo.conversation_id === selectedConversation;
                                if (!isViewingConversation) {
                                    // Increment the notification count for this conversation
                                    setNotificationCounts((prevCounts) => ({
                                        ...prevCounts,
                                        [convo.conversation_id]: (prevCounts[convo.conversation_id] || 0) + 1,
                                    }));
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

                        socket.onerror = (error) => {
                            console.error("WebSocket error:", error);
                        };

                        socket.onclose = () => {
                            console.log(`WebSocket closed for conversation ${convo.conversation_id}`);
                            delete sockets.current[convo.conversation_id];
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

        fetchConversations();

        return () => {
            Object.values(sockets.current).forEach(socket => socket.close());
        };
    }, [dispatch, currentUser, selectedConversation]);

    const selectConvo = (conversationId, otherUserId) => {
        dispatch(setSelectConv(conversationId));
        dispatch(setMessageUser(otherUserId));

        // Clear the notification count for the selected conversation
        setNotificationCounts((prevCounts) => ({
            ...prevCounts,
            [conversationId]: 0, // Reset notification count to 0
        }));
    };
    const startCall = (conversationId) => {
        setIsCallActive(true);
    };

    const endCall = () => {
        setIsCallActive(false);
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
                        onClick={() => selectConvo(convo.conversation_id, convo.other_user?.id)}
                        className="conversation-card"
                    >
                        <div className="user-name">
                            {convo.other_user?.fullname || "Unknown User"}
                            {/* Show notification count as a badge */}
                            {notificationCounts[convo.conversation_id] > 0 && (
                                <span className="notification-badge">
                                    {notificationCounts[convo.conversation_id]}
                                </span>
                            )}
                        </div>
                        <div className="message-content">{convo.last_message?.content || "No messages yet."}</div>
                        <div className="timestamp">
                            {convo.last_message?.timestamp
                                ? convertToRelativeTime(convo.last_message.timestamp)
                                : ""}
                        </div>
                        <button onClick={() => startCall(convo.conversation_id)}>Start Call</button>

                    </div>
                ))
            )}
            {isCallActive && (
                <Call
                    conversationId={selectedConversation}
                    onEndCall={endCall}
                    socket={sockets.current[selectedConversation]} // Pass the existing WebSocket
                />
            )}
        </div>
    );
}

export default User;