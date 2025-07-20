
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { signUpWithEmailAndPassword } from '@/lib/auth';
import type { HouseholdFormData } from './schemas';

export type FullFormData = HouseholdFormData;

export async function registerHousehold(formData: FullFormData) {
  if (!formData.email) {
      return { success: false, error: "Email is required for registration." };
  }

  // 1. Create the user in Firebase Authentication
  const authResult = await signUpWithEmailAndPassword(formData.email, formData.password);
  if (!authResult.success || !authResult.uid) {
    return { success: false, error: authResult.error || "Failed to create user account." };
  }
  
  const userId = authResult.uid;

  try {
    const householdData = {
        uid: userId,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: {
            district: formData.district,
            sector: formData.sector,
            line1: formData.address,
        },
        property: {
            type: formData.propertyType,
            rooms: formData.numRooms,
            garden: formData.hasGarden === 'yes',
        },
        family: {
            adults: formData.numAdults,
            children: formData.numChildren,
            pets: formData.hasPets,
            petInfo: formData.petInfo || '',
        },
        services: {
            primary: formData.primaryServices,
            frequency: formData.serviceFrequency,
        },
        dateJoined: Timestamp.now(),
        status: 'active' as const,
    };

    // 2. Create the user document in Firestore with the user's UID as the document ID
    const householdDocRef = doc(db, 'household', userId);
    await setDoc(householdDocRef, householdData);

    console.log("Document written for household user ID: ", userId);
    return { success: true, id: userId };
  } catch (error) {
    console.error("Error adding household document: ", error);
    // Propagate the error to be caught by the calling function
    throw new Error("Failed to save household profile to database.");
  }
}
