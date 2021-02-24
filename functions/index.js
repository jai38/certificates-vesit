const functions = require("firebase-functions");
const express = require("express");
const { app } = require("firebase-admin");
const main = express();

main.set("views", "./views");
main.set("view engine", "ejs");

main.use("/", require("./../routes/main"));
main.use("/certis", require("./../routes/certis"));
main.use("/csv", require("../routes/csv"));
exports.main = functions.https.onRequest(main);
