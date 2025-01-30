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
      .post('/getme', getMe)
      .put('/updatedoctor/:doctor_id', updateDoctor)
      .put('/updatepatient/:user_id', updatePatient)
      .put('/updatecompany/:company_id', updateCompany)
      .put('/updaterelatives/:relatives_id', updateRelatives);


module.exports = router;

