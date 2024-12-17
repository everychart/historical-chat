const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Search users for mentions
router.get('/search', auth, async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    const users = await User.find({
      username: { $regex: searchQuery, $options: 'i' }
    })
    .select('username _id')
    .limit(5);
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 