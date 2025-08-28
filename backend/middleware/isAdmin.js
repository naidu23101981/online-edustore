module.exports = (req, res, next) => {
  if (req.user?.role === 'ADMIN' || req.user?.role === 'SUPERADMIN') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required.' });
};
