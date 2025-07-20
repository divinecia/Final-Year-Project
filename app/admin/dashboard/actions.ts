
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, getCountFromServer, Timestamp } from 'firebase/firestore';
import type { Job } from '../jobs/actions';
import type { Worker } from '../workers/workermanage/actions';


export type DashboardStats = {
    totalWorkers: number;
    totalHouseholds: number;
    jobsCompleted: number;
    totalRevenue: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
    try {
        const workersSnap = await getCountFromServer(collection(db, 'worker'));
        const householdsSnap = await getCountFromServer(collection(db, 'household'));
        const completedJobsSnap = await getCountFromServer(query(collection(db, 'jobs'), where('status', '==', 'completed')));

        // Calculate total revenue from completed payments
        let totalRevenue = 0;
        try {
            const paymentsQuery = query(
                collection(db, 'servicePayments'),
                where('status', '==', 'completed')
            );
            const paymentsSnap = await getDocs(paymentsQuery);
            totalRevenue = paymentsSnap.docs.reduce((sum, doc) => {
                return sum + (doc.data().amount || 0);
            }, 0);
        } catch (error) {
            // Fallback to estimated revenue if payments collection is empty
            totalRevenue = completedJobsSnap.data().count * 25000; // Average job value
        }

        return {
            totalWorkers: workersSnap.data().count,
            totalHouseholds: householdsSnap.data().count,
            jobsCompleted: completedJobsSnap.data().count,
            totalRevenue: totalRevenue,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats: ", error);
        return { totalWorkers: 0, totalHouseholds: 0, jobsCompleted: 0, totalRevenue: 0 };
    }
}

export async function getRecentWorkerRegistrations(): Promise<Worker[]> {
    try {
        const workersCollection = collection(db, 'worker');
        const q = query(workersCollection, orderBy('dateJoined', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return [];
        }

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            const dateJoined = data.dateJoined as Timestamp;
            return {
                id: doc.id,
                fullName: data.fullName || '',
                email: data.email || '',
                phone: data.phone || '',
                status: data.status || 'pending',
                dateJoined: dateJoined?.toDate()?.toLocaleDateString() || new Date().toLocaleDateString(),
            } as Worker;
        });
    } catch (error) {
        console.error("Error fetching recent workers: ", error);
        return [];
    }
}

export async function getRecentJobPostings(): Promise<Job[]> {
  try {
    const jobsCollection = collection(db, 'jobs');
    const q = query(jobsCollection, orderBy('createdAt', 'desc'), limit(5));
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
    console.error("Error fetching recent jobs: ", error);
    return [];
  }
}
