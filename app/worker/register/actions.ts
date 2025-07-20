
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { signUpWithEmailAndPassword } from '@/lib/auth';
import { uploadFile } from '@/lib/storage';
import type { WorkerFormData } from './schemas';

export type FormData = WorkerFormData;

export async function registerWorker(formData: FormData) {
  if (!formData.email) {
    return { success: false, error: "Email is required for registration." };
  }

  const authResult = await signUpWithEmailAndPassword(formData.email, formData.password);
  if (!authResult.success || !authResult.uid) {
    return { success: false, error: authResult.error || "Failed to create user account." };
  }
  
  const userId = authResult.uid;

  try {
    // Handle file uploads
    const profilePictureUrl = formData.profilePicture
      ? await uploadFile(formData.profilePicture, `workers/${userId}/profile/`)
      : null;
    const idFrontUrl = formData.idFront
      ? await uploadFile(formData.idFront, `workers/${userId}/documents/`)
      : null;
    const idBackUrl = formData.idBack
      ? await uploadFile(formData.idBack, `workers/${userId}/documents/`)
      : null;
    const selfieUrl = formData.selfie
      ? await uploadFile(formData.selfie, `workers/${userId}/documents/`)
      : null;

    const workerData = {
        uid: userId,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        status: 'pending' as const,
        dateJoined: Timestamp.now(),
        dob: Timestamp.fromDate(formData.dob),
        gender: formData.gender,
        nationalId: formData.nationalId,
        district: formData.district,
        sector: formData.sector,
        address: formData.address,
        emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelationship,
        },
        experienceYears: formData.experience[0] || 0,
        bio: formData.description || '',
        skills: formData.services,
        languages: formData.languages,
        availability: {
            days: formData.availableDays,
            hours: formData.preferredHours,
            type: formData.flexibility,
            preferences: [
                ...(formData.oneTimeJobs ? ['one-time'] : []),
                ...(formData.recurringJobs ? ['recurring'] : []),
                ...(formData.emergencyServices ? ['emergency'] : []),
            ],
        },
        rating: 0,
        reviewsCount: 0,
        hourlyRate: formData.hourlyRate[0] || 500,
        profilePictureUrl: profilePictureUrl,
        documents: {
            idFrontUrl: idFrontUrl,
            idBackUrl: idBackUrl,
            selfieUrl: selfieUrl,
        },
    };

    const workerDocRef = doc(db, 'worker', userId);
    await setDoc(workerDocRef, workerData);

    console.log("Document written for user ID: ", userId);
    return { success: true, id: userId };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Failed to save worker profile to database.");
  }
}
