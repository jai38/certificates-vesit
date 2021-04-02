const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv").config();
console.log(JSON.parse(process.env.users));
let users = [
  "2019jai.malani@ves.ac.in",
  "2017.nilesh.talreja@ves.ac.in",
  "2018.varad.rane@ves.ac.in",
  "2019mcvean.soans@ves.ac.in",
  "tinkers_codecell.cmpn@ves.ac.in",
  "cultural.vesit@ves.ac.in",
  "sort.vesit@ves.ac.in",
  "vesit.studentcouncil@ves.ac.in",
  "sport.vesit@ves.ac.in",
  "musiccouncil.vesit@ves.ac.in",
  "iste.vesit@ves.ac.in",
  "csi.vesit@ves.ac.in",
  "isa.vesit@ves.ac.in",
  "ieee.vesit@ves.ac.in",
];
// console.log(JSON.stringify(users));
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
