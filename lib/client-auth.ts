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
import { auth } from '@/lib/firebase';

export interface AuthResult {
  success: boolean;
  uid?: string;
  user?: User;
  error?: string;
}

/**
 * Client-side Firebase Authentication functions
 * These should be called from client components, not server actions
 */

export async function signUpWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
  try {
    console.log('🔥 Attempting signup with:', { email, passwordLength: password.length });
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    console.log('✅ Signup successful:', userCredential.user.uid);
    
    return { 
      success: true, 
      uid: userCredential.user.uid,
      user: userCredential.user 
    };
  } catch (error: any) {
    console.error('❌ Signup failed:', error);
    
    let errorMessage = error.message;
    
    // Provide user-friendly error messages
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered. Please try signing in instead.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters long.';
        break;
      case 'auth/requests-to-this-api-identitytoolkit-method-google.cloud.identitytoolkit.v1.authenticationservice.signup-are-blocked.':
        errorMessage = 'User registration is currently disabled. Please contact support.';
        break;
      default:
        errorMessage = `Registration failed: ${error.message}`;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export async function signInWithEmailAndPassword(email: string, password: string): Promise<AuthResult> {
  try {
    console.log('🔥 Attempting signin with:', { email });
    
    const userCredential = await firebaseSignIn(auth, email, password);
    
    console.log('✅ Signin successful:', userCredential.user.uid);
    
    return { 
      success: true, 
      uid: userCredential.user.uid,
      user: userCredential.user 
    };
  } catch (error: any) {
    console.error('❌ Signin failed:', error);
    
    let errorMessage = error.message;
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      default:
        errorMessage = `Sign in failed: ${error.message}`;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

export async function signOut(): Promise<AuthResult> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Signout failed:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Get the current user's ID token
 */
export async function getIdToken(): Promise<string | null> {
  const user = getCurrentUser();
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    console.log('🔥 Attempting Google signin...');
    
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    const userCredential = await signInWithPopup(auth, provider);
    
    console.log('✅ Google signin successful:', userCredential.user.uid);
    
    return { 
      success: true, 
      uid: userCredential.user.uid,
      user: userCredential.user 
    };
  } catch (error: any) {
    console.error('❌ Google signin failed:', error);
    
    let errorMessage = error.message;
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in was cancelled. Please try again.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Another sign-in attempt is in progress.';
        break;
      default:
        errorMessage = `Google sign-in failed: ${error.message}`;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}

/**
 * Sign in with GitHub
 */
export async function signInWithGitHub(): Promise<AuthResult> {
  try {
    console.log('🔥 Attempting GitHub signin...');
    
    const provider = new GithubAuthProvider();
    provider.addScope('user:email');
    
    const userCredential = await signInWithPopup(auth, provider);
    
    console.log('✅ GitHub signin successful:', userCredential.user.uid);
    
    return { 
      success: true, 
      uid: userCredential.user.uid,
      user: userCredential.user 
    };
  } catch (error: any) {
    console.error('❌ GitHub signin failed:', error);
    
    let errorMessage = error.message;
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in was cancelled. Please try again.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
        break;
      case 'auth/account-exists-with-different-credential':
        errorMessage = 'An account already exists with the same email but different sign-in method.';
        break;
      default:
        errorMessage = `GitHub sign-in failed: ${error.message}`;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
}
