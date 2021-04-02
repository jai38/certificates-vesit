const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv").config();
// console.log(JSON.parse(process.env.users));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));
app.use(express.static(__dirname + "/public"));
app.use("/", require("./routes/main"));
app.use("/certis", require("./routes/certis"));
app.use("/csv", require("./routes/csv"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`On port ${PORT}`));
