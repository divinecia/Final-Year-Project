// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQZsvMlcu3H8G5K7x6TMgMj-F2fEUVKWo",
  authDomain: "househelp-42493.firebaseapp.com",
  projectId: "househelp-42493",
  storageBucket: "househelp-42493.firebasestorage.app",
  messagingSenderId: "251592966595",
  appId: "1:251592966595:web:e6dbd8bf39d25808d1bd76",
  measurementId: "G-RT9TY3VS9L"
};

import { getAnalytics, isSupported } from "firebase/analytics";

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics, auth, db, storage };
