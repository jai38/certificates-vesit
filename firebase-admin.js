const admin = require("firebase-admin");
const serviceKey = JSON.parse(process.env.serviceKey);
// Initialize Firebase App only once
const firbaseConfig = {};
admin.initializeApp({
  storageBucket: process.env.bucket,
  credential: admin.credential.cert(serviceKey),
});

module.exports = admin;
