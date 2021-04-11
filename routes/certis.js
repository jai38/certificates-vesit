const router = require("express").Router();
const storage = require("../storage");
const multer = require("multer");

const admin = require("./../firebase-admin");
const defaultStorage = admin.storage();
const bucket = defaultStorage.bucket();
const db = admin.firestore();

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
const updateCertis = async (certificates) => {
  const etrx = [
    "D1E",
    "D1",
    "D6",
    "D11A",
    "D11B",
    "D16A",
    "D16B",
    "D6E",
    "D11",
  ];
  const extc = [
    "D4A",
    "D4B",
    "D9A",
    "D9B",
    "D14A",
    "D14B",
    "D14C",
    "D19A",
    "D19B",
    "D19C",
  ];
  const cmpn = [
    "D2A",
    "D2B",
    "D2C",
    "D7A",
    "D7B",
    "D7C",
    "D12A",
    "D12B",
    "D12C",
    "D17A",
    "D17B",
    "D17C",
  ];
  const inft = ["D5A", "D5B", "D10A", "D10B", "D15", "D20"];
  const instru = ["D3", "D8", "D13", "D18"];
  const aids = ["D1AD", "D6AD"];
  const mca = ["MCA1A", "MCA1B", "MCA2A", "MCA2B", "MCA3A", "MCA3B"];
  let branch = "D";
  let date = admin.firestore.Timestamp.fromDate(new Date(Date.now())).toDate();
  console.log(date.getFullYear());
  console.log(date.getMonth() + 1);
  for (let i = 0; i < certificates.length; i++) {
    let calcYear = '20';
    //old method with UID

    const month = parseInt(certificates[i].UID.slice(-9, -7));
    if (month > 6) {
      calcYear += certificates[i].UID.slice(-7, -5);
    } else {
      const temp = parseInt(certificates[i].UID.slice(-7, -5)) - 1;
      calcYear += temp.toString();
    }

    //new method with current date

    // const month = date.getMonth() + 1;
    // if (month > 6) {
    //   calcYear = date.getFullYear();
    // } else {
    //   calcYear = date.getFullYear() - 1;
    // }

    if (etrx.includes(certificates[i].division)) branch = "Electronics";
    else if (extc.includes(certificates[i].division))
      branch = "Electronics and Telecommunication";
    else if (cmpn.includes(certificates[i].division))
      branch = "Computer Science";
    else if (inft.includes(certificates[i].division))
      branch = "Information Technology";
    else if (instru.includes(certificates[i].division))
      branch = "Instrumentation";
    else if (aids.includes(certificates[i].division))
      branch = "Artificial Intelligence and Data Science";
    else if (mca.includes(certificates[i].division))
      branch = "Masters in Computer Applications";
    await db
      .doc(`Users/${certificates[i].email}/Certificates/${certificates[i].UID}`)
      .set({
        name: certificates[i].name,
        year: calcYear,
        description: certificates[i].description,
        branch: branch,
        fileName: certificates[i].uidjpg,
        link: `https://firebasestorage.googleapis.com/v0/b/certificates-vesit.appspot.com/o/${certificates[i].uidjpg}?alt=media`,
        studentName: certificates[i].studentName,
        councilEmail: certificates[i].councilEmail,
        email: certificates[i].email,
        UID: certificates[i].UID,
        timestamp: admin.firestore.Timestamp.fromDate(
          new Date(Date.now())
        ).toDate(),
        // .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
  }
};
const waitForEmail = (detail, email, link, i) => {
  setTimeout(() => {
    let mailOptions = {
      from: process.env.user,
      to: email,
      subject: `Certificate for ${detail.name}`,
      html: `    <div>
      <h3>Congratulations ${detail.studentName}!</h3>
      <pre style='font-family: Arial, Helvetica, sans-serif;'>
Greetings from Certificates team!

We are delighted to provide you with the certificate of <strong>${detail.name}</strong>

Your success is an inspiration to us all and we are thrilled to present you with your <strong>certificate of appreciation!</strong>

To download the certificate please click on <a href="${link}">this link</a> or head to your <a href="https://discord.gg/xukZP7w7zf">official VESIT student server.</a>
Keep up the good work and we hope you join us again!

<strong>Regards,</strong>
<strong>Certificate Team,</strong>
<strong>VESIT.</strong>
      </pre>
      <p>Note: This is a system generated mail, please do not reply.</p>
      </strong><br><img style='width: 480px; height: 480px' src="${link}"/>
    </div>`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email Sent: " + info.response);
      }
    });
  }, 3000 * i);
};
const sendEmail = (details, emails, links) => {
  for (let i = 0; i < emails.length; i++) {
    waitForEmail(details[i], emails[i], links[i], i);
  }
};
router.get("/", (req, res) => {
  res.render("certis");
});
router.post("/", (req, res) => {
  let uploadCertis = multer({
    storage: storage,
  }).array("certis");
  uploadCertis(req, res, (err) => {
    let { details, count } = req.body;
    console.log(count);
    errors = [];
    if (err) {
      errors.push({ msg: `Something went wrong please try again later` });
      res.render("certis", { errors, details, count });
    }
    let files = req.files;
    if (files.length < count) {
      errors = [];
      errors.push({ msg: `You have entered less files than ${count}` });
      res.render("certis", { errors, details, count });
    } else if (files.length > count) {
      errors = [];
      errors.push({ msg: `You have entered more files than ${count}` });
      res.render("certis", { errors, details, count });
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
      let emails = [];
      let links = [];
      details = JSON.parse(details);
      details.forEach((c) => {
        emails.push(c.email);
        links.push(
          `https://firebasestorage.googleapis.com/v0/b/certificates-vesit.appspot.com/o/${c.uidjpg}?alt=media`
        );
      });
      updateCertis(details);
      // sendEmail(details, emails, links);
      res.render("main", { errors });
    }
  });
});

module.exports = router;
