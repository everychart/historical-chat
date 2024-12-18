require('dotenv').config();
const path = require('path');
const auth = require('./routes/auth')
const chats = require('./routes/chats')
const users = require('./routes/users')
const express = require('express');
const mongoose = require('mongoose');
const cors = require('./middleware/cors'); // Correct import path
const jwt = require('jsonwebtoken');

const mongoURI = process.env.MONGODB_URI
const jwtSecret = process.env.JWT_SECRET

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware (before CORS and JSON parsing)
app.use((req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// CORS middleware
app.use(cors);

// JSON parsing middleware
app.use(express.json());


// Routes
app.use('/api/auth', auth);
app.use('/api/chats', chats);
app.use('/api/users', users);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/build/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

