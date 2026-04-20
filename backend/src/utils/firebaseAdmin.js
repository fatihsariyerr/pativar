const admin = require('firebase-admin');

let initialized = false;

function getAdmin() {
  if (initialized) return admin;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin yapılandırılmamış (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY env değişkenleri eksik)');
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  initialized = true;
  return admin;
}

async function verifyPhoneIdToken(idToken) {
  const a = getAdmin();
  const decoded = await a.auth().verifyIdToken(idToken);
  if (!decoded.phone_number) {
    throw new Error('Token telefon numarası içermiyor');
  }
  return decoded;
}

module.exports = { verifyPhoneIdToken };
