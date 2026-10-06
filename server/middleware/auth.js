const jwt = require('jsonwebtoken');
function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured.');
  return process.env.JWT_SECRET;
}
function requireAuth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  try { req.user = jwt.verify(token, secret()); next(); }
  catch (_) { return res.status(401).json({ error: 'Invalid or expired session.' }); }
}
module.exports = { requireAuth, secret };
