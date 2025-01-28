const express = require('express');
const router = express.Router();

const { company, searchCompanyByName } = require('../controller/company.controller');

router.get('/companyname' , company)
        .get('/seachbyname/:firstname' , searchCompanyByName);

module.exports = router;