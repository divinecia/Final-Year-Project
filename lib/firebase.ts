import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQZsvMlcu3H8G5K7x6TMgMj-F2fEUVKWo",
  authDomain: "househelp-42493.firebaseapp.com",
  projectId: "househelp-42493",
  storageBucket: "househelp-42493.appspot.com",
  messagingSenderId: "251592966595",
  appId: "1:251592966595:web:e6dbd8bf39d25808d1bd76",
  measurementId: "G-RT9TY3VS9L"
};

// Initialize Firebase app (singleton)
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Analytics is only available in the browser
let analytics: Analytics | undefined;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((error) => {
    console.warn('Analytics not supported:', error);
  });
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// Configure auth for development environments
if (typeof window !== "undefined") {
  const currentDomain = window.location.hostname;
  if (currentDomain.includes('replit.dev') || currentDomain.includes('repl.co')) {
    // Handle Replit domain configuration
    console.log('Running on Replit domain:', currentDomain);
    
    // Configure auth settings for Replit domains
    auth.settings.appVerificationDisabledForTesting = true;
  }
}

export { app, analytics, auth, db, storage };
