const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const { encryptField, decryptField } = require("./../cryptoHelper");

async function auth(req, res, next) {
  const token = req.cookies.token;
  console.log("Auth middleware token:", token);
  if (!token) return res.redirect('/login');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.redirect('/login');
    req.user = {
      userId: user._id,
      username: decryptField(user.firstName) + ' ' + decryptField(user.lastName),
      approvalLevel: user.approvalLevel,
      firstName: decryptField(user.firstName),
      lastName: decryptField(user.lastName),
    };
    console.log(req.user);
    if (user.approvalLevel < 1 && req.path !== '/approval') {
      return res.redirect('/approval');
    }
    next();
  } catch {
    res.redirect('/login');
  }
}

module.exports = auth;