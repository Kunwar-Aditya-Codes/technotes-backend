const express = require('express');
const { login, logout, refresh } = require('../controller/authController');
const router = express.Router();
const loginLimiter = require('../middleware/loginLimiter');

router.route('/').post(loginLimiter, login);

router.route('/refresh').get(refresh);

router.route('/logout').post(logout);

module.exports = router;
