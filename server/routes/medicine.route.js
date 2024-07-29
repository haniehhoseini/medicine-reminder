const express = require('express');
const router = express.Router();
const passport = require('passport');

const { medicine, searchMedicine, getMedicineById, addMedicine, deleteMedicine, updateMedicine, getImageUrls } = require('../controller/medicine.controller');
const Roles = require('../shared/enum');

// Middleware for Passport JWT authentication
const authenticateJWT = passport.authenticate('jwt', { session: false });

// Routes with middleware
router.get('/medicinename',  medicine)
      .post('/searchmedicine',  searchMedicine)
      .get('/medicine/:id',  getMedicineById)
      .post('/addmedicine', addMedicine)
      .delete('/deletemedicine/:ATCC_code', deleteMedicine)
      .put('/updatemedicine/:ATCC_code',  updateMedicine)
      .get('/medicinepicture/:ATCC_code',  getImageUrls);

module.exports = router;
