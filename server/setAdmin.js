// setAdmin.js
const admin = require('firebase-admin');

// you’ll need your service account JSON here:
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

async function setAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`✅ ${uid} is now an admin.`);
}

// replace with the real UID of the user you want to promote
setAdmin('P9mhvAlr0uOX4ybzy9VYwVEGtmC2').catch(console.error);


await firebase.auth().currentUser.getIdTokenResult(true);
