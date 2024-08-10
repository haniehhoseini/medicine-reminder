const express = require('express');
const router = express.Router();
const  authenticateToken  = require('../middleware/verifying');

const { 
      login, 
      registerPatient, 
      getMe, 
      registerDoctor, 
      registerCompany, 
      registerRelatives, 
      updateDoctor, 
      updatePatient, 
      updateCompany,
      updateRelatives } = require('../controller/auth.controller');

router.post('/login', login)
      .post('/registerpatient', registerPatient)
      .post('/registerdoctor', registerDoctor)
      .post('/registercompany', registerCompany)
      .post('/registerrelatives', registerRelatives)
      .get('/getme', authenticateToken, getMe)
      .put('/updatedoctor', authenticateToken , updateDoctor)
      .put('/updatepatient', authenticateToken, updatePatient)
      .put('/updatecompany', authenticateToken, updateCompany)
      .put('/updaterelatives', authenticateToken, updateRelatives);


module.exports = router;

