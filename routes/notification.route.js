const express = require('express');
const { notificaionLogs } = require('../controller/auth.controller');

const router = express.Router();

router.get('/notification/:user_id',  notificaionLogs);

module.exports = router;
