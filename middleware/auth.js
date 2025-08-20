const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

async function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.redirect('/login');
    req.user = {
      userId: user._id,
      username: user.username,
      approvalLevel: user.approvalLevel
    };
    if (user.approvalLevel < 1 && req.path !== '/approval') {
      return res.redirect('/approval');
    }
    next();
  } catch {
    res.redirect('/login');
  }
}

module.exports = auth;