const express = require('express');
const router = express.Router();
const Roles = require('../shared/role');
const Ensurance = require('../shared/ensurance');

router.get('/roles', (req, res) => {
    res.json(Roles);
});

router.get('/ensurance', (req, res) => {
    res.json(Ensurance);
});

module.exports = router;
