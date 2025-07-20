
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs, doc, writeBatch, addDoc, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Job } from '@/app/admin/jobs/actions';

export type PendingReview = {
    jobId: string;
    jobTitle: string;
    serviceDate: string;
    workerId: string;
    workerName: string;
    workerProfilePictureUrl?: string;
};

export type PublishedReview = {
    id: string;
    workerName: string;
    workerProfilePictureUrl?: string;
    jobTitle: string;
    rating: number;
    comment: string;
    reviewDate: string;
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
    }
}


// Get jobs that are 'completed' and have no review yet.
export async function getPendingReviews(householdId: string): Promise<PendingReview[]> {
    if (!householdId) return [];

    try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(
            jobsCollection, 
            where('householdId', '==', householdId),
            where('status', '==', 'completed'),
            where('review', '==', null), // Assuming 'review' field is added upon review submission
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;
            return {
                jobId: doc.id,
                jobTitle: data.jobTitle || 'N/A',
                serviceDate: createdAt?.toDate().toLocaleDateString() || '',
                workerId: data.workerId,
                workerName: data.workerName || 'N/A',
                workerProfilePictureUrl: data.workerProfilePictureUrl || 'https://placehold.co/100x100.png',
            };
        });
    } catch (error) {
        console.error("Error fetching pending reviews: ", error);
        return [];
    }
}

export async function submitReview(
    householdId: string, 
    jobId: string, 
    workerId: string, 
    rating: number, 
    comment: string
): Promise<{ success: boolean, error?: string }> {
    if (!householdId || !jobId || !workerId) {
        return { success: false, error: "Missing required information." };
    }

    try {
        const batch = writeBatch(db);

        // 1. Update the job with the review
        const jobRef = doc(db, 'jobs', jobId);
        batch.update(jobRef, {
            review: {
                rating,
                comment,
                createdAt: Timestamp.now(),
                householdId: householdId,
            }
        });

        // 2. Update the worker's aggregate rating
        const workerRef = doc(db, 'worker', workerId);
        const workerSnap = await getDoc(workerRef);
        if (workerSnap.exists()) {
            const workerData = workerSnap.data();
            const currentRating = workerData.rating || 0;
            const reviewsCount = workerData.reviewsCount || 0;
            
            const newReviewsCount = reviewsCount + 1;
            const newTotalRating = (currentRating * reviewsCount) + rating;
            const newAverageRating = newTotalRating / newReviewsCount;

            batch.update(workerRef, {
                rating: newAverageRating,
                reviewsCount: newReviewsCount,
            });
        }
        
        await batch.commit();
        
        // 3. Create a notification for the worker
        const householdSnap = await getDoc(doc(db, 'household', householdId));
        const householdName = householdSnap.data()?.fullName || 'A household';
        await createNotification(
            workerId,
            `You received a new ${rating}-star review!`,
            `${householdName} left you a review for your recent job.`
        );

        revalidatePath('/household/reviews');
        revalidatePath('/worker/reviews');
        revalidatePath(`/household/worker-profile/${workerId}`);
        revalidatePath('/worker/notifications');

        return { success: true };

    } catch (error) {
        console.error("Error submitting review: ", error);
        return { success: false, error: "Failed to submit review." };
    }
}


export async function getPublishedReviews(householdId: string): Promise<PublishedReview[]> {
    if (!householdId) return [];

    try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(
            jobsCollection, 
            where('householdId', '==', householdId),
            where('status', '==', 'completed'),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        
        const reviews: PublishedReview[] = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.review) { // Only include jobs that have a review
                const reviewDate = data.review.createdAt as Timestamp;
                reviews.push({
                    id: doc.id,
                    workerName: data.workerName || 'N/A',
                    workerProfilePictureUrl: 'https://placehold.co/100x100.png',
                    jobTitle: data.jobTitle || 'N/A',
                    rating: data.review.rating,
                    comment: data.review.comment,
                    reviewDate: reviewDate?.toDate().toLocaleDateString() || '',
                });
            }
        });
        
        return reviews;

    } catch (error) {
        console.error("Error fetching published reviews: ", error);
        return [];
    }
}
