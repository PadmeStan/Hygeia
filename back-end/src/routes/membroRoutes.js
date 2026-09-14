const express = require('express');
const router = express.Router();
const MembroController = require('../controllers/membroController');
const { authRequired } = require('../middlewares/authMiddleware');

// Todas as rotas de membros exigem login
router.use(authRequired);

router.get('/',        MembroController.listar);
router.post('/',       MembroController.criar);
router.put('/:id',     MembroController.atualizar);
router.delete('/:id',  MembroController.excluir);

module.exports = router;