// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "API_KEY_PRIVATE",
  authDomain: "study-bitz.firebaseapp.com",
  projectId: "study-bitz",
  storageBucket: "study-bitz.firebasestorage.app",
  messagingSenderId: "287016758039",
  appId: "1:287016758039:web:95ef04d375045e09dfe552",
  measurementId: "G-E0PJCF7MLT",
};

const app = initializeApp(firebaseConfig);

// Export Auth + Database
export const auth = getAuth(app);
export const db = getDatabase(app);
