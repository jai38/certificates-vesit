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
const uploadUID = async () => {
  finalNums = [];
  rowNum = 0;
  const csv = fs.readFileSync(`./uploads/${fileName}`, "utf-8");
  papaparse.parse(csv, {
    complete: (sheet) => {
      sheets = sheet.data;
    },
  });
  let [a, b, c, d, e, f, g] = sheets.shift();
  flag = true;
  if (
    a != "UID" ||
    b != "Class" ||
    c != "Names" ||
    d != "Certificate_Name" ||
    e != "File_Name" ||
    f != "Email" ||
    g != "Certificate_description"
  ) {
    flag = false;
    errors = [];
    errors.push({
      msg:
        "Please enter Correct Column names as mention in the expected format",
    });
    return -1;
  }
  sheets.pop();
  sheets.forEach(async (c) => {
    rowNum++;
    let currentCerti = {
      email: c[5],
      UID: c[0],
      name: c[3],
      description: c[6],
      // councilEmail,
    };
    if (!(c[5] && c[0] && c[3] && c[6])) {
      flag = false;
      finalNums.push(rowNum + 1);
    } else if (c[5] == "" || c[0] == "" || c[3] == "" || c[6] == "") {
      flag = false;
      finalNums.push(rowNum + 1);
    }
    certificates.push(currentCerti);
  });
  console.log(certificates);
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
    const file = req.file;
    fileName = file.filename;
    certificates = await uploadUID();
    /*for (i=0;i<(certificates.length-1);i++) {
      
      const emailID = certificates[i].email;
      const certiUID = certificates[i].UID;
      const certiName = certificates[i].name;
      const certiYear = certificates[i].year;
      const link = [];

      db.collection("Users").get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            var certiRef = db.collection("Users").doc(doc.id);
              certiRef.update({
                certificates: firebase.firestore.FieldValue.arrayUnion({
                  "UID": certiUID,
                  "certiYear": certiYear,
                  "name": certiName,
                  "link": link
                })
              });    
          });
        });
    }*/
    if (flag) {
      errors = [];
      fs.writeFileSync("count.txt", `${rowNum}`);
      errors = [];
      errors.push({
        msg: `You are supposed to upload ${rowNum} certificates below`,
      });
      res.render("certis", { errors, count: rowNum });
      for (i = 0; i < certificates.length - 1; i++) {
        const link = `https://firebasestorage.googleapis.com/v0/b/vesit-bot-web.appspot.com/o/${certificates[i].UID}?alt=media`;

        // Send each row to firebase, under User/{emailID}/Certificates/{UID}
        const month = parseInt(certificates[i].UID.slice(-9,-7));
        let calcYear = `20`
        if (month > 6) {
          calcYear += certificates[i].UID.slice(-7,-5)
        }
        else {
          const temp = parseInt(certificates[i].UID.slice(-7,-5)) - 1
          calcYear += temp.toString()
        }
        
        const certi = await db
          .doc(
            `Users/${certificates[i].email}/Certificates/${certificates[i].UID}`
          )
          .set({
            name: certificates[i].name,
            year: calcYear,
            description: certificates[i].description,
            link: `https://firebasestorage.googleapis.com/v0/b/certificates-vesit.appspot.com/o/${certificates[i].UID}.jpg?alt=media`,
          });
      }
    } else {
      res.render("csv", { errors });
    }
  });
});

module.exports = router;
