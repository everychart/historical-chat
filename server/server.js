require('dotenv').config();
const router = require('express').Router();
const path = require('path');
const auth = require('./routes/auth')
const chats = require('./routes/chats')
const users = require('./routes/users')
const generate = require('./routes/generate')
const express = require('express');
const mongoose = require('mongoose');
const cors = require('./middleware/cors'); // Correct import path
const jwt = require('jsonwebtoken');

const mongoURI = process.env.MONGODB_URI

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const jwtSecret = process.env.JWT_SECRET

const app = express();

router.get('/hello', auth, async (req, res) => {
  try {
    res.status(200);
    res.send('Hello World!');
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

  // This code makes sure that any request that does not matches a static file
// in the build folder, will just serve index.html. Client side routing is
// going to make sure that the correct content will be loaded.
app.get('*',(req, res, next) => {
  if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
      next();
  } else {
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      res.sendFile(path.join('/workspace', 'build', 'index.html'));
  }
});
app.use(express.static(path.join('/workspace', 'build')));

// Authentication middleware (before CORS and JSON parsing)
app.use((req, res, next) => {
  const exceptions = ['/api/auth/login', '/api/auth/register', '/hello'];
  if ( exceptions.includes(req.path)) return next();
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


// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname + '/../client/build/index.html'));
// });

// Routes
app.use('/api/chats', chats);
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/llm', generate);
// // Serve static files from the React app
// app.use(express.static(path.join(__dirname, '../client/build')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

