
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

export const jobPostSchema = z.object({
  jobTitle: z.string().min(5, "Job title must be at least 5 characters."),
  serviceType: z.string({ required_error: "Please select a service type." }),
  jobDescription: z.string().min(20, "Description must be at least 20 characters to be clear."),
  schedule: z.string().min(5, "Please provide schedule details."),
  salary: z.coerce.number().min(1, "Please enter a valid salary."),
  payFrequency: z.string({ required_error: "Please select a pay frequency." }),
  benefits: z.object({
    accommodation: z.boolean().default(false),
    meals: z.boolean().default(false),
    transportation: z.boolean().default(false),
  }),
});

export type JobPostFormData = z.infer<typeof jobPostSchema>;

export async function createJobPost(householdId: string, data: JobPostFormData) {
  try {
    const householdRef = doc(db, 'household', householdId);
    const householdSnap = await getDoc(householdRef);

    if (!householdSnap.exists()) {
      return { success: false, error: 'Household profile not found.' };
    }

    const householdData = householdSnap.data();

    const jobData = {
      ...data,
      householdId,
      householdName: householdData.fullName,
      householdLocation: `${householdData.address.sector}, ${householdData.address.district}`,
      status: 'open' as const,
      createdAt: Timestamp.now(),
      workerId: null,
      workerName: null,
      applications: [],
    };

    await addDoc(collection(db, 'jobs'), jobData);
    
    revalidatePath('/household/post-job');
    revalidatePath('/admin/jobs');
    
    return { success: true };
  } catch (error) {
    console.error("Error creating job post: ", error);
    return { success: false, error: 'Failed to create job post.' };
  }
}
