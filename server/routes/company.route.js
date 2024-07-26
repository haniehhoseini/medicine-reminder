const express = require('express');
const router = express.Router();

const { company } = require('../controller/company.controller');

router.get('/companyname' , company);

module.exports = router;