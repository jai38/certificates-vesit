const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
const defaultStorage = admin.storage();
const bucket = defaultStorage.bucket();
router.get("/", (req, res) => {
  res.render("userData");
});
router.post("/", async (req, res) => {
  const { currentUser } = req.body;
  let errors = [];
  const { email, UID, fileName } = JSON.parse(currentUser);
  console.log(fileName + "is deleted");
  //deleting from firestore
  await db
    .doc(`Users/${email}/Certificates/${UID}`)
    .delete()
    .then(() => {
      //deleting from bucket
      // bucket
      //   .file(fileName)
      //   .delete()
      //   .then((r) => {
      //     errors = [];
      errors.push({
        msg:
          "Certificate Deleted successfully!! Please re-login to see changes",
      });
      //   });
      res.render("userData", { errors });
    })
    .catch((err) => {
      console.log(err);
      errors = [];
      errors.push({
        msg: "Can't delete at this time please try later",
      });
      res.render("userData", { errors });
    });
});
module.exports = router;
