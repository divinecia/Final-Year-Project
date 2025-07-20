
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import type { Job } from '@/app/admin/jobs/actions'; // Re-using the Job type
import { handleApiResponse, createApiResponse, createApiError, type ApiResponse } from '@/lib/api-utils';

export type Booking = Job & {
    workerProfilePictureUrl?: string;
    workerPhone?: string;
    jobDate?: string; // e.g., "July 25, 2024"
    jobTime?: string; // e.g., "10:00 AM"
    householdId?: string; // Add this field
    workerId?: string; // Add this field too
};

async function getWorkerDetails(workerId: string): Promise<{ workerPhone?: string; workerProfilePictureUrl?: string }> {
    if (!workerId) return {};
    
    try {
        // Fetch worker details from the worker collection
        const workerDoc = await getDoc(doc(db, 'worker', workerId));
        if (workerDoc.exists()) {
            const workerData = workerDoc.data();
            return {
                workerPhone: workerData.phone || '0781234567',
                workerProfilePictureUrl: workerData.profilePictureUrl || `https://ui-avatars.io/api/?name=${encodeURIComponent(workerData.fullName || 'Worker')}&background=3B82F6&color=ffffff&size=100`
            };
        }
    } catch (error) {
        console.error('Error fetching worker details:', error);
    }
    
    // Fallback values
    return {
        workerPhone: '0781234567',
        workerProfilePictureUrl: 'https://ui-avatars.io/api/?name=Worker&background=3B82F6&color=ffffff&size=100'
    };
}


export async function getHouseholdBookings(householdId: string): Promise<{ upcoming: Booking[]; past: Booking[] }> {
    const upcoming: Booking[] = [];
    const past: Booking[] = [];

    if (!householdId) {
        return { upcoming, past };
    }

    try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(
            jobsCollection, 
            where('householdId', '==', householdId), 
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { upcoming, past };
        }

        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            const createdAt = data.createdAt as Timestamp;

            // Fetch worker details if assigned
            const workerDetails = data.workerId ? await getWorkerDetails(data.workerId) : {};

            const booking: Booking = {
                id: doc.id,
                jobTitle: data.jobTitle || 'N/A',
                householdName: data.householdName || 'N/A',
                workerName: data.workerName || null,
                serviceType: data.serviceType || 'N/A',
                status: data.status || 'open',
                createdAt: createdAt?.toDate().toLocaleDateString() || '',
                jobDate: createdAt?.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || 'N/A',
                jobTime: createdAt?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
                householdId: data.householdId || householdId,
                workerId: data.workerId,
                ...workerDetails
            };

            if (booking.status === 'completed' || booking.status === 'cancelled') {
                past.push(booking);
            } else {
                upcoming.push(booking);
            }
        }

        return { upcoming, past };

    } catch (error) {
        console.error("Error fetching household bookings: ", error);
        return { upcoming: [], past: [] };
    }
}

export async function cancelBooking(bookingId: string): Promise<ApiResponse> {
    return handleApiResponse(async () => {
        const bookingRef = doc(db, 'jobs', bookingId);
        
        await updateDoc(bookingRef, {
            status: 'cancelled',
            cancelledAt: Timestamp.now()
        });

        return { message: 'Booking cancelled successfully' };
    });
}

export async function rescheduleBooking(
    bookingId: string, 
    newDate: string, 
    newTime: string
): Promise<ApiResponse> {
    return handleApiResponse(async () => {
        const bookingRef = doc(db, 'jobs', bookingId);
        
        await updateDoc(bookingRef, {
            requestedDate: newDate,
            requestedTime: newTime,
            status: 'rescheduled',
            rescheduledAt: Timestamp.now()
        });

        return { message: 'Reschedule request sent successfully' };
    });
}

export async function createReviewBooking(originalBooking: Booking): Promise<ApiResponse<{ jobId: string }>> {
    return handleApiResponse(async () => {
        const jobsCollection = collection(db, 'jobs');
        
        const newJob = {
            jobTitle: originalBooking.jobTitle,
            serviceType: originalBooking.serviceType,
            householdId: originalBooking.householdId,
            householdName: originalBooking.householdName,
            status: 'open',
            createdAt: Timestamp.now(),
            isRebooking: true,
            originalBookingId: originalBooking.id
        };

        const docRef = await addDoc(jobsCollection, newJob);

        return {
            jobId: docRef.id,
            message: 'New booking created successfully'
        };
    });
}
