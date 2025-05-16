// authMiddleware.js
const admin = require('firebase-admin');

/**
 * Verifies a Firebase ID token passed in the Authorization header as "Bearer <token>"
 * Attaches decoded token to req.user on success.
 */
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }
  const idToken = header.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
}

module.exports = authMiddleware;
