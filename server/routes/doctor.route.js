const express = require('express');
const router = express.Router();

const { doctors , Doctorspatients, searchDoctor } = require('../controller/doctor.controller');

router.get('/doctorsname' ,doctors)
      .get('/doctorspatients', Doctorspatients)  
      .post('/searchdoctors', searchDoctor);

module.exports = router;