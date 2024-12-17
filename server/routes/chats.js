const router = require('express').Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// Get all public chats
router.get('/public', async (req, res) => {
  try {
    const chats = await Chat.find({ isPublic: true })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's chats
router.get('/my-chats', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save chat
router.post('/', auth, async (req, res) => {
  try {
    const { characterId, characterName, messages, isPublic } = req.body;
    const chat = new Chat({
      userId: req.user.id,
      characterId,
      characterName,
      messages,
      isPublic
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like/unlike chat
router.post('/:chatId/like', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const likeIndex = chat.likes.indexOf(req.user.id);
    if (likeIndex === -1) {
      chat.likes.push(req.user.id);
    } else {
      chat.likes.splice(likeIndex, 1);
    }
    
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment
router.post('/:chatId/comment', auth, async (req, res) => {
  try {
    const { content, mentions } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Create the comment
    const comment = {
      userId: req.user.id,
      content,
      mentions: mentions || []
    };

    chat.comments.push(comment);
    await chat.save();

    // If there are mentions, notify the mentioned users
    if (mentions && mentions.length > 0) {
      // Here you could add notification logic
      console.log(`Users mentioned: ${mentions.join(', ')}`);
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 