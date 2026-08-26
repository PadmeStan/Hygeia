function authRequired(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.status(401).json({ erro: 'Não autorizado. Faça login.' });
}

module.exports = { authRequired };
