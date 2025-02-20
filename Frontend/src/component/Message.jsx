import React, { useEffect, useState, useRef, useCallback } from 'react';
import { get, post } from '../api/api';
import { convertToRelativeTime } from '../functions/time';
import { useSelector } from 'react-redux';
import Call from './Call';
function Message() {

  const conversationId = useSelector((state) => state.Layout?.selectConv);
  const otherUser = useSelector((state) => state.Layout?.messageUser);
  console.log("convoID and otheruser" , conversationId , otherUser)
  const messagesEndRef = useRef(null);
  const currentUser = localStorage.getItem("user_id");
  const [imageFile, setImageFile] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const [isCalling, setIsCalling] = useState(false); // State to manage call UI

  const backendBaseUrl = 'http://localhost:9000';
 
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  //initialize socket
  useEffect(() => {
    if (!conversationId) return;

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
          const message = data.message;
          if (message.image && !message.image.startsWith(backendBaseUrl)) {
            message.image = `${backendBaseUrl}${message.image}`;
          }
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
}, [conversationId]);

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

  const handleStartCall = () => {
    setIsCalling(true); // Show the Call component
};

// Handle ending a call
const handleEndCall = () => {
    setIsCalling(false); // Hide the Call component
};

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        if (imageFile) {
          // Convert image file to Base64
          const reader = new FileReader();
          reader.onload = () => {
            const base64Image = reader.result;
            socketRef.current.send(JSON.stringify({
              type: 'chat_message',
              message: newMessage,
              image: base64Image, // Send Base64 image
              user_id: currentUser
            }));
            setNewMessage('');
            setImageFile(null);
          };
          reader.readAsDataURL(imageFile);
        } else {
          // Send text message
          socketRef.current.send(JSON.stringify({
            type: 'chat_message',
            message: newMessage,
            user_id: currentUser
          }));
          setNewMessage('');
        }
      } else {
        console.error("WebSocket is not connected");
      }
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

  const formatTime = (timestamp) => {
    
    return convertToRelativeTime(timestamp)
  };
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };
  if (!conversationId || !otherUser) {
    console.log("Missing data for Message component:", { conversationId, otherUser });
    return <p>Please select a user to start a conversation.</p>;
  }
  
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
                    {console.log("this is url " , message.image)}
                  {message.image && <img src={`${backendBaseUrl}${message.image} `}alt="Message" className="message-image" />}
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
          <input
            type="file"
            onChange={handleImageChange}
            className="image-input"
          />
          <button type="submit" className="send-button">
            Send
          </button>
          <button type="button" onClick={handleStartCall} className="call-button">
                        Start Call
                    </button>
        </form>
      </div>
      {isCalling && (
                <Call onEndCall={handleEndCall} />
            )}
    </div>
  );
}

export default Message;