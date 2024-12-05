const cron = require('node-cron');
const db = require('../utils/database');
const { sendNotificationToUser } = require('../sockets/webSocket');

// تابعی برای ارسال نوتیفیکیشن‌ها بر اساس ضریب‌های ساعت مصرف دارو
exports.scheduleNotifications = () => {
    cron.schedule('0 * * * *', async () => { // هر ساعت در دقیقه 0 اجرا می‌شود
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // زمان فعلی به دقیقه

        const query = 'SELECT * FROM prescription';
        const [prescriptions] = await db.connection.execute(query);
        console.log([prescriptions]);
        

        prescriptions.forEach((prescription) => {
            const clockTime = parseInt(prescription.clock); // زمان مصرف دارو (به ساعت)

            // بررسی اینکه آیا زمان فعلی ضریبی از ساعت مصرف دارو هست یا خیر
            if (currentTime % (clockTime * 60) === 0) {
                const message = `زمان مصرف داروی ${prescription.drug_name} رسیده است.`;
                sendNotificationToUser(prescription.user_id, message); // ارسال نوتیفیکیشن به کاربر
            }
        });
    });
};

