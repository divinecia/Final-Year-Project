'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Define a type for our worker data for type safety
export type Worker = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: 'active' | 'pending' | 'suspended';
    dateJoined: string; // Keep as string for simplicity, can be converted to Date if needed
};

export async function getWorkers(): Promise<Worker[]> {
  try {
    const workersCollection = collection(db, 'worker');
    const q = query(workersCollection, orderBy('dateJoined', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('No workers found in the database.');
      return [];
    }

    const workers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const dateJoined = data.dateJoined as Timestamp;
      return {
        id: doc.id,
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        status: data.status || 'pending',
        // Firestore Timestamps need to be converted to a serializable format
        dateJoined: dateJoined?.toDate()?.toLocaleDateString() || new Date().toLocaleDateString(),
      } as Worker;
    });

    return workers;
  } catch (error) {
    console.error("Error fetching workers: ", error);
    // In a real app, you'd want more robust error handling
    return [];
  }
}


export async function approveWorker(workerId: string): Promise<{ success: boolean }> {
  try {
    const workerRef = doc(db, 'worker', workerId);
    await updateDoc(workerRef, { status: 'active' });
    return { success: true };
  } catch (error) {
    console.error("Error approving worker: ", error);
    return { success: false };
  }
}

export async function suspendWorker(workerId: string): Promise<{ success: boolean }> {
  try {
    const workerRef = doc(db, 'worker', workerId);
    await updateDoc(workerRef, { status: 'suspended' });
    return { success: true };
  } catch (error) {
    console.error("Error suspending worker: ", error);
    return { success: false };
  }
}

export async function deleteWorker(workerId: string): Promise<{ success: boolean }> {
    try {
        const workerRef = doc(db, 'worker', workerId);
        await deleteDoc(workerRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting worker: ", error);
        return { success: false };
    }
}
