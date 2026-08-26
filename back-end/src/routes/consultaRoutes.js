const express = require('express');
const router  = express.Router();
const ConsultaController = require('../controllers/consultaController');
const { authRequired }   = require('../middlewares/authMiddleware');

router.use(authRequired);

router.get('/membros',  ConsultaController.listarMembros);
router.get('/ubs',      ConsultaController.listarUbs);
router.get('/horarios', ConsultaController.listarHorarios);
router.get('/',         ConsultaController.listar);
router.post('/',        ConsultaController.agendar);
router.delete('/:id',   ConsultaController.cancelar);

module.exports = router;