'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import * as z from "zod";

export const trainingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "Title must be at least 5 characters."),
  category: z.string({ required_error: "Please select a category." }),
  duration: z.string().min(1, "Duration is required."),
  description: z.string().min(20, "Description must be at least 20 characters."),
  status: z.enum(['active', 'archived']).default('active'),
  // materialUrl: z.string().url().optional(), // For when file upload is implemented
});

export type TrainingProgram = z.infer<typeof trainingSchema> & { id: string, createdAt: string };
export type TrainingFormData = z.infer<typeof trainingSchema>;


export async function createTraining(data: TrainingFormData) {
  try {
    const trainingData = {
      ...data,
      createdAt: Timestamp.now(),
      status: 'active'
    };
    await addDoc(collection(db, 'training'), trainingData);
    revalidatePath('/admin/training');
    return { success: true };
  } catch (error) {
    console.error("Error creating training: ", error);
    return { success: false, error: "Failed to create training program." };
  }
}

export async function getTrainings(): Promise<TrainingProgram[]> {
    try {
        const trainingsCollection = collection(db, 'training');
        const q = query(trainingsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            return {
                id: doc.id,
                title: data.title,
                category: data.category,
                duration: data.duration,
                description: data.description,
                status: data.status,
                createdAt: createdAt?.toDate().toLocaleDateString() || '',
            } as TrainingProgram;
        });
    } catch (error) {
        console.error("Error fetching trainings: ", error);
        return [];
    }
}

export async function deleteTraining(trainingId: string) {
  try {
    await deleteDoc(doc(db, 'training', trainingId));
    revalidatePath('/admin/training');
    return { success: true };
  } catch (error) {
    console.error("Error deleting training: ", error);
    return { success: false, error: "Failed to delete training program." };
  }
}
