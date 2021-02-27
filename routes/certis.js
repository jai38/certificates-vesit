const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");

const errors = [];
router.get("/", (req, res) => {
  res.render("certis");
});
router.post("/", (req, res) => {
  let uploadCertis = multer({
    storage: storage,
  }).array("certis", count);
  uploadCertis(req, res, (err) => {
    console.log(req.body);
    if (err) {
      errors.push({ msg: `You have entered more files than ${count}` });
      res.render("certis", { errors });
    }
    res.send("Done!!!!");
  });
});

module.exports = router;
