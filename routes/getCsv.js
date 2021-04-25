const express = require("express");
const admin = require("./../firebase-admin");
const db = admin.firestore();
const JSONtoCSV = require("json2csv").parse;
const fs = require("fs");
const router = express.Router();
const branches = [
  "null",
  "Computer Science",
  "Information Technology",
  "Electronics and Telecommunication",
  "Electronics",
  "Instrumentation",
  "Artificial Intelligence and Data Science",
  "Masters in Computer Applications",
];
router.post("/", async (req, res) => {
  let errors = [];
  const value = req.body.branch;
  const branch = branches[value];
  if (branch == "null") {
    errors.push({ msg: "Please select Branch" });
    res.render("dashboard", { status: "teacher", errors });
  } else {
    await db
      .collectionGroup("Certificates")
      .where("branch", "==", branch)
      .orderBy("year")
      .orderBy("councilEmail")
      .orderBy("name")
      .orderBy("studentName")
      .get()
      .then((snap) => {
        let allUsers = [];
        snap.docs.forEach((c) => {
          let newYear = parseInt(c.data().year) + 1;
          let user = {
            ...c.data(),
            year: c.data().year + "-" + newYear,
            timestamp:
              c.data().timestamp &&
              c.data().timestamp.toDate().toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              }),
            UID: c.id,
          };
          allUsers.push(user);
        });
        const csv = JSONtoCSV(allUsers, {
          fields: [
            "UID",
            "email",
            "studentName",
            "year",
            "councilEmail",
            "name",
            "description",
            "link",
          ],
        });
        fs.writeFileSync(`public/${branch}.csv`, csv);
        res.send(
          `<a href="/${branch}.csv" download="${branch}.csv" id="download-link"></a><script>document.getElementById('download-link').click();</script>`
        );
      });
  }
});

module.exports = router;
