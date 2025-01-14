import React, { useEffect, useState, useRef } from 'react';
import { get, post } from '../api/api';
import { convertToRelativeTime } from '../functions/time';

function Message({ conversationId, otherUser }) {
  console.log("other user " , otherUser);
  console.log("conversation id" , conversationId);
  
  
  const messagesEndRef = useRef(null);
  const currentUser = localStorage.getItem("user_id");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //initialize socket
  useEffect(() => {
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    socketRef.current = new WebSocket(`${wsScheme}://127.0.0.1:9000/ws/chat/${conversationId}`);

    // Add connection handling
    socketRef.current.onopen = () => {
        console.log("WebSocket connected successfully");
    };

    socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data); // Debug incoming messages
        if (data.type === "chat_message") {
            setMessages((prev) => [...prev, data.message].sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            ));
            scrollToBottom();
        }
    };

    socketRef.current.onclose = () => {
        console.log("WebSocket connection closed.");
    };

    return () => {
        if (socketRef.current) {
            socketRef.current.close();
        }
    };
}, [conversationId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await get(`getmessage/${conversationId}`);
        if (response.results?.messages) {
          // Sort messages by timestamp when fetching
          const sortedMessages = response.results.messages.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
          setMessages(sortedMessages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({
                type: 'chat_message',
                message: newMessage,
                user_id: currentUser
            }));
            setNewMessage('');
        } else {
            console.error("WebSocket is not connected");
            // Optionally retry connection or show error to user
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

  const formatTime = (timestamp) => {
    
    return convertToRelativeTime(timestamp)
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((message) => {
          const isCurrentUser = message.sender.id.toString() === currentUser;
          
          return (
            <div 
              key={message.id} 
              className={`message-wrapper ${isCurrentUser ? 'message-wrapper-right' : 'message-wrapper-left'}`}
            >
              <div className={`message-content ${isCurrentUser ? 'message-content-reverse' : ''}`}>
               
                <div>
                  <div className={`message-bubble ${isCurrentUser ? 'message-bubble-right' : 'message-bubble-left'}`}>
                    <p>{message.content}</p>
                    <div className={`timestamp ${isCurrentUser ? 'timestamp-right' : 'timestamp-left'}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="message-input"
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Message;