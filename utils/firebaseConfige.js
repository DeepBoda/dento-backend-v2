const firebase = require("firebase-admin");

const serviceAccount = require("./dento-c5a3d-firebase-adminsdk-k8dvq-c5d8667776.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

module.exports = firebase;
