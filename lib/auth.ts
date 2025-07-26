'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GithubAuthProvider,
  signInWithPopup,
  type Auth,
} from 'firebase/auth';
import { app, db } from './firebase';
import { cookies } from 'next/headers';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SESSION_COOKIE_NAME = 'firebase-session-token';

export async function getFirebaseAuth(): Promise<Auth> {
  return getAuth(app);
}

// Check if a user profile exists in Firestore for the given role
async function userProfileExists(uid: string, userType: 'worker' | 'household' | 'admin'): Promise<boolean> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  const userDoc = await getDoc(doc(db, collectionName, uid));
  return userDoc.exists();
}

// Create a user profile in Firestore for the given role
async function createUserProfile(uid: string, email: string, userType: 'worker' | 'household' | 'admin') {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  await setDoc(doc(db, collectionName, uid), { email, createdAt: new Date().toISOString() });
}

// Sign up with email and password, and create a user profile
export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  userType: 'worker' | 'household' | 'admin'
) {
  const auth = await getFirebaseAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Create user profile in Firestore
    await createUserProfile(userCredential.user.uid, email, userType);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true, uid: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign in with email and password, checking for user profile existence
export async function signInWithEmailAndPasswordHandler(
  email: string,
  password: string,
  userType: 'worker' | 'household' | 'admin'
) {
  const auth = await getFirebaseAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    const profileExists = await userProfileExists(userCredential.user.uid, userType);
    if (!profileExists && userType !== 'admin') {
      await firebaseSignOut(auth);
      return { success: false, error: "User profile not found for this role." };
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true, isNewUser: !profileExists };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign in with GitHub, checking for user profile existence
export async function signInWithGitHub(userType: 'worker' | 'household' | 'admin') {
  const auth = getAuth(app);
  const provider = new GithubAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    const profileExists = await userProfileExists(user.uid, userType);

    return { success: true, isNewUser: !profileExists };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Sign out and clear session cookie
export async function signOut() {
  const auth = await getFirebaseAuth();
  await firebaseSignOut(auth);
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.warn('Could not delete cookie:', error);
  }
}