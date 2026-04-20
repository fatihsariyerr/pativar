import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyBbT0o-wroYRDbOenN5XyaO_F9Fw-ifRBY",
  authDomain: "pativar-dbb37.firebaseapp.com",
  projectId: "pativar-dbb37",
  storageBucket: "pativar-dbb37.firebasestorage.app",
  messagingSenderId: "126656226745",
  appId: "1:126656226745:web:27852ad78e106019508268",
  measurementId: "G-8R7RBT2HFF"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
auth.languageCode = 'tr';