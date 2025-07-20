
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import * as z from "zod";

export const packageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Package name must be at least 3 characters."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  billingCycle: z.enum(['one-time', 'weekly', 'monthly']),
  description: z.string().min(10, "Description must be at least 10 characters."),
  services: z.array(z.string()).min(1, "You must select at least one service."),
  status: z.enum(['active', 'archived']).default('active'),
});

export type ServicePackage = z.infer<typeof packageSchema> & { id: string, createdAt?: string };
export type ServicePackageFormData = z.infer<typeof packageSchema>;


export async function createPackage(data: ServicePackageFormData) {
  try {
    const packageData = {
      ...data,
      createdAt: Timestamp.now(),
      status: 'active'
    };
    await addDoc(collection(db, 'servicePackages'), packageData);
    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error) {
    console.error("Error creating package: ", error);
    return { success: false, error: "Failed to create package." };
  }
}

export async function getPackages(): Promise<ServicePackage[]> {
    try {
        const packagesCollection = collection(db, 'servicePackages');
        const q = query(packagesCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            return {
                id: doc.id,
                name: data.name,
                price: data.price,
                billingCycle: data.billingCycle,
                description: data.description,
                services: data.services,
                status: data.status,
                createdAt: createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
            } as ServicePackage;
        });
    } catch (error) {
        console.error("Error fetching packages: ", error);
        return [];
    }
}

export async function updatePackage(packageId: string, data: ServicePackageFormData) {
  try {
    const packageRef = doc(db, 'servicePackages', packageId);
    await updateDoc(packageRef, data);
    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error) {
    console.error("Error updating package: ", error);
    return { success: false, error: "Failed to update package." };
  }
}

export async function deletePackage(packageId: string) {
  try {
    const packageRef = doc(db, 'servicePackages', packageId);
    await deleteDoc(packageRef);
    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error) {
    console.error("Error deleting package: ", error);
    return { success: false, error: "Failed to delete package." };
  }
}
