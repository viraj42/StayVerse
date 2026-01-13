const express = require('express');
const router = express.Router();
const {requireAuth} = require('../middleware/authMiddleware');
const { register, login, logout } = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requireAuth, logout);

module.exports = router;
