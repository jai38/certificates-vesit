const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "\\public"));
app.use("/", require("./routes/main"));
app.use("/certis", require("./routes/certis"));
app.use("/csv", require("./routes/csv"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`On port ${PORT}`));
