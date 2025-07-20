'use server';

import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  getDocs, 
  orderBy, 
  serverTimestamp, 
  Timestamp, 
  where,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export type Message = {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    senderType: 'household' | 'worker';
    timestamp: Timestamp;
    bookingId?: string;
    read: boolean;
};

export type ChatRoom = {
    id: string;
    householdId: string;
    workerId: string;
    householdName: string;
    workerName: string;
    bookingId?: string;
    lastMessage?: string;
    lastMessageTime?: Timestamp;
    createdAt: Timestamp;
};

export type NewMessage = {
    text: string;
    senderId: string;
    senderName: string;
    senderType: 'household' | 'worker';
    bookingId?: string;
};

export async function getChatRooms(userId: string, userType: 'household' | 'worker'): Promise<ChatRoom[]> {
    try {
        const chatsCol = collection(db, 'chats');
        const field = userType === 'household' ? 'householdId' : 'workerId';
        const q = query(chatsCol, where(field, '==', userId), orderBy('lastMessageTime', 'desc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));

    } catch (error) {
        console.error("Error fetching chat rooms: ", error);
        return [];
    }
}

export async function getMessages(chatRoomId: string): Promise<Message[]> {
    try {
        const messagesCol = collection(db, 'chats', chatRoomId, 'messages');
        const q = query(messagesCol, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);
        
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));

    } catch (error) {
        console.error("Error fetching messages: ", error);
        return [];
    }
}

export async function createChatRoom(
    householdId: string, 
    workerId: string, 
    householdName: string, 
    workerName: string,
    bookingId?: string
): Promise<{ success: boolean; chatRoomId?: string; error?: string }> {
    try {
        // Check if chat room already exists
        const chatsCol = collection(db, 'chats');
        const existingChatQuery = query(
            chatsCol, 
            where('householdId', '==', householdId),
            where('workerId', '==', workerId)
        );
        const existingChats = await getDocs(existingChatQuery);
        
        if (!existingChats.empty) {
            return { success: true, chatRoomId: existingChats.docs[0].id };
        }

        // Create new chat room
        const docRef = await addDoc(chatsCol, {
            householdId,
            workerId,
            householdName,
            workerName,
            bookingId,
            createdAt: serverTimestamp(),
            lastMessageTime: serverTimestamp(),
        });

        return { success: true, chatRoomId: docRef.id };

    } catch (error) {
        console.error("Error creating chat room: ", error);
        return { success: false, error: "Failed to create chat room." };
    }
}

export async function sendMessage(
    chatRoomId: string, 
    message: NewMessage
): Promise<{ success: boolean; error?: string }> {
    if (!message.senderId) {
        return { success: false, error: "User not authenticated." };
    }
    if (!message.text.trim()) {
        return { success: false, error: "Message cannot be empty." };
    }

    try {
        // Add message to subcollection
        const messagesCol = collection(db, 'chats', chatRoomId, 'messages');
        await addDoc(messagesCol, {
            ...message,
            timestamp: serverTimestamp(),
            read: false,
        });

        // Update chat room's last message info
        const chatRoomRef = doc(db, 'chats', chatRoomId);
        await updateDoc(chatRoomRef, {
            lastMessage: message.text.substring(0, 100), // Truncate for preview
            lastMessageTime: serverTimestamp(),
        });

        revalidatePath(`/household/messaging`);
        revalidatePath(`/worker/messaging`);

        return { success: true };

    } catch (error) {
        console.error("Error sending message: ", error);
        return { success: false, error: "Failed to send message. Please try again." };
    }
}

export async function markMessagesAsRead(
    chatRoomId: string, 
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const messagesCol = collection(db, 'chats', chatRoomId, 'messages');
        const q = query(
            messagesCol, 
            where('senderId', '!=', userId),
            where('read', '==', false)
        );
        const querySnapshot = await getDocs(q);
        
        const updates = querySnapshot.docs.map((document) => 
            updateDoc(document.ref, { read: true })
        );
        
        await Promise.all(updates);

        return { success: true };

    } catch (error) {
        console.error("Error marking messages as read: ", error);
        return { success: false, error: "Failed to mark messages as read." };
    }
}

export async function getUserProfile(userId: string, userType: 'household' | 'worker') {
    try {
        const collectionName = userType === 'household' ? 'household' : 'worker';
        const userRef = doc(db, collectionName, userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const data = userSnap.data();
            return {
                id: userId,
                name: data.fullName || data.name || 'Unknown',
                profilePicture: data.profilePictureUrl || null,
                phone: data.phone || null,
            };
        }
        
        return null;
    } catch (error) {
        console.error("Error fetching user profile: ", error);
        return null;
    }
}
