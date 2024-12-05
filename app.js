const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require('http');  // اضافه کردن این خط برای ایجاد سرور HTTP
const { initWebSocket } = require('./sockets/webSocket');
const scheduleNotifications = require('./cron/scheduler');

const authRoute = require("./routes/auth.route");
const medicineRoute = require("./routes/medicine.route");
const doctorRoute = require("./routes/doctor.route");
const companyRoute = require("./routes/company.route");
const enumsRoles = require("./routes/enums.route");
const notificationsRoutes = require('./routes/notifications.route');

const app = express();
const port = 1111;

// ایجاد سرور HTTP
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/auth", authRoute);
app.use("/api/", companyRoute);
app.use("/api/", doctorRoute);
app.use("/api/", medicineRoute);
app.use('/api/enums', enumsRoles);
app.use('/api/', notificationsRoutes);

// WebSocket
initWebSocket(server);  // متصل کردن WebSocket به سرور

// زمان‌بندی نوتیفیکیشن‌ها
scheduleNotifications();

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
