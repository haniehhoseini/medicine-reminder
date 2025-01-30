const cron = require('node-cron');
const db = require('../utils/database');
const { sendNotificationToUser } = require('../sockets/webSocket');


// Store logged-in users
let loggedInUsers = new Set();

// Set logged-in user when a new user logs in
exports.setLoggedInUser = (user_id) => {
    loggedInUsers.add(user_id); // Add user to the set of logged-in users
    console.log(`User logged in: ${user_id}`);
};

// Function to check if the current time matches the notification time
const isNotificationTime = (drugInterval, currentHour, currentMinute) => {
    const notificationTimes = [];
    for (let i = 0; i < 24; i += drugInterval) {
        notificationTimes.push(i);
    }
    return notificationTimes.includes(currentHour) && currentMinute === 0;
};

// Function to schedule notifications based on prescriptions
exports.scheduleNotifications = () => {
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (loggedInUsers.size === 0) {
            console.log('No users are currently logged in.');
            return;
        }

        try {
            for (const user_id of loggedInUsers) {
                // Retrieve prescriptions for the current user
                const query = `
                    SELECT * 
                    FROM prescription 
                    WHERE user_id = ?
                `;
                const [prescriptions] = await db.connection.execute(query, [user_id]);

                prescriptions.forEach((prescription) => {
                    const drugInterval = parseInt(prescription.clock, 10); // Time interval for drug intake (in hours)
                
                    if (isNotificationTime(drugInterval, currentHour, currentMinute)) {
                        const message = `It's time to take your medication: ${prescription.drug_name}`;
                        console.log(`Sending notification to ${userId}: ${message}`);
                        
                        // ذخیره لاگ نوتیفیکیشن در دیتابیس
                        const query = `INSERT INTO logs (user_id, message, time) VALUES (?, ?, ?)`;
                        db.connection.execute(query, [user_id, message, now])
                            .then(() => {
                                console.log(`Notification log saved for user ${user_id}`);
                            })
                            .catch((err) => {
                                console.error('Error saving notification log:', err);
                            });
                
                        sendNotificationToUser(user_id, message); // ارسال نوتیفیکیشن به کاربر
                    }
                });
            }
        } catch (error) {
            console.error('Error in notification scheduler:', error);
        }
    });
};
