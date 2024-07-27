const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoute = require("./routes/auth.route");
const medicineRoute = require("./routes/medicine.route");
const doctorRoute = require("./routes/doctor.route");
const companyRoute = require("./routes/company.route");

const app = express();
const port = 1111;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/auth", authRoute);
// app.use("/api/", companyRoute);
app.use("/api/", doctorRoute);
app.use("/api/", medicineRoute);


app.listen(port ,()=>{
    console.log(`server listening on port ${port}`);
})
