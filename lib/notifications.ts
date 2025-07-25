'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

/**
 * Creates a notification for a user according to the standardized schema
 */
export async function createNotification(
    userId: string,
    userType: 'household' | 'worker' | 'admin',
    title: string,
    description: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    jobId?: string,
    paymentId?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const notificationsCollection = collection(db, 'notifications');
        
        await addDoc(notificationsCollection, {
            title,
            description,
            type,
            userId,
            userType,
            jobId: jobId || null,
            paymentId: paymentId || null,
            read: false,
            createdAt: Timestamp.now(),
        });

        return { success: true };
    } catch (error) {
        console.error("Error creating notification: ", error);
        return { success: false, error: "Failed to create notification." };
    }
}

/**
 * Helper to create job-related notifications
 */
export async function createJobNotification(
    userId: string,
    userType: 'household' | 'worker' | 'admin',
    jobId: string,
    title: string,
    description: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
): Promise<{ success: boolean; error?: string }> {
    return createNotification(userId, userType, title, description, type, jobId);
}

/**
 * Helper to create payment-related notifications
 */
export async function createPaymentNotification(
    userId: string,
    userType: 'household' | 'worker' | 'admin',
    paymentId: string,
    title: string,
    description: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
): Promise<{ success: boolean; error?: string }> {
    return createNotification(userId, userType, title, description, type, undefined, paymentId);
}
