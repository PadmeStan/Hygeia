const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/authController');
const { authRequired } = require('../middlewares/authMiddleware');
const db = require('../config/db');

router.post('/login', AuthController.login);

router.post('/register-step1', AuthController.registerStep1);

router.post('/register', AuthController.register);

router.get('/logout', AuthController.logout);

router.get('/perfil', authRequired, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
        id,
        nome,
        cpf,
        email,
        data_nascimento,
        genero,
        sus,
        telefone
       FROM usuarios
       WHERE id = ?`,
      [req.session.usuario.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.'
      });
    }

    return res.status(200).json(rows[0]);

  } catch (erro) {
    console.error('[perfil]', erro);

    return res.status(500).json({
      erro: 'Erro ao buscar perfil.'
    });
  }
});

module.exports = router;
