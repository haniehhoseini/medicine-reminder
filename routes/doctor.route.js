const express = require('express');
const router = express.Router();
const  authenticateToken  = require('../middleware/verifying');
const  authorizeRole  = require('../middleware/role');
const Roles = require('../shared/role');

const { doctors, Doctorspatients, searchDoctor ,getDoctorById } = require('../controller/doctor.controller');

router.get('/doctorsname' ,doctors)
      .get('/doctorspatients', authenticateToken, authorizeRole([Roles.ADMIN, Roles.DOCTOR]), Doctorspatients)  
      .post('/searchdoctors', searchDoctor)
      .get('/doctor/:id', getDoctorById);

module.exports = router;