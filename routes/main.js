const router = require("express").Router();
const dotenv = require("dotenv").config();
const users = JSON.parse(process.env.users);
router.get("/", (req, res) => {
  res.render("main");
});
router.post("/", (req, res) => {
  const { email, password } = req.body;
  const errors = [];
  try {
    const name = email.split(".");
    let user = name[0];
    user = users[user];
    if (user.email == email && user.password == password) {
      res.render("csv");
    } else if (user.email == email) {
      errors.push({ msg: "Invalid password" });
      res.render("main", { errors });
    } else {
      errrs.push({ msg: "Please enter vesit council email" });
      res.render("main", { errors });
    }
  } catch (e) {
    errors.push({ msg: "Please enter vesit council email" });
    res.render("main", { errors });
  }
});
module.exports = router;
