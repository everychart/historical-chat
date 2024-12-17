import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import CharacterSelect from './components/CharacterSelect';
import ChatInterface from './components/ChatInterface';
import MultiChatInterface from './components/MultiChatInterface';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ChatFeed from './components/ChatFeed';
import './App.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState([]);
  const [isMultiChatActive, setIsMultiChatActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [currentView, setCurrentView] = useState('characters');

  // If no user is logged in, show auth forms
  if (!user) {
    return showRegister ? (
      <Register onToggleForm={() => setShowRegister(false)} />
    ) : (
      <Login onToggleForm={() => setShowRegister(true)} />
    );
  }

  // Handle single character selection for normal chat
  const handleCharacterSelect = (character) => {
    if (isMultiChatActive) {
      if (selectedCharacters.find(c => c.id === character.id)) {
        setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
      } else if (selectedCharacters.length < 4) {
        setSelectedCharacters([...selectedCharacters, character]);
      }
    } else {
      setSelectedCharacter(character);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Historical Chat</h1>
        <div className="user-controls">
          <span>Welcome, {user.username}!</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>
      
      <div className="nav-controls">
        <button 
          className="mode-button"
          onClick={() => setCurrentView(currentView === 'characters' ? 'feed' : 'characters')}
        >
          {currentView === 'characters' ? 'View Shared Chats' : 'Back to Characters'}
        </button>
        {currentView === 'characters' && (
          <>
            <input
              type="text"
              placeholder="Search characters..."
              className="search-bar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className="mode-button"
              onClick={() => {
                setIsMultiChatActive(!isMultiChatActive);
                setSelectedCharacters([]);
                setSelectedCharacter(null);
              }}
            >
              {isMultiChatActive ? 'Single Chat' : 'Multi Chat'}
            </button>
          </>
        )}
      </div>

      {currentView === 'characters' ? (
        <>
          <CharacterSelect 
            onSelectCharacter={handleCharacterSelect}
            selectedCharacters={selectedCharacters}
            searchQuery={searchQuery}
          />
          {selectedCharacter && (
            <ChatInterface 
              character={selectedCharacter}
              onClose={() => setSelectedCharacter(null)}
            />
          )}
          {isMultiChatActive && selectedCharacters.length >= 2 && (
            <MultiChatInterface 
              selectedCharacters={selectedCharacters}
              onClose={() => {
                setIsMultiChatActive(false);
                setSelectedCharacters([]);
              }}
            />
          )}
        </>
      ) : (
        <ChatFeed />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
