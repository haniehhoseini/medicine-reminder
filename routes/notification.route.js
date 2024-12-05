const express = require('express');
const { sendNotificationToUser } = require('../sockets/webSocket');  // اطمینان از این که این متد درست ایمپورت شده است

const router = express.Router();

// ارسال نوتیفیکیشن به صورت دستی
router.get('/notification', (req, res) => {
    const { userId, message } = req.body;
    
    // ارسال نوتیفیکیشن
    sendNotificationToUser(userId, message);
    
    // پاسخ به درخواست
    res.status(200).send('Notification sent');
});

module.exports = router;
