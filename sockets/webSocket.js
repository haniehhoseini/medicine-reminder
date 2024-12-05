const WebSocket = require('ws');
const clients = {}; // ذخیره ارتباطات کاربران بر اساس userId

const initWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'auth') {
                    const userId = data.userId; // دریافت userId برای احراز هویت
                    clients[userId] = ws; // ذخیره ارتباط کاربر
                    console.log(`User ${userId} authenticated and connected`);
                }
            } catch (err) {
                console.error('Error in WebSocket message:', err);
            }
        });

        ws.on('close', () => {
            for (const userId in clients) {
                if (clients[userId] === ws) {
                    delete clients[userId]; // حذف ارتباط کاربر هنگام قطع اتصال
                    console.log(`User ${userId} disconnected`);
                }
            }
        });
    });
};

const sendNotificationToUser = (userId, message) => {
    const ws = clients[userId];
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ message })); // ارسال پیام به کاربر
        console.log(`Notification sent to user ${userId}`);
    } else {
        console.log(`No active WebSocket connection for user ${userId}`);
    }
};

module.exports = { initWebSocket, sendNotificationToUser };
