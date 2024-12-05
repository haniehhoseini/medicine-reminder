const cron = require('node-cron');
const db = require('../utils/database');
const { sendNotificationToUser } = require('../sockets/webSocket');

const scheduleNotifications = () => {
    cron.schedule('* * * * *', async () => { // Runs every minute (for testing purposes, change to 6 hours later)
        const now = new Date();
        const currentTime = now.toISOString().slice(11, 16); // Get current time in HH:MM format

        const query = 'SELECT * FROM prescription WHERE clock = ?';
        const [prescriptions] = await db.execute(query, [currentTime]);

        prescriptions.forEach((prescription) => {
            const userId = prescription.user_id;
            const message = `زمان مصرف داروی ${prescription.drug_name} رسیده است.`;
            sendNotificationToUser(userId, message); // Send notification to the user
        });
    });
};

module.exports = scheduleNotifications;
