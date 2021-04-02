const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");
const papaparse = require("papaparse");
const fs = require("fs");
const dotenv = require("dotenv").config();
const admin = require("./../firebase-admin");
// Handle for Cloud Firsestore
const db = admin.firestore();
let sheets = [];
let certificates = []; // Initialize JSON array
let fileName;
let errors = [];
let flag = true;
let finalNums = [];
let rowNum = 0;
const uploadUID = async (councilEmail) => {
  let certificates = [];
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
  // if (sheets[sheets.length - 1] && sheets[sheets.length - 1].email) {
  //   console.log("inside");
  //   sheets.pop();
  // }
  // console.log(sheets);
  console.log(councilEmail);
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
      const etrx = [
        "D1E",
        "D1",
        "D6",
        "D11A",
        "D11B",
        "D16A",
        "D16B",
        "D6E",
        "D11",
      ];
      const extc = [
        "D4A",
        "D4B",
        "D9A",
        "D9B",
        "D14A",
        "D14B",
        "D14C",
        "D19A",
        "D19B",
        "D19C",
      ];
      const cmpn = [
        "D2A",
        "D2B",
        "D2C",
        "D7A",
        "D7B",
        "D7C",
        "D12A",
        "D12B",
        "D12C",
        "D17A",
        "D17B",
        "D17C",
      ];
      const inft = ["D5A", "D5B", "D10A", "D10B", "D15", "D20"];
      const instru = ["D3", "D8", "D13", "D18"];
      const aids = ["D1AD", "D6AD"];
      const mca = ["MCA1A", "MCA1B", "MCA2A", "MCA2B", "MCA3A", "MCA3B"];
      let branch = "D";
      for (i = 0; i < certificates.length; i++) {
        // Send each row to firebase, under User/{emailID}/Certificates/{UID}
        const month = parseInt(certificates[i].UID.slice(-9, -7));
        let calcYear = `20`;
        if (month > 6) {
          calcYear += certificates[i].UID.slice(-7, -5);
        } else {
          const temp = parseInt(certificates[i].UID.slice(-7, -5)) - 1;
          calcYear += temp.toString();
        }
        if (etrx.includes(certificates[i].division)) branch = "Electronics";
        else if (extc.includes(certificates[i].division))
          branch = "Electronics and Telecommunication";
        else if (cmpn.includes(certificates[i].division))
          branch = "Computer Science";
        else if (inft.includes(certificates[i].division))
          branch = "Information Technology";
        else if (instru.includes(certificates[i].division))
          branch = "Instrumentation";
        else if (aids.includes(certificates[i].division))
          branch = "Artificial Intelligence and Data Science";
        else if (mca.includes(certificates[i].division))
          branch = "Masters in Computer Applications";
        const certi = await db
          .doc(
            `Users/${certificates[i].email}/Certificates/${certificates[i].UID}`
          )
          .set({
            name: certificates[i].name,
            year: calcYear,
            description: certificates[i].description,
            branch: branch,
            link: `https://firebasestorage.googleapis.com/v0/b/certificates-vesit.appspot.com/o/${certificates[i].uidjpg}?alt=media`,
            studentName: certificates[i].studentName,
            councilEmail: certificates[i].councilEmail,
            email: certificates[i].email,
          });
      }
    } else {
      res.render("csv", { errors });
    }
  });
});

module.exports = router;
