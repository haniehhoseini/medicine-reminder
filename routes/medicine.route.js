const express = require('express');
const router = express.Router();
const multer = require('multer');
const  authenticateToken  = require('../middleware/verifying');
const  authorizeRole  = require('../middleware/role');
const Roles = require('../shared/role');
const { medicine, 
      searchMedicine, 
      getMedicineById, 
      addMedicine, 
      deleteMedicine, 
      updateMedicine, 
      getImageUrls, 
      getMedicineByCompanyID,
      processPrescription } = require('../controller/medicine.controller');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

const upload = multer({ storage });      



router.get('/medicinename/:page',  medicine)
      .post('/searchmedicine',  searchMedicine)
      .get('/medicine/:id',  getMedicineById)
      .post('/addmedicine', authenticateToken, authorizeRole([Roles.ADMIN, Roles.PHARMACIST]), addMedicine)
      .delete('/deletemedicine', authenticateToken, authorizeRole([Roles.ADMIN, Roles.PHARMACIST]), deleteMedicine)
      .put('/updatemedicine/:ATCC_code' , authenticateToken, authorizeRole([Roles.ADMIN, Roles.PHARMACIST]),  updateMedicine)
      .get('/medicinepicture/:ATCC_code',  getImageUrls)
      .get('/medicinebycompany/:company_id', authenticateToken, authorizeRole([Roles.ADMIN, Roles.PHARMACIST]), getMedicineByCompanyID)
      .post('/upload-prescription/:user_id' , upload.single('prescription'), processPrescription);

module.exports = router;
