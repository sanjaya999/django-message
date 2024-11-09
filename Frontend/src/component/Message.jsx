import React, { useEffect, useState, useRef } from 'react';
import { get, post } from '../api/api';
import { convertToRelativeTime } from '../functions/time';

function Message({ conversationId, otherUser }) {
  const messagesEndRef = useRef(null);
  const currentUser = localStorage.getItem("user_id");
  const [convoFound, setConvoFound] = useState(null);
  const [currentConvo, setCurrentConvo] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  //initialize socket
  useEffect(()=>{
    const wsScheme = window.location.protocol === "https:" ? "wss" : "ws";
    socketRef.current = new WebSocket(`${wsScheme}://localhost:9000/ws/chat/${conversationId}`);


    //listen fro new message
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
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
      socketRef.current.close();
    };
  },[conversationId, currentUser])

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const get_create_convo = async () => {
      try {
        const response = await post('/conversations', {
          user_id: currentUser,
          user: otherUser
        });
        
        if (response.message?.includes("Existing conversation found.")) {
          setConvoFound(true);
          // Sort messages by timestamp when receiving them
          const sortedMessages = response.messages?.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          ) || [];
          setMessages(sortedMessages);
        } else {
          setCurrentConvo(response.conversation_id);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      }
    };
    get_create_convo();
  }, [conversationId, currentUser, otherUser]);

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
      const response = await post(`/message`, {
        conversation_id: conversationId,
        content: newMessage,
      });

      if (response.success) {
        // Add new message and sort to maintain order
        setMessages(prev => [...prev, response.message].sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        ));
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
                <div className="avatar">
                  {message.sender.username[0].toUpperCase()}
                </div>
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