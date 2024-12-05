const cron = require('node-cron');
const db = require('../utils/database');
const { sendNotificationToUser } = require('../sockets/webSocket');

// تابعی برای ارسال نوتیفیکیشن‌ها بر اساس ضریب‌های ساعت مصرف دارو
exports.scheduleNotifications = () => {
    cron.schedule('* * * * *', async () => { // هر دقیقه اجرا می‌شود، می‌توانید تغییر دهید
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes(); // زمان فعلی به دقیقه

        const query = 'SELECT * FROM prescription';
        const [prescriptions] = await db.connection.execute(query);

        prescriptions.forEach((prescription) => {
            const clockParts = prescription.clock.split(':');
            const clockTimeInMinutes = parseInt(clockParts[0]) * 60 + parseInt(clockParts[1]); // تبدیل ساعت مصرف دارو به دقیقه

            const interval = prescription.interval; // فاصله زمانی مصرف دارو (مثلاً 6، 8 یا 24 ساعت)
            const diff = currentTime - clockTimeInMinutes;

            // بررسی اینکه آیا زمان فعلی ضریبی از فواصل زمانی مصرف دارو هست یا خیر
            if (diff >= 0 && diff % (interval * 60) === 0) {
                const message = `زمان مصرف داروی ${prescription.drug_name} رسیده است.`;
                sendNotificationToUser(prescription.user_id, message); // ارسال نوتیفیکیشن به کاربر
            }
        });
    });
};

