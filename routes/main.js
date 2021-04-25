const router = require("express").Router();
const dotenv = require("dotenv").config();
const users = JSON.parse(process.env.users);
const firebase = require("firebase/app");
const admin = require("./../firebase-admin");
const db = admin.firestore();
const adminEmail = ["2018.varad.rane@ves.ac.in"];
const teacherEmail = [
  // "2019jai.malani@ves.ac.in",
  "2017.nilesh.talreja@ves.ac.in",
];
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
// const getYearUpdated = (email, UID, year) => {
//   let calcYear = "20";
//   const month = parseInt(UID.slice(-9, -7));
//   if (month > 6) {
//     calcYear += UID.slice(-7, -5);
//   } else {
//     const temp = parseInt(UID.slice(-7, -5)) - 1;
//     calcYear += temp.toString();
//   }
//   db.doc(`Users/${email}/Certificates/${UID}`).update({
//     year: calcYear,
//   });
// };
router.get("/", (req, res) => {
  console.log(
    admin.firestore.Timestamp.fromDate(new Date(Date.now()))
      .toDate()
      .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  );
  res.render("main");
});
const getAccess = (email) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i] == email) {
      return true;
    }
  }
  return false;
};
router.post("/signIn", async (req, res) => {
  const { email, password } = req.body;
  let errors = [];
  let access = false;
  try {
    access = await getAccess(email);
    console.log(access);
    // firebase.auth().sendPasswordResetEmail(email);
    if (access) {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
          console.log("Successful Sign In");
          if (adminEmail.includes(email)) {
            await db
              .collectionGroup("Certificates")
              .orderBy("year")
              .orderBy("branch")
              .orderBy("councilEmail")
              .orderBy("name")
              .orderBy("studentName")
              .get()
              .then((snap) => {
                let allUsers = [];
                snap.docs.forEach((c) => {
                  //here write any function to update in all docs
                  // getYearUpdated(c.data().email, c.data().UID, c.data().year);
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
                res.render("dashboard", {
                  email,
                  status: "admin",
                  allUsers: JSON.stringify(allUsers),
                });
              });
          } else if (teacherEmail.includes(email)) {
            let allUsers = [];
            res.render("dashboard", {
              status: "teacher",
              email,
              allUsers: JSON.stringify(allUsers),
            });
          } else {
            await db
              .collectionGroup("Certificates")
              .where("councilEmail", "==", email)
              .orderBy("year")
              .orderBy("name")
              .orderBy("studentName")
              .get()
              .then((snap) => {
                let allUsers = [];
                snap.docs.forEach((c) => {
                  let user = {
                    ...c.data(),
                    timestamp:
                      c.data().timestamp &&
                      c.data().timestamp.toDate().toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      }),
                    UID: c.id,
                  };
                  allUsers.push(user);
                });
                res.render("dashboard", {
                  email,
                  status: "council",
                  allUsers: JSON.stringify(allUsers),
                });
              });
          }
        })
        .catch((error) => {
          console.log(error);
          errors.push({ msg: "Something went wrong please try later" });
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
