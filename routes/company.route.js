const express = require('express');
const router = express.Router();

const { company, searchCompanyByName } = require('../controller/company.controller');

router.get('/companyname' , company)
      .post('/seachbyname' , searchCompanyByName);

module.exports = router;