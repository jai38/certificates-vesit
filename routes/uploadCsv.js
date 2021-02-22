const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");
const fs = require("fs");
let users = [];
let fileName;
var upload = multer({
  storage: storage,
});
const uploadUID = async (fileName) => {
  const csv = fs.readFileSync(`../uploads/${fileName}`, "utf-8");
  papaparse.parse(csv, {
    complete: (sheet) => {
      sheets = sheet.data.shift();
      sheets = sheet.data;
    },
  });
  sheets.forEach(async (c) => {
    let currentUser = {
      UID: c[0],
      name: c[3],
      year: 2020,
    };
    users.push(currentUser);
  });
  return users;
};
router.get("/", (req, res) => {
  res.render("dashboard");
});
router.post("/", upload.single("csv"), (req, res, next) => {
  const file = req.file;
  console.log(file);
  fileName = file.filename;
  users = uploadUID();
  console.log(users);
  res.send("done");
});

module.exports = router;
