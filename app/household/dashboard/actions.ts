
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs, doc, getDoc, limit } from 'firebase/firestore';
import type { Worker } from '../find-worker/actions';
import type { Booking } from '../bookings/actions';

export async function getTopRatedWorkers(): Promise<Worker[]> {
  try {
    const workersCollection = collection(db, 'worker');
    const q = query(
        workersCollection, 
        where('status', '==', 'active'), 
        orderBy('rating', 'desc'), 
        limit(3)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        fullName: data.fullName || 'No Name',
        profilePictureUrl: data.profilePictureUrl || undefined,
        rating: data.rating || 0,
        reviewsCount: data.reviewsCount || 0,
        skills: data.skills || [],
        status: data.status,
      } as Worker;
    });

  } catch (error) {
    console.error("Error fetching top rated workers: ", error);
    return [];
  }
}


export async function getUpcomingBooking(householdId: string): Promise<Booking | null> {
    if (!householdId) {
        return null;
    }

    try {
        const jobsCollection = collection(db, 'jobs');
        const q = query(
            jobsCollection, 
            where('householdId', '==', householdId),
            where('status', '==', 'assigned'), 
            orderBy('createdAt', 'asc'),
            limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
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
            jobDate: createdAt?.toDate().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || 'N/A',
            jobTime: createdAt?.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
            workerProfilePictureUrl: await getWorkerProfilePicture(data.workerId)
        };

    } catch (error) {
        console.error("Error fetching upcoming booking: ", error);
        return null;
    }
}

async function getWorkerProfilePicture(workerId?: string): Promise<string> {
    if (!workerId) return 'https://ui-avatars.io/api/?name=Worker&background=3B82F6&color=ffffff&size=100';
    
    try {
        const workerDoc = await getDoc(doc(db, 'worker', workerId));
        if (workerDoc.exists()) {
            const workerData = workerDoc.data();
            return workerData.profilePictureUrl || `https://ui-avatars.io/api/?name=${encodeURIComponent(workerData.fullName || 'Worker')}&background=3B82F6&color=ffffff&size=100`;
        }
    } catch (error) {
        console.error('Error fetching worker profile picture:', error);
    }
    
    return 'https://ui-avatars.io/api/?name=Worker&background=3B82F6&color=ffffff&size=100';
}
