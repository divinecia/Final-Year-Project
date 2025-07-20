
'use server';

import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @param path The path where the file should be stored (e.g., 'profile-pictures/').
 * @returns The download URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  try {
    const fileRef = ref(storage, `${path}${Date.now()}-${file.name}`);
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    const snapshot = await uploadBytes(fileRef, arrayBuffer, {
      contentType: file.type,
    });
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed.');
  }
}
