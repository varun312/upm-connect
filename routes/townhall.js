const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');


const User = require('../models/User');
const { decryptField } = require('../cryptohelper');

// GET townhall page
router.get('/', auth, async (req, res) => {
    let username = 'Unknown';
    let user = null;
    if (req.user && req.user.userId) {
        user = await User.findById(req.user.userId);
        if (user) {
            const firstName = decryptField(user.firstName);
            const lastName = decryptField(user.lastName);
            username = firstName + lastName;
        }
    }
    // Get last 50 messages, sorted oldest to newest
    const messages = await Message.find({}).sort({ time: 1 }).limit(50).lean();
    res.render('townhall', { username, messages });
});


// POST a new message (persist and broadcast)
router.post('/message', auth, async (req, res) => {
    let username = 'Unknown';
    let user = null;
    if (req.user && req.user.userId) {
        user = await User.findById(req.user.userId);
        if (user) {
            const firstName = decryptField(user.firstName);
            const lastName = decryptField(user.lastName);
            username = firstName + lastName;
        }
    }
    const { text } = req.body;
    if (text && text.trim()) {
        const msg = await Message.create({ username, text });
        // Emit to all clients via Socket.IO
        const io = req.app.get('io');
        io.emit('chat message', {
            username,
            text,
            time: msg.time.toLocaleTimeString()
        });
    }
    res.redirect('/townhall');
});

module.exports = router;
