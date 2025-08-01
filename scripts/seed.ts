// scripts/seed.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, doc, Firestore } from 'firebase/firestore';
import { workers } from '../lib/seed-data';
import 'dotenv/config';

function getFirebaseConfig() {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

function getFirebaseApp(): FirebaseApp {
  return getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApps()[0];
}

async function seedDatabase(db: Firestore) {
  const workerCollectionRef = collection(db, 'worker');
  const batch = writeBatch(db);

  console.log('Starting to seed worker collection...');

  workers.forEach((worker) => {
    const docRef = doc(workerCollectionRef);
    batch.set(docRef, worker);
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${workers.length} workers into the worker collection.`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

(async () => {
  try {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    await seedDatabase(db);
    console.log('Seeding script finished.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();