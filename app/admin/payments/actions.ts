
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

export type ServicePayment = {
    id: string;
    date: string;
    householdName: string;
    workerName: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
};

export type TrainingPayment = {
    id: string;
    date: string;
    workerName: string;
    courseTitle: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
};


export async function getServicePayments(): Promise<ServicePayment[]> {
  try {
    const paymentsCollection = collection(db, 'servicePayments');
    const q = query(paymentsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const date = data.date as Timestamp;
      return {
        id: doc.id,
        date: date?.toDate().toLocaleDateString() || '',
        householdName: data.householdName || 'N/A',
        workerName: data.workerName || 'N/A',
        amount: data.amount || 0,
        status: data.status || 'pending',
      } as ServicePayment;
    });
  } catch (error) {
    console.error("Error fetching service payments: ", error);
    return [];
  }
}

export async function getTrainingPayments(): Promise<TrainingPayment[]> {
  try {
    const paymentsCollection = collection(db, 'trainingPayments');
    const q = query(paymentsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const date = data.date as Timestamp;
      return {
        id: doc.id,
        date: date?.toDate().toLocaleDateString() || '',
        workerName: data.workerName || 'N/A',
        courseTitle: data.courseTitle || 'N/A',
        amount: data.amount || 0,
        status: data.status || 'pending',
      } as TrainingPayment;
    });
  } catch (error) {
    console.error("Error fetching training payments: ", error);
    return [];
  }
}
