const express = require('express');
const router = express.Router();


const { loginTask, registerTask } = require('../controller/auth.controller');

router.post('/login', loginTask)
      .post('/register', registerTask);


module.exports = router;
