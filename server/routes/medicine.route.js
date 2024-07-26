const express = require('express');
const router = express.Router();

const { medicine , searchMedicine } = require('../controller/medicine.controller');

router.get('/medicinename' , medicine)
      .post('/searchmedicine', searchMedicine);

module.exports = router;