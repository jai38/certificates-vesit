const admin = require("firebase-admin");
const serviceKey = require("./serviceKey.json");
// Initialize Firebase App only once
const firbaseConfig = {
  credential: admin.credential.cert(serviceKey),
  apiKey: process.env.DISCORD_APP_FIREBASE_API_KEY,
  authDomain: process.env.DISCORD_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.DISCORD_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.DISCORD_APP_FIREBASE_STORAGE_BUCKET,
};
admin.initializeApp(firbaseConfig);

module.exports = admin;
