function requireRoles(roles) {
  return (req, res, next) => {
    const perfil = req.user?.perfil;
    if (!perfil || !roles.includes(perfil)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    return next();
  };
}

module.exports = { requireRoles };
