// adminOnly.js
module.exports = function adminOnly(req, res, next) {
  if (!req.user.admin) {
    return res.status(403).json({ error: 'Forbidden. Admins only.' });
  }
  next();
};
