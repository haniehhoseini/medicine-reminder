const express = require('express');
const router = express.Router();

const { medicine , searchMedicine , getMedicineById } = require('../controller/medicine.controller');

router.get('/medicinename' , medicine)
      .post('/searchmedicine', searchMedicine)
      .get('/medicine/:id', getMedicineById);

module.exports = router;


