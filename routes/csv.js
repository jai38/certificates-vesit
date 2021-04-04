const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");
const papaparse = require("papaparse");
const fs = require("fs");
const dotenv = require("dotenv").config();
const admin = require("./../firebase-admin");
// Handle for Cloud Firsestore
const db = admin.firestore();
db.settings({
  ignoreUndefinedProperties: true,
});
let sheets = [];
let certificates = []; // Initialize JSON array
let fileName;
let errors = [];
let flag = true;
let finalNums = [];
let rowNum = 0;
const uploadUID = async (councilEmail) => {
  let certificates = [];
  // console.log(councilEmail);
  finalNums = [];
  rowNum = 0;
  const csv = fs.readFileSync(`./uploads/${fileName}`, "utf-8");
  papaparse.parse(csv, {
    complete: (sheet) => {
      sheets = sheet.data;
    },
  });
  let [a, b, c, d, e, f, g] = sheets.shift();
  [a, b, c, d, e, f, g] = [
    a.toLowerCase(),
    b.toLowerCase(),
    c.toLowerCase(),
    d.toLowerCase(),
    e.toLowerCase(),
    f.toLowerCase(),
    g.toLowerCase(),
  ];
  flag = true;
  if (
    a != "uid" ||
    b != "class" ||
    c != "names" ||
    d != "certificate_name" ||
    e != "file_name" ||
    f != "email" ||
    g != "certificate_description"
  ) {
    flag = false;
    errors = [];
    errors.push({
      msg:
        "Please enter Correct Column names as mention in the expected format",
    });
    return -1;
  }
  sheets.forEach(async (c) => {
    if (c[5]) {
      rowNum++;
      let currentCerti = {
        email: c[5],
        UID: c[0],
        name: c[3],
        uidjpg: c[4],
        description: c[6],
        studentName: c[2],
        councilEmail: councilEmail,
        division: c[1].replace(/[ ]/g, ""),
      };
      if (!(c[5] && c[0] && c[3] && c[6])) {
        flag = false;
        finalNums.push(rowNum + 1);
      } else if (c[5] == "" || c[0] == "" || c[3] == "" || c[6] == "") {
        flag = false;
        finalNums.push(rowNum + 1);
      }
      certificates.push(currentCerti);
    }
  });
  if (flag) return certificates;
  else {
    errors = [];
    errors.push({
      msg: `At Row Number(s) ${finalNums} some of the values are missing`,
    });
  }
  return -1;
};

router.get("/", (req, res) => {
  res.render("csv");
});

router.post("/", (req, res) => {
  let uploadCertis = multer({
    storage: storage,
  }).single("csv");

  uploadCertis(req, res, async (err) => {
    let councilEmail = req.body.email;
    const file = req.file;
    fileName = file.filename;
    console.log(councilEmail);
    certificates = await uploadUID(councilEmail);

    if (flag) {
      errors = [];
      errors = [];
      errors.push({
        msg: `You are supposed to upload ${rowNum} certificates below`,
      });
      res.render("certis", {
        errors,
        count: rowNum,
        details: JSON.stringify(certificates),
      });
    } else {
      res.render("csv", { errors });
    }
  });
});

module.exports = router;
