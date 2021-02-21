const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");

router.get("/", (req, res) => {
  res.render("dashboard");
});
router.post("/", (req, res) => {
  let uploadCsv = multer({
    storage: storage,
  }).single("csv");
  uploadCsv(req, res, (err) => {
    res.send("done");
  });
});

module.exports = router;
