const express = require('express');
const router = express.Router();
const  authenticateToken  = require('../middleware/verifying');

const { login, register, getMe } = require('../controller/auth.controller');

router.post('/login', login)
      .post('/register', register)
      .get('/getme', authenticateToken, getMe);


module.exports = router;
