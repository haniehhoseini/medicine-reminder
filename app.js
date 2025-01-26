const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { initWebSocket } = require('./sockets/webSocket');

const { scheduleNotifications } = require('./model/notification');
const notificationsRoute = require('./routes/notification.route');
const authRoute = require("./routes/auth.route");
const medicineRoute = require("./routes/medicine.route");
const doctorRoute = require("./routes/doctor.route");
const companyRoute = require("./routes/company.route");
const enumsRoles = require("./routes/enums.route");

const app = express();
const port = 1111;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/", companyRoute);
app.use("/api/", doctorRoute);
app.use("/api/", medicineRoute);
app.use('/api/enums', enumsRoles);
app.use('/api', notificationsRoute);  // اتصال مسیر

// Default route for unknown paths
app.use((req, res) => {
    res.status(404).json({ message: 'مسیر مورد نظر یافت نشد' });
});

// Start notification scheduler
scheduleNotifications();

// Start server
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
});

// Initialize WebSocket
initWebSocket(server);
