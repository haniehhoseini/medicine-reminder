const express = require('express');
const { getPrescriptionsByUser } = require('../model/notifications');
const router = express.Router();

router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const prescriptions = await getPrescriptionsByUser(userId);
        res.json(prescriptions);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching prescriptions' });
    }
});

module.exports = router;
