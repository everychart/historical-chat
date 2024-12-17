import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './ChatFeed.css';
import UserMention from './UserMention';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function ChatFeed() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeTab, setActiveTab] = useState('public'); // 'public' or 'my-chats'
  const [loading, setLoading] = useState(true);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 });
  const [currentInput, setCurrentInput] = useState('');
  const commentInputRefs = useRef({});

  useEffect(() => {
    fetchChats();
  }, [activeTab]);

  const fetchChats = async () => {
    try {
      const endpoint = activeTab === 'public' ? '/public' : '/my-chats';
      const response = await fetch(`${API_URL}/api/chats${endpoint}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setChats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setLoading(false);
    }
  };

  const handleLike = async (chatId) => {
    try {
      const response = await fetch(`${API_URL}/api/chats/${chatId}/like`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const updatedChat = await response.json();
      setChats(chats.map(chat => 
        chat._id === chatId ? updatedChat : chat
      ));
    } catch (error) {
      console.error('Error liking chat:', error);
    }
  };

  const handleCommentInput = (e, chatId) => {
    const input = e.target;
    const value = input.value;
    const lastChar = value[value.length - 1];
    
    setCurrentInput(value);

    if (lastChar === '@') {
      const rect = input.getBoundingClientRect();
      const position = {
        x: rect.left,
        y: rect.bottom + window.scrollY
      };
      setMentionPosition(position);
      setShowMentions(true);
    }
  };

  const handleMentionSelect = (user, chatId) => {
    const input = commentInputRefs.current[chatId];
    const value = input.value;
    const lastAtIndex = value.lastIndexOf('@');
    
    const newValue = value.slice(0, lastAtIndex) + `@${user.username} `;
    input.value = newValue;
    setCurrentInput(newValue);
    setShowMentions(false);
  };

  const handleComment = async (chatId, comment) => {
    try {
      const mentions = comment.match(/@(\w+)/g) || [];
      const usernames = mentions.map(mention => mention.slice(1));

      const response = await fetch(`${API_URL}/api/chats/${chatId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ 
          content: comment,
          mentions: usernames
        })
      });
      const updatedChat = await response.json();
      setChats(chats.map(chat => 
        chat._id === chatId ? updatedChat : chat
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="chat-feed">
      <div className="chat-feed-header">
        <button 
          className={`tab-button ${activeTab === 'public' ? 'active' : ''}`}
          onClick={() => setActiveTab('public')}
        >
          Public Chats
        </button>
        <button 
          className={`tab-button ${activeTab === 'my-chats' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-chats')}
        >
          My Chats
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading chats...</div>
      ) : (
        <div className="chats-container">
          {chats.map(chat => (
            <div key={chat._id} className="chat-card">
              <div className="chat-card-header">
                <img 
                  src={`/images/${chat.characterId}.jpg`} 
                  alt={chat.characterName} 
                  className="character-avatar"
                />
                <div className="chat-info">
                  <h3>{chat.characterName}</h3>
                  <p className="chat-meta">
                    Shared by {chat.userId.username} • 
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="chat-messages-preview">
                {chat.messages.slice(0, 3).map((message, index) => (
                  <div key={index} className={`message ${message.sender}`}>
                    <strong>{message.sender === 'user' ? 'User' : chat.characterName}:</strong>
                    {message.text}
                  </div>
                ))}
                {chat.messages.length > 3 && (
                  <div className="more-messages">
                    +{chat.messages.length - 3} more messages
                  </div>
                )}
              </div>

              <div className="chat-interactions">
                <button 
                  className={`like-button ${chat.likes.includes(user.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(chat._id)}
                >
                  ♥ {chat.likes.length}
                </button>
                <div className="comments-section">
                  {chat.comments.map((comment, index) => (
                    <div key={index} className="comment">
                      <strong>{comment.userId.username}:</strong> {comment.content}
                    </div>
                  ))}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const comment = e.target.comment.value;
                      if (comment.trim()) {
                        handleComment(chat._id, comment);
                        e.target.comment.value = '';
                        setCurrentInput('');
                      }
                    }}
                    className="comment-form"
                  >
                    <input
                      type="text"
                      name="comment"
                      placeholder="Add a comment... (use @ to mention users)"
                      onChange={(e) => handleCommentInput(e, chat._id)}
                      ref={el => commentInputRefs.current[chat._id] = el}
                    />
                    <button type="submit">Send</button>
                    {showMentions && (
                      <UserMention
                        onSelect={(user) => handleMentionSelect(user, chat._id)}
                        onClose={() => setShowMentions(false)}
                        position={mentionPosition}
                      />
                    )}
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatFeed; 