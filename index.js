const express = require("express");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use("/", require("./routes/main"));
app.use("/uploadCerits", require("./routes/uploadCerits"));
app.use("/uploadCsv", require("./routes/uploadCsv"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`On port ${PORT}`));
