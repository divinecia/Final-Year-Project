'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

export const trainingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  category: z.string({ required_error: 'Please select a category.' }),
  duration: z.string().min(1, 'Duration is required.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  status: z.enum(['active', 'archived']).default('active'),
  // materialUrl: z.string().url().optional(), // For when file upload is implemented
});

export type TrainingProgram = z.infer<typeof trainingSchema> & {
  id: string;
  createdAt: string;
};
export type TrainingFormData = z.infer<typeof trainingSchema>;

const TRAINING_COLLECTION = 'training';
const ADMIN_TRAINING_PATH = '/admin/training';

function handleError(error: unknown, message: string) {
  console.error(message, error);
  return { success: false, error: message };
}

export async function createTraining(data: TrainingFormData) {
  try {
    const trainingData = {
      ...data,
      createdAt: Timestamp.now(),
      status: 'active',
    };
    await addDoc(collection(db, TRAINING_COLLECTION), trainingData);
    revalidatePath(ADMIN_TRAINING_PATH);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Failed to create training program.');
  }
}

export async function getTrainings(): Promise<TrainingProgram[]> {
  try {
    const trainingsCollection = collection(db, TRAINING_COLLECTION);
    const q = query(trainingsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title ?? '',
        category: data.category ?? '',
        duration: data.duration ?? '',
        description: data.description ?? '',
        status: data.status ?? 'active',
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() ?? '',
      };
    });
  } catch (error) {
    handleError(error, 'Error fetching trainings:');
    return [];
  }
}

export async function deleteTraining(trainingId: string) {
  try {
    await deleteDoc(doc(db, TRAINING_COLLECTION, trainingId));
    revalidatePath(ADMIN_TRAINING_PATH);
    return { success: true };
  } catch (error) {
    return handleError(error, 'Failed to delete training program.');
  }
}
