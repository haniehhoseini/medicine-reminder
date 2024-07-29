const express = require('express');
const router = express.Router();
const Roles = require('../shared/enum');

const { loginTask, registerTask } = require('../controller/auth.controller');

router.post('/login', loginTask)
      .post('/register', registerTask);

      // router.get('/admin', roleAuth([Roles.ADMIN]), (req, res) => {
      //       res.json({ message: 'Welcome, admin!' });
      //   });
        
      //   router.get('/doctor', roleAuth([Roles.DOCTOR]), (req, res) => {
      //       res.json({ message: 'Welcome, doctor!' });
      //   });
        
      //   router.get('/patient', roleAuth([Roles.PATIENT]), (req, res) => {
      //       res.json({ message: 'Welcome, patient!' });
      //   });
        
      //   router.get('/pharmacist', roleAuth([Roles.PHARMACIST]), (req, res) => {
      //       res.json({ message: 'Welcome, pharmacist!' });
      //   });
        
      //   router.get('/relatives', roleAuth([Roles.RELATIVES]), (req, res) => {
      //       res.json({ message: 'Welcome, relative!' });
      //   });


module.exports = router;
