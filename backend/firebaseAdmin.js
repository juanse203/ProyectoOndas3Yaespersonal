var admin = require("firebase-admin");

var serviceAccount = require("../../proyectondas-4fc25-firebase-adminsdk-fbsvc-fd03ac1ad5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };