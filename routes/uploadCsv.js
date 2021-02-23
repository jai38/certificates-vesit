const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");
const papaparse = require("papaparse");
const fs = require("fs");
const dotenv = require('dotenv').config();
const firebase = require('firebase/app');
require('firebase/firestore');

// Initialize Firebase App only once
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.DISCORD_APP_FIREBASE_API_KEY,
    authDomain: process.env.DISCORD_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.DISCORD_APP_FIREBASE_PROJECT_ID
  });
} else {
  firebase.app();
}

// Handle for Cloud Firsestore
const db = firebase.firestore();

let certificates = []; // Initialize JSON array
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
    let currentCerti = {
      email: c[5],
      UID: c[0],
      name: c[3],
      year: 2020,
    };
    certificates.push(currentCerti);
  });
  return certificates;
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
    for (i = 0; i< certificates.length - 1 ; i++) {
      const link = [];

      // Send each row to firebase, under User/{emailID}/Certificates/{UID}
      const certi = await db.doc(`Users/${certificates[i].email}/Certificates/${certificates[i].UID}`).set({
        name: certificates[i].name,
        year: certificates[i].year,
        link: link,
      });
    }

  });
});

module.exports = router;
