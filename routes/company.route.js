const express = require('express');
const router = express.Router();

const { company, searchCompanyByName, getCompanyById } = require('../controller/company.controller');

router.get('/companyname' , company)
      .post('/seachbyname' , searchCompanyByName)
      .get('/company/:id', getCompanyById);

module.exports = router;