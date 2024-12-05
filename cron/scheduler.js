const cron = require('node-cron');
const db = require('../utils/database');
const { sendNotificationToUser } = require('../sockets/webSocket');

const scheduleNotifications = () => {
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const currentTime = now.toISOString().slice(11, 16); // HH:MM

        const query = 'SELECT * FROM prescriptions WHERE clock = ?';
        const [prescriptions] = await db.execute(query, [currentTime]);

        prescriptions.forEach((prescription) => {
            const userId = prescription.user_id;
            const message = `زمان مصرف داروی ${prescription.drug_name} رسیده است.`;
            sendNotificationToUser(userId, message);
        });
    });
};

module.exports = scheduleNotifications;
