const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");
const fs = require("fs");
const admin = require("./../firebase-admin");

const defaultStorage = admin.storage();
const bucket = defaultStorage.bucket();
let errors = [];
router.get("/", (req, res) => {
  res.render("certis");
});
router.post("/", (req, res) => {
  const count = fs.readFileSync("count.txt", "utf-8");
  console.log(count);
  let uploadCertis = multer({
    storage: storage,
  }).array("certis", parseInt(count));
  uploadCertis(req, res, (err) => {
    errors = [];
    if (err) {
      errors.push({ msg: `You have entered more files than ${count}` });
      res.render("certis", { errors });
    }
    let files = req.files;
    if (files.length < count) {
      errors.push({ msg: `You have entered less files than ${count}` });
      res.render("certis", { errors });
    } else if (!err) {
      files.forEach((file) => {
        if (file) {
          bucket
            .upload(`./uploads/${file.filename}`)
            .then(() =>
              console.log(
                `https://firebasestorage.googleapis.com/v0/b/certificates-vesit.appspot.com/o/${file.filename}?alt=media`
              )
            );
        }
      });
      res.send("Done!!!!");
    }
  });
});

module.exports = router;
