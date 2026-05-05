const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

router.post('/login', AuthController.login);
router.post('/register-step1', AuthController.registerStep1);
router.post('/register', AuthController.register);
router.get('/logout', AuthController.logout);

module.exports = router;
