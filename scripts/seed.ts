// src/scripts/seed.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc } from 'firebase/firestore';
import { workers } from '../lib/seed-data';
import 'dotenv/config'; // Make sure to install dotenv: npm install dotenv

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

async function seedDatabase() {
  const workerCollectionRef = collection(db, 'worker');
  const batch = writeBatch(db);

  console.log('Starting to seed worker collection...');

  workers.forEach((worker) => {
    // In a real app, you might want to use a specific ID, but for seeding,
    // Firestore's auto-generated IDs are perfect.
    const docRef = doc(workerCollectionRef);
    batch.set(docRef, worker);
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${workers.length} workers into the worker collection.`);
  } catch (error) {
    console.error('Error seeding database: ', error);
  }
}

seedDatabase().then(() => {
    console.log("Seeding script finished.");
    // The process might hang if there are open handles. 
    // This explicit exit is sometimes necessary in scripts.
    process.exit(0);
});
