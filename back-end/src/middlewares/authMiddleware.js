function authRequired(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.status(401).json({
      erro: 'Não autorizado. Faça login.'
    });
  }

  next();
}

module.exports = {
  authRequired
}
