const admin = require('firebase-admin');
let db, auth;

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (error) { console.error('Firebase init error:', error.message); }
}

if (admin.apps.length) {
  db = admin.firestore();
  auth = admin.auth();
}

module.exports = { db, auth, admin };