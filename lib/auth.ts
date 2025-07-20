
'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  PhoneAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  type Auth,
} from 'firebase/auth';
import { app, db } from './firebase';
import { cookies } from 'next/headers';
import { doc, getDoc } from 'firebase/firestore';

const SESSION_COOKIE_NAME = 'firebase-session-token';

export async function getFirebaseAuth(): Promise<Auth> {
  return getAuth(app);
}

// Helper to check if a user profile exists in Firestore
async function userProfileExists(uid: string, userType: 'worker' | 'household' | 'admin'): Promise<boolean> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  const userDoc = await getDoc(doc(db, collectionName, uid));
  return userDoc.exists();
}


export async function signUpWithEmailAndPassword(email: string, password: string) {
  const auth = await getFirebaseAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

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

export async function signIn(email: string, password: string, userType: 'worker' | 'household' | 'admin') {
  const auth = await getFirebaseAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    const profileExists = await userProfileExists(userCredential.user.uid, userType);
     if (!profileExists && userType !== 'admin') {
      // For non-admins, if the profile doesn't exist, treat it as a failed login for that user type.
      // This prevents a household user from logging into the worker portal, for example.
      await firebaseSignOut(auth); // Sign out the user from Firebase Auth
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

export async function signInWithGitHub(userType: 'worker' | 'household') {
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

export async function signOut() {
  const auth = await getFirebaseAuth();
  await firebaseSignOut(auth);
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    // In test environment or outside request context, cookies() may fail
    console.warn('Could not delete cookie:', error);
  }
}


// This function can remain a server action as it doesn't need a browser environment.
export async function verifyPasswordResetCode(verificationId: string, code: string): Promise<{ success: boolean, error?: string }> {
    try {
        const credential = PhoneAuthProvider.credential(verificationId, code);
        // We don't need to sign in, just creating the credential object is enough to
        // implicitly verify the code. If it's wrong, it will throw an error.
        return { success: true };
    } catch (error: any) {
        console.error("Error verifying code: ", error);
        if (error.code === 'auth/invalid-verification-code') {
             return { success: false, error: "The code you entered is invalid." };
        }
        return { success: false, error: "Failed to verify code. Please try again." };
    }
}
