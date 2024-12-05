const cron = require('node-cron');
const db = require('../utils/database');
const { sendNotificationToUser } = require('../sockets/webSocket');

// تابعی برای ارسال نوتیفیکیشن‌ها بر اساس زمان مصرف
exports.scheduleNotifications = () => {
    cron.schedule('* * * * *', async () => { 
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        console.log(currentHour);
        

        try {
            const query = 'SELECT * FROM prescription';
            const [prescriptions] = await db.connection.execute(query);

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
                    sendNotificationToUser(prescription.user_id, message); // ارسال نوتیف
                }
            });
        } catch (error) {
            console.error('Error in notification scheduler:', error);
        }
    });
};
