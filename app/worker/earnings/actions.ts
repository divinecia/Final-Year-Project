
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs } from 'firebase/firestore';

export type Earning = {
    id: string;
    date: string;
    jobId: string;
    householdName: string;
    netAmount: number;
    status: 'completed' | 'pending' | 'failed';
};

export type EarningsSummary = {
    totalEarnings: number;
    monthEarnings: number;
    history: Earning[];
}

export async function getWorkerEarnings(workerId: string): Promise<EarningsSummary> {
    const summary: EarningsSummary = { totalEarnings: 0, monthEarnings: 0, history: [] };
    if (!workerId) return summary;

    try {
        const paymentsCollection = collection(db, 'servicePayments');
        const q = query(
            paymentsCollection, 
            where('workerId', '==', workerId), 
            orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return summary;
        }
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const date = data.date as Timestamp;
            const earning: Earning = {
                id: doc.id,
                date: date?.toDate().toLocaleDateString() || '',
                jobId: data.jobId || 'N/A',
                householdName: data.householdName || 'N/A',
                netAmount: data.amount || 0, // Assuming amount is net for now
                status: data.status || 'pending',
            };

            summary.history.push(earning);

            if (data.status === 'completed') {
                summary.totalEarnings += earning.netAmount;
                if (date.toDate() >= startOfMonth) {
                    summary.monthEarnings += earning.netAmount;
                }
            }
        });

        return summary;
    } catch (error) {
        console.error("Error fetching worker earnings: ", error);
        return summary;
    }
}
