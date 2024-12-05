const WebSocket = require('ws');
const clients = {}; // نگه‌داری ارتباط کاربران

const initWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'auth') {
                    const userId = data.userId; // شناسه کاربر
                    clients[userId] = ws;
                }
            } catch (err) {
                console.error('Error in WebSocket:', err);
            }
        });

        ws.on('close', () => {
            for (const userId in clients) {
                if (clients[userId] === ws) {
                    delete clients[userId];
                }
            }
        });
    });
};

const sendNotificationToUser = (userId, message) => {
    const ws = clients[userId];
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ message }));
    }
};

module.exports = { initWebSocket, sendNotificationToUser };
