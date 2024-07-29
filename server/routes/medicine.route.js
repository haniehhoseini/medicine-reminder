const express = require('express');
const router = express.Router();
const  authenticateToken  = require('../middleware/verifying');
const  authorizeRole  = require('../middleware/role');
const Roles = require('../shared/role');
const { medicine, searchMedicine, getMedicineById, addMedicine, deleteMedicine, updateMedicine, getImageUrls } = require('../controller/medicine.controller');





router.get('/medicinename',  medicine)
      .post('/searchmedicine',  searchMedicine)
      .get('/medicine/:id',  getMedicineById)
      .post('/addmedicine', authenticateToken, authorizeRole([Roles.ADMIN, Roles.PHARMACIST]), addMedicine)
      .delete('/deletemedicine/:ATCC_code', authenticateToken, authorizeRole([Roles.ADMIN, Roles.PHARMACIST]), deleteMedicine)
      .put('/updatemedicine/:ATCC_code' , authenticateToken, authorizeRole([Roles.ADMIN, Roles.PHARMACIST]),  updateMedicine)
      .get('/medicinepicture/:ATCC_code',  getImageUrls);

module.exports = router;
