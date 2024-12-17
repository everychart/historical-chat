import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { query as generateResponse } from '../services/huggingFaceService';
import WorksList from './WorksList';
import './ChatInterface.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ChatInterface({ character, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('chat');
  const [isPublic, setIsPublic] = useState(false);
  const messagesEndRef = useRef(null);

  const saveChat = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          characterId: character.id,
          characterName: character.name,
          messages,
          isPublic
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save chat');
      }

      // Show success message or handle UI feedback
      console.log('Chat saved successfully');
    } catch (error) {
      console.error('Error saving chat:', error);
      // Handle error (show error message to user)
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage = { text: newMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Get character's response
      const response = await generateResponse({
        inputs: newMessage,
        character
      });

      // Add character's response
      const characterMessage = { text: response, sender: 'character' };
      setMessages(prev => [...prev, characterMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage = {
        text: 'I apologize, but I am unable to respond at the moment.',
        sender: 'character'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-modal-overlay">
      <div className="chat-interface">
        <div className="chat-header">
          <img src={character.image} alt={character.name} />
          <h2>{character.name}</h2>
          <div className="header-buttons">
            <button 
              className="mode-button"
              onClick={() => setMode('chat')}
              style={{ color: 'white' }}
            >
              Chat
            </button>
            <button 
              className="mode-button"
              onClick={() => setMode('works')}
              style={{ color: 'white' }}
            >
              View Works
            </button>
            {user && mode === 'chat' && messages.length > 0 && (
              <>
                <button 
                  className="mode-button"
                  onClick={saveChat}
                  style={{ color: 'white' }}
                >
                  Save Chat
                </button>
                <label className="public-toggle">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  Make Public
                </label>
              </>
            )}
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {mode === 'chat' ? (
          <>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.sender} ${index === 0 ? 'greeting' : ''}`}
                >
                  {message.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{padding: '2rem'}}>
            <WorksList character={character} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface; 