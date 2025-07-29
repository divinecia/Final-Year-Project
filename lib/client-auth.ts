'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignIn,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  User
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';

export interface AuthResult {
  success: boolean;
  uid?: string;
  user?: User;
  error?: string;
}

/**
 * Maps Firebase error codes to user-friendly messages.
 */
function getAuthErrorMessage(error: FirebaseError, context: 'signup' | 'signin' | 'google' | 'github' | 'signout'): string {
  switch (context) {
    case 'signup':
      switch (error.code) {
        case 'auth/email-already-in-use':
          return 'This email is already registered. Please try signing in instead.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/weak-password':
          return 'Password should be at least 6 characters long.';
        case 'auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.authenticationservice.signup-are-blocked.':
          return 'User registration is currently disabled. Please contact support.';
        default:
          return `Registration failed: ${error.message}`;
      }
    case 'signin':
      switch (error.code) {
        case 'auth/user-not-found':
          return 'No account found with this email address.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later.';
        default:
          return `Sign in failed: ${error.message}`;
      }
    case 'google':
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          return 'Sign-in was cancelled. Please try again.';
        case 'auth/popup-blocked':
          return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
        case 'auth/cancelled-popup-request':
          return 'Another sign-in attempt is in progress.';
        default:
          return `Google sign-in failed: ${error.message}`;
      }
    case 'github':
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          return 'Sign-in was cancelled. Please try again.';
        case 'auth/popup-blocked':
          return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
        case 'auth/account-exists-with-different-credential':
          return 'An account already exists with the same email but different sign-in method.';
        default:
          return `GitHub sign-in failed: ${error.message}`;
      }
    case 'signout':
      return `Sign out failed: ${error.message}`;
    default:
      return error.message;
  }
}

/**
 * Registers a new user with email and password.
 */
export async function signUpWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      uid: userCredential.user.uid,
      user: userCredential.user
    };
  } catch (error) {
    const err = error as FirebaseError;
    return {
      success: false,
      error: getAuthErrorMessage(err, 'signup')
    };
  }
}

/**
 * Signs in a user with email and password.
 */
export async function signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    return {
      success: true,
      uid: userCredential.user.uid,
      user: userCredential.user
    };
  } catch (error) {
    const err = error as FirebaseError;
    return {
      success: false,
      error: getAuthErrorMessage(err, 'signin')
    };
  }
}

/**
 * Signs out the current user.
 */
export async function signOut(): Promise<AuthResult> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    const err = error as FirebaseError;
    return {
      success: false,
      error: getAuthErrorMessage(err, 'signout')
    };
  }
}

/**
 * Returns the currently signed-in user, or null if not signed in.
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Gets the current user's ID token, or null if not signed in.
 */
export async function getIdToken(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

/**
 * Signs in with Google using a popup.
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return {
      success: true,
      uid: userCredential.user.uid,
      user: userCredential.user
    };
  } catch (error) {
    const err = error as FirebaseError;
    return {
      success: false,
      error: getAuthErrorMessage(err, 'google')
    };
  }
}

/**
 * Signs in with GitHub using a popup.
 */
export async function signInWithGitHub(): Promise<AuthResult> {
  try {
    const provider = new GithubAuthProvider();
    provider.addScope('user:email');
    const userCredential = await signInWithPopup(auth, provider);
    return {
      success: true,
      uid: userCredential.user.uid,
      user: userCredential.user
    };
  } catch (error) {
    const err = error as FirebaseError;
    return {
      success: false,
      error: getAuthErrorMessage(err, 'github')
    };
  }
}
