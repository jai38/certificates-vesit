const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");

router.get("/", (req, res) => {
  res.render("uploadCerits");
});
router.post("/", (req, res) => {
  let uploadCertis = multer({
    storage: storage,
  }).array("cerits");
  uploadCertis(req, res, (err) => {
    res.redirect("./uploadCsv");
  });
});

module.exports = router;
