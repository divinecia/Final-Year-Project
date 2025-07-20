
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export type Household = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: 'active' | 'suspended';
    dateJoined: string;
};

export async function getHouseholds(): Promise<Household[]> {
  try {
    const householdsCollection = collection(db, 'household');
    const q = query(householdsCollection, orderBy('dateJoined', 'desc'));
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
        phone: data.phone || '',
        status: data.status || 'active',
        dateJoined: dateJoined?.toDate()?.toLocaleDateString() || new Date().toLocaleDateString(),
      } as Household;
    });

  } catch (error) {
    console.error("Error fetching households: ", error);
    return [];
  }
}

export async function deleteHousehold(householdId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteDoc(doc(db, 'household', householdId));
        revalidatePath('/admin/households');
        return { success: true };
    } catch (error) {
        console.error("Error deleting household: ", error);
        return { success: false, error: 'Failed to delete household.' };
    }
}
