const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");

router.get("/", (req, res) => {
  res.render("certis");
});
router.post("/", (req, res) => {
  let uploadCertis = multer({
    storage: storage,
  }).array("certis");
  uploadCertis(req, res, (err) => {
    res.render("csv");
  });
});

module.exports = router;
