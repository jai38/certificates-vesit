const multer = require("multer");
let fileName;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    fileName = file.originalname;
    cb(null, file.originalname);
  },
});

module.exports = storage;
