const router = require("express").Router();
const dotenv = require("dotenv").config();
const users = JSON.parse(process.env.users);
const fs = require("fs");
const firebase = require("firebase/app");
require("firebase/auth");

if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.bucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

router.get("/", (req, res) => {
  res.render("main");
});

router.post("/signIn", (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  try {
    const name = email.split(".");
    let user = name[0];
    user = users[user];
    console.log(email);
    console.log(user);
    // firebase.auth().sendPasswordResetEmail(email);
    if (user.email == email) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          console.log("Successful Sign In");
          fs.writeFileSync("email.txt", email);
          res.render("csv");
        })
        .catch((error) => {
          // console.log(error.message);
          errors.push({ msg: "Invalid VES email or password" });
          res.render("main", { errors });
        });
    } else {
      errors.push({ msg: "This email id is not registered in our system!" });
      res.render("main", { errors });
    }
  } catch (e) {
    errors.push({ msg: "This email id is not registered in our system!" });
    res.render("main", { errors });
  }
});

router.post("/signOut", (req, res) => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("Successful Sign Out");
    })
    .catch((error) => {
      console.log(error.message);
    });
});

router.post("/resetPass", (req, res) => {
  const { email } = req.body;
  const errors = [];

  try {
    const name = email.split(".");
    let user = name[0];
    user = users[user];
    if (user.email == email) {
      firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then((userCredential) => {
          console.log("Successfully Sent Email!");
          errors.push({ msg: "Email Successfully Sent!" });
          res.render("main", { errors });
        })
        .catch((error) => {
          // console.log(error.message);
          errors.push({ msg: "Invalid VES email or password" });
          res.render("main", { errors });
        });
    }
  } catch (e) {
    errors.push({ msg: "This email id is not registered in our system!" });
    res.render("main", { errors });
  }
});

// router.post('/oauth', (req, res) => {
//   const id = JSON.stringify(req.body);
//   // console.log(id);

//   // Build Firebase credential with the Google ID token.
//   var credential = firebase.auth.GoogleAuthProvider.credential(id);

//   // Sign in with credential from the Google user.
//   firebase.auth().signInWithCredential(credential).then(user => {
//     console.log("Success");
//     // res.render("csv")
//   }).catch((error) => {
//     console.log(error.message);
//   });
// });

// router.post("/", (req, res) => {

// firebase.auth().signInWithRedirect(provider);
// firebase.auth().signInWithPopup(provider).then(user=> console.log(user));

// auth.signInWithEmailAndPassword(email, password).then(user => {
//   console.log(user)
//   res.render("csv")
// }).catch(error => {
//   console.log(error)
// })

// res.render("csv");

// var id_token = googleUser.getAuthResponse().id_token

// // Build Firebase credential with the Google ID token.
// var credential = firebase.auth.GoogleAuthProvider.credential(id_token);

// // Sign in with credential from the Google user.
// firebase.auth().signInWithCredential(credential)
// .then((obj)=> res.render("csv"))
// .catch((error) => {
//   // Handle Errors here.
//   var errorCode = error.code;
//   var errorMessage = error.message;
//   // The email of the user's account used.
//   var email = error.email;
//   // The firebase.auth.AuthCredential type that was used.
//   var credential = error.credential;
//   // ...
// });

// firebase.auth()
//   .signInWithPopup(provider)
//   .then((result) => {
//     /** @type {firebase.auth.OAuthCredential} */
//     var credential = result.credential;

//     // This gives you a Google Access Token. You can use it to access the Google API.
//     var token = credential.accessToken;
//     // The signed-in user info.
//     var user = result.user;
//     console.log(user)
//   }).catch((error) => {
//     // Handle Errors here.
//     console.log(error.message)
//   });

// console.log(provider);
// });
module.exports = router;
