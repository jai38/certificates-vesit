const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");
const fs = require("fs");

const admin = require("./../firebase-admin");
const defaultStorage = admin.storage();
const bucket = defaultStorage.bucket();

const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
});
let errors = [];
const sendEmail = (details, emails, links) => {
  for (let i = 0; i < emails.length; i++) {
    let mailOptions = {
      from: process.env.user,
      to: emails[i],
      subject: `Certificate for ${details[i].name}`,
      html: `    <div>
      <h3>Congratulations ${details[i].studentName}!</h3>
      <pre style='font-family: Arial, Helvetica, sans-serif;'>
Greetings from Certificates team!

We are delighted to provide you with the certificate of <strong>${details[i].name}</strong>

Your success is an inspiration to us all and we are thrilled to present you with your <strong>certificate of appreciation!</strong>

To download the certificate please click on <a href="${links[i]}">this link</a> or head to your <a href="https://discord.gg/xukZP7w7zf">official VESIT student server.</a>
Keep up the good work and we hope you join us again!

<strong>Regards,</strong>
<strong>Certificate Team,</strong>
<strong>VESIT.</strong>
      </pre>
      <p>Note: This is a system generated mail, please do not reply.</p>
      </strong><br><img style='width: 480px; height: 480px' src="${links[i]}"/>
    </div>`,
    };
    setTimeout(() => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Email Sent: " + info.response);
        }
      });
    }, 5000);
  }
};
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
      errors = [];
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
      errors = [];
      errors.push({ msg: "All Files are uploaded sucessfully" });
      details = JSON.parse(fs.readFileSync("details.txt", "utf-8"));
      let emails = [];
      let links = [];
      details.forEach((c) => {
        emails.push(c.email);
        links.push(
          `https://firebasestorage.googleapis.com/v0/b/certificates-vesit.appspot.com/o/${c.uidjpg}?alt=media`
        );
      });
      sendEmail(details, emails, links);
      res.render("main", { errors });
      fs.writeFileSync("email.txt", "");
    }
  });
});

module.exports = router;
