// Test-specific auth functions that don't use server actions
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { app } from '@/lib/firebase';

export async function testSignUpWithEmailAndPassword(email: string, password: string) {
  try {
    const auth = getAuth(app);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, uid: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function testSignIn(email: string, password: string) {
  try {
    const auth = getAuth(app);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, uid: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function testSignOut() {
  try {
    const auth = getAuth(app);
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
