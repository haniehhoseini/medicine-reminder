const db = require('../utils/database');

const getPrescriptionsByUser = async (userId) => {
    const query = 'SELECT * FROM prescription WHERE user_id = ?';
    const [prescriptions] = await db.execute(query, [userId]);
    return prescriptions;
};

module.exports = { getPrescriptionsByUser };
