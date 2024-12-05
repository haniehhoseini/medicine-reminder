const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { initWebSocket } = require('./sockets/webSocket');


const { scheduleNotifications } = require('./model/notification');
const notificationsRoute = require('./routes/notification.route');

// شروع کرون
scheduleNotifications();

const authRoute = require("./routes/auth.route");
const medicineRoute = require("./routes/medicine.route");
const doctorRoute = require("./routes/doctor.route");
const companyRoute = require("./routes/company.route");
const enumsRoles = require("./routes/enums.route");

const app = express();
const port = 1111;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());




app.use("/api/auth", authRoute);
app.use("/api/", companyRoute);
app.use("/api/", doctorRoute);
app.use("/api/", medicineRoute);
app.use('/api/enums', enumsRoles);
app.use('/api', notificationsRoute);  // اتصال مسیر





server = app.listen(port ,()=>{
    console.log(`server listening on port ${port}`);
})

// WebSocket
initWebSocket(server);