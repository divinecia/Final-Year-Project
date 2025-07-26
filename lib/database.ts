'use server';

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  DocumentData,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a document in Firestore
 */
export async function createDocument(
  collectionName: string, 
  docId: string, 
  data: DocumentData
): Promise<DatabaseResult<string>> {
  try {
    console.log(`📝 Creating document in ${collectionName}/${docId}`);
    
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ Document created successfully: ${collectionName}/${docId}`);
    return { success: true, data: docId };
  } catch (error: any) {
    console.error(`❌ Failed to create document in ${collectionName}:`, error);
    return { 
      success: false, 
      error: `Failed to create document: ${error.message}` 
    };
  }
}

/**
 * Read a document from Firestore
 */
export async function readDocument(
  collectionName: string, 
  docId: string
): Promise<DatabaseResult<DocumentData>> {
  try {
    console.log(`📖 Reading document ${collectionName}/${docId}`);
    
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`✅ Document found: ${collectionName}/${docId}`);
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      console.log(`❌ Document not found: ${collectionName}/${docId}`);
      return { 
        success: false, 
        error: 'Document not found' 
      };
    }
  } catch (error: any) {
    console.error(`❌ Failed to read document ${collectionName}/${docId}:`, error);
    return { 
      success: false, 
      error: `Failed to read document: ${error.message}` 
    };
  }
}

/**
 * Update a document in Firestore
 */
export async function updateDocument(
  collectionName: string, 
  docId: string, 
  updates: Partial<DocumentData>
): Promise<DatabaseResult<string>> {
  try {
    console.log(`📝 Updating document ${collectionName}/${docId}`);
    
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ Document updated successfully: ${collectionName}/${docId}`);
    return { success: true, data: docId };
  } catch (error: any) {
    console.error(`❌ Failed to update document ${collectionName}/${docId}:`, error);
    return { 
      success: false, 
      error: `Failed to update document: ${error.message}` 
    };
  }
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocument(
  collectionName: string, 
  docId: string
): Promise<DatabaseResult<string>> {
  try {
    console.log(`🗑️ Deleting document ${collectionName}/${docId}`);
    
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    
    console.log(`✅ Document deleted successfully: ${collectionName}/${docId}`);
    return { success: true, data: docId };
  } catch (error: any) {
    console.error(`❌ Failed to delete document ${collectionName}/${docId}:`, error);
    return { 
      success: false, 
      error: `Failed to delete document: ${error.message}` 
    };
  }
}

/**
 * Query documents from Firestore
 */
export async function queryDocuments(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<DatabaseResult<DocumentData[]>> {
  try {
    console.log(`🔍 Querying collection ${collectionName}`);
    
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Query successful: ${docs.length} documents found in ${collectionName}`);
    return { success: true, data: docs };
  } catch (error: any) {
    console.error(`❌ Failed to query collection ${collectionName}:`, error);
    return { 
      success: false, 
      error: `Failed to query documents: ${error.message}` 
    };
  }
}

/**
 * Check if a document exists
 */
export async function documentExists(
  collectionName: string, 
  docId: string
): Promise<DatabaseResult<boolean>> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    return { success: true, data: docSnap.exists() };
  } catch (error: any) {
    console.error(`❌ Failed to check document existence ${collectionName}/${docId}:`, error);
    return { 
      success: false, 
      error: `Failed to check document: ${error.message}` 
    };
  }
}

/**
 * User-specific database operations
 */

export async function createUserProfile(
  userType: 'household' | 'worker' | 'admin',
  userId: string,
  profileData: DocumentData
): Promise<DatabaseResult<string>> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  return createDocument(collectionName, userId, profileData);
}

export async function getUserProfile(
  userType: 'household' | 'worker' | 'admin',
  userId: string
): Promise<DatabaseResult<DocumentData>> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  return readDocument(collectionName, userId);
}

export async function updateUserProfile(
  userType: 'household' | 'worker' | 'admin',
  userId: string,
  updates: Partial<DocumentData>
): Promise<DatabaseResult<string>> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  return updateDocument(collectionName, userId, updates);
}

export async function deleteUserProfile(
  userType: 'household' | 'worker' | 'admin',
  userId: string
): Promise<DatabaseResult<string>> {
  const collectionName = userType === 'admin' ? 'admins' : userType;
  return deleteDocument(collectionName, userId);
}
