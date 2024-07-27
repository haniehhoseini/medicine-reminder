const express = require('express');
const router = express.Router();

const { doctors , Doctorspatients, searchDoctor ,getDoctorById } = require('../controller/doctor.controller');

router.get('/doctorsname' ,doctors)
      .get('/doctorspatients', Doctorspatients)  
      .post('/searchdoctors', searchDoctor)
      .get('/doctor/:id', getDoctorById);

module.exports = router;