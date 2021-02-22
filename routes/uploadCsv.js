const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");
const papaparse = require("papaparse");
const fs = require("fs");
let users = [];
let fileName;
const uploadUID = async () => {
  const csv = fs.readFileSync(`./uploads/${fileName}`, "utf-8");
  papaparse.parse(csv, {
    complete: (sheet) => {
      sheets = sheet.data.shift();
      sheets = sheet.data;
    },
  });
  sheets.forEach(async (c) => {
    let currentUser = {
      email: c[5],
      UID: c[0],
      name: c[3],
      year: 2020,
    };
    users.push(currentUser);
  });
  return users;
};
router.get("/", (req, res) => {
  res.render("uploadCsv");
});
router.post("/", (req, res) => {
  let uploadCertis = multer({
    storage: storage,
  }).single("csv");
  uploadCertis(req, res, async (err) => {
    const file = req.file;
    fileName = file.filename;
    res.send("done");
    users = await uploadUID();
    console.log(users);
  });
});

module.exports = router;
