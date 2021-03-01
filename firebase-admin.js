const admin = require("firebase-admin");
const serviceKey = require("./certificatesKey.json");
// Initialize Firebase App only once
const firbaseConfig = {};
admin.initializeApp({
  storageBucket: process.env.bucket,
  credential: admin.credential.cert(serviceKey),
});

module.exports = admin;
