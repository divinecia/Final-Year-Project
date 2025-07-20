
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, query, orderBy, Timestamp, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export type Job = {
    id: string;
    jobTitle: string;
    householdName: string;
    workerName?: string | null;
    serviceType: string;
    status: 'open' | 'assigned' | 'completed' | 'cancelled';
    createdAt: string;
};

// Helper function to create a notification
async function createNotification(userId: string, title: string, description: string) {
    try {
        await addDoc(collection(db, 'notifications'), {
            userId,
            title,
            description,
            createdAt: Timestamp.now(),
            read: false,
        });
    } catch (error) {
        console.error("Error creating notification: ", error);
        // Don't block the main action if notification fails
    }
}


export async function getJobs(): Promise<Job[]> {
  try {
    const jobsCollection = collection(db, 'jobs');
    const q = query(jobsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      return {
        id: doc.id,
        jobTitle: data.jobTitle || 'N/A',
        householdName: data.householdName || 'N/A',
        workerName: data.workerName || null,
        serviceType: data.serviceType || 'N/A',
        status: data.status || 'open',
        createdAt: createdAt?.toDate().toLocaleDateString() || '',
      } as Job;
    });
  } catch (error) {
    console.error("Error fetching jobs: ", error);
    return [];
  }
}


export async function deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteDoc(doc(db, 'jobs', jobId));
        revalidatePath('/admin/jobs');
        return { success: true };
    } catch (error) {
        console.error("Error deleting job: ", error);
        return { success: false, error: 'Failed to delete job.' };
    }
}

export async function assignWorkerToJob(jobId: string, workerId: string, workerName: string): Promise<{ success: boolean; error?: string }> {
    try {
        const jobRef = doc(db, 'jobs', jobId);
        await updateDoc(jobRef, {
            workerId: workerId,
            workerName: workerName,
            status: 'assigned',
        });

        // Create notification for the worker
        await createNotification(
            workerId,
            "New Job Assignment!",
            `You have been assigned to the job: "${(await getDoc(jobRef)).data()?.jobTitle}". Check your schedule for details.`
        );

        revalidatePath('/admin/jobs');
        revalidatePath('/worker/schedule');
        revalidatePath('/household/bookings');
        revalidatePath(`/worker/notifications`);

        return { success: true };
    } catch (error) {
        console.error("Error assigning worker to job: ", error);
        return { success: false, error: 'Failed to assign worker.' };
    }
}
