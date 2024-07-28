const express = require('express');
const router = express.Router();

const { medicine , searchMedicine , getMedicineById , addMedicine , deleteMedicine , updateMedicine , getImageUrls } = require('../controller/medicine.controller');

router.get('/medicinename' , medicine)
      .post('/searchmedicine', searchMedicine)
      .get('/medicine/:id', getMedicineById)
      .post('/addmedicine', addMedicine)
      .delete('/deletemedicine/:ATCC_code', deleteMedicine)
      .put('/updatemedicine/:ATCC_code', updateMedicine)
      .get('/medicinepicture/:ATCC_code' , getImageUrls );

module.exports = router;


