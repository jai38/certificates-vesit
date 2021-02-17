const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();
const router = express.Router();
// const helpers = require("helpers");
let fileName;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    fileName = file.originalname;
    cb(null, file.originalname);
  },
});

app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("./../index");
});

app.post("/", (req, res) => {
  let upload = multer({
    storage: storage,
    // fileFilter: helpers.imageFilter,
  }).single("allFiles");
  upload(req, res, (err) => {
    // const img = fs.readFileSync(req.file.path,'utf-8');
    res.sendFile(__dirname + "/" + req.file.path);
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`On port ${PORT}`));
