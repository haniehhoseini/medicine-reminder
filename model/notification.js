const cron = require('node-cron');
const db = require('../utils/database');
const { sendNotificationToUser } = require('../sockets/webSocket');

// متغیر برای ذخیره کاربر فعلی
let loggedInUserId = null;

// تنظیم `loggedInUserId` هنگام ورود کاربر جدید
exports.setLoggedInUser = (userId) => {
    loggedInUserId = userId; // به‌روزرسانی کاربر لاگین شده
    console.log(`Logged in user set to: ${userId}`);
};

// تابع ارسال نوتیفیکیشن‌ها بر اساس نسخه‌ها
exports.scheduleNotifications = () => {
    cron.schedule('* * * * *', async () => { 
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // اگر هیچ کاربری لاگین نکرده باشد، کرون متوقف می‌شود
        if (!loggedInUserId) {
            console.log('No user is currently logged in.');
            return;
        }

        try {
            // دریافت نسخه‌های مربوط به کاربر فعلی
            const query = `
                SELECT * 
                FROM prescription 
                WHERE user_id = ?
            `;
            const [prescriptions] = await db.connection.execute(query, [loggedInUserId]);

            prescriptions.forEach((prescription) => {
                const drugInterval = parseInt(prescription.clock); // فاصله زمانی مصرف دارو (به ساعت)

                // محاسبه ساعت‌های مصرف دارو
                const notificationTimes = [];
                for (let i = 0; i < 24; i += drugInterval) {
                    notificationTimes.push(i); // اضافه کردن ساعت به آرایه
                }

                // بررسی اینکه آیا زمان فعلی در ساعت‌های مصرف دارو است
                if (
                    notificationTimes.includes(currentHour) &&
                    currentMinute === 0 // دقیقه باید صفر باشد
                ) {
                    const message = `زمان مصرف داروی ${prescription.drug_name} رسیده است.`;
                    console.log(message); // برای لاگ
                    sendNotificationToUser(loggedInUserId, message); // ارسال نوتیف به کاربر فعلی
                }
            });
        } catch (error) {
            console.error('Error in notification scheduler:', error);
        }
    });
};
