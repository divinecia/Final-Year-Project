// Sends a password reset email using Firebase Auth
export async function sendPasswordResetEmail(email: string, userType: UserType): Promise<void> {
  const auth = await getFirebaseAuth();
  try {
    // Optionally, you can check if the user exists in Firestore for the given userType before sending
    // const userExists = await userProfileExistsByEmail(email, userType);
    // if (!userExists) throw new Error('No user found with this email.');
    const { sendPasswordResetEmail: firebaseSendPasswordResetEmail } = await import('firebase/auth');
    await firebaseSendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error(`Password reset error for ${userType}:`, error);
    throw new Error(error.message || 'Failed to send password reset email.');
  }
}
'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from 'firebase/auth';
export async function signInWithGoogle(
  userType: UserType
): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();

    (await cookies()).set(SESSION_COOKIE_NAME, idToken, COOKIE_OPTIONS);

    const profileExists = await userProfileExists(user.uid, userType);

    return { success: true, isNewUser: !profileExists };
  } catch (error: any) {
    console.error('Google sign in error:', error);
    return { success: false, error: error.message };
  }
}
import { app, db } from './firebase';
import { cookies } from 'next/headers';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SESSION_COOKIE_NAME = 'firebase-session-token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
};

export async function getFirebaseAuth(): Promise<Auth> {
  return getAuth(app);
}

type UserType = 'worker' | 'household' | 'admin';

async function userProfileExists(uid: string, userType: UserType): Promise<boolean> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  const userDoc = await getDoc(doc(db, collectionName, uid));
  return userDoc.exists();
}

async function createUserProfile(uid: string, email: string, userType: UserType): Promise<void> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  await setDoc(doc(db, collectionName, uid), {
    email,
    createdAt: Date.now(),
  });
}

export async function signUpWithEmailAndPassword(
  email: string,
  password: string,
  userType: UserType
): Promise<{ success: boolean; uid?: string; error?: string }> {
  const auth = await getFirebaseAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    await createUserProfile(userCredential.user.uid, email, userType);

    (await cookies()).set(SESSION_COOKIE_NAME, idToken, COOKIE_OPTIONS);

    return { success: true, uid: userCredential.user.uid };
  } catch (error: any) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

export async function signInWithEmailAndPasswordHandler(
  email: string,
  password: string,
  userType: UserType
): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> {
  const auth = await getFirebaseAuth();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    const profileExists = await userProfileExists(userCredential.user.uid, userType);
    if (!profileExists && userType !== 'admin') {
      await firebaseSignOut(auth);
      return { success: false, error: "User profile not found for this role." };
    }

    (await cookies()).set(SESSION_COOKIE_NAME, idToken, COOKIE_OPTIONS);

    return { success: true, isNewUser: !profileExists };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

export async function signInWithGitHub(
  userType: UserType
): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> {
  const auth = getAuth(app);
  const provider = new GithubAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();

    (await cookies()).set(SESSION_COOKIE_NAME, idToken, COOKIE_OPTIONS);

    const profileExists = await userProfileExists(user.uid, userType);

    return { success: true, isNewUser: !profileExists };
  } catch (error: any) {
    console.error('GitHub sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Dummy password reset code verification
export async function verifyPasswordResetCode(
  verificationId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  if (code === '123456') {
    return { success: true };
  } else {
    return { success: false, error: 'Invalid verification code.' };
  }
}

export async function signOut(): Promise<void> {
  const auth = await getFirebaseAuth();
  await firebaseSignOut(auth);
  try {
    (await cookies()).delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.warn('Could not delete cookie:', error);
  }
}

// Alias for compatibility with login pages
export const signIn = signInWithEmailAndPasswordHandler;
