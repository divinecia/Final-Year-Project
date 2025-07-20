
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export type AdminUser = {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: 'active' | 'inactive';
    dateJoined: string;
};

export async function getAdmins(): Promise<AdminUser[]> {
  try {
    const adminsCollection = collection(db, 'admins');
    const q = query(adminsCollection, orderBy('dateJoined', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const dateJoined = data.dateJoined as Timestamp;
      return {
        id: doc.id,
        fullName: data.fullName || '',
        email: data.email || '',
        role: data.role || 'support_agent',
        status: data.status || 'active',
        dateJoined: dateJoined?.toDate()?.toLocaleDateString() || '',
      } as AdminUser;
    });

  } catch (error) {
    console.error("Error fetching admins: ", error);
    return [];
  }
}

export async function deleteAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Note: This only deletes the Firestore document, not the Firebase Auth user.
        // In a real app, you would need a cloud function to delete the auth user
        // to prevent orphaned accounts.
        await deleteDoc(doc(db, 'admins', adminId));
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error) {
        console.error("Error deleting admin: ", error);
        return { success: false, error: 'Failed to delete admin.' };
    }
}
