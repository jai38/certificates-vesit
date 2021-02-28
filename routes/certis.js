const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");
const serviceKey = require("./../serviceKey.json");
const admin = require("firebase-admin");
const firbaseConfig = {
  credential: admin.credential.cert(serviceKey),
  apiKey: process.env.DISCORD_APP_FIREBASE_API_KEY,
  authDomain: process.env.DISCORD_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.DISCORD_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.DISCORD_APP_FIREBASE_STORAGE_BUCKET,
};
admin.initializeApp(firbaseConfig);
const defaultStorage = admin.storage();
const bucket = defaultStorage.bucket();
const errors = [];
router.get("/", (req, res) => {
  res.render("certis");
});
router.post("/", (req, res) => {
  let uploadCertis = multer({
    storage: storage,
  }).array("certis", 100);
  uploadCertis(req, res, (err) => {
    if (err) {
      errors.push({ msg: `You have entered more files than ${count}` });
      res.render("certis", { errors });
    }
    let files = req.files;
    files.forEach((file) => {
      if (file) {
        bucket
          .upload(`./uploads/${file.filename}`)
          .then(() =>
            console.log(
              `https://firebasestorage.googleapis.com/v0/b/vesit-bot-web.appspot.com/o/${file.filename}?alt=media`
            )
          );
      }
    });
    res.send("Done!!!!");
  });
});

module.exports = router;
