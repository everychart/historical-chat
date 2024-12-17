import React, { useState, useEffect, useRef } from 'react';
import './UserMention.css';

function UserMention({ onSelect, onClose, position }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/search?q=${search}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  return (
    <div 
      className="mention-menu"
      ref={menuRef}
      style={{
        top: position.y,
        left: position.x
      }}
    >
      {loading ? (
        <div className="mention-loading">Loading...</div>
      ) : (
        <div className="mention-list">
          {users.map(user => (
            <div
              key={user._id}
              className="mention-item"
              onClick={() => {
                onSelect(user);
                onClose();
              }}
            >
              {user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserMention; 