const express = require('express');
const router = express.Router();
const  authenticateToken  = require('../middleware/verifying');

const { loginTask, registerTask, getMe } = require('../controller/auth.controller');

router.post('/login', loginTask)
      .post('/register', registerTask)
      .get('/getme', authenticateToken, getMe);


module.exports = router;
