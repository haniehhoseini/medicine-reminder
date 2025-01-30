const express = require('express');
const db = require('../utils/database');
const router = express.Router();

router.get('/notification/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const query = `SELECT * FROM logs WHERE user_id = ? ORDER BY time DESC`;
        const [logs] = await db.connection.execute(query, [user_id]);

        res.status(200).json({ success: true, logs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ success: false, message: 'Error fetching logs' });
    }
});

module.exports = router;
