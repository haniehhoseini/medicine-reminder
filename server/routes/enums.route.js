const express = require('express');
const router = express.Router();
const Roles = require('../shared/enum');

router.get('/roles', (req, res) => {
    res.json(Roles);
});

module.exports = router;
