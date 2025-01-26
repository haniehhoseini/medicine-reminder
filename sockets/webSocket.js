const WebSocket = require('ws');
const clients = {}; // Store user connections by userId

const initWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'auth') {
                    const userId = data.userId; // Retrieve userId for authentication
                    clients[userId] = ws; // Store user connection
                    console.log(`User ${userId} authenticated and connected`);
                }
            } catch (err) {
                console.error('Error in WebSocket message:', err);
            }
        });

        ws.on('close', () => {
            for (const userId in clients) {
                if (clients[userId] === ws) {
                    delete clients[userId]; // Remove user connection upon disconnection
                    console.log(`User ${userId} disconnected`);
                }
            }
        });
    });
};

const sendNotificationToUser = (userId, message) => {
    const ws = clients[userId];
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ message })); // Send message to user
        console.log(`Notification sent to user ${userId}`);
    } else {
        console.log(`No active WebSocket connection for user ${userId}`);
    }
};

module.exports = { initWebSocket, sendNotificationToUser };
