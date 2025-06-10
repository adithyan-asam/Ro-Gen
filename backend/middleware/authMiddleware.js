const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function protect(req, res, next) {
  let token;

  // Check if the token is in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Get the token

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Go to the next middleware/route handler
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
}

module.exports = { protect };
