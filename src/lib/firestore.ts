/**
 * Firestore real-time data helpers.
 * Provides subscription-based listeners for orders, messaging, and notifications.
 *
 * CLIENT-SIDE — safe to import from React components.
 */
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Unsubscribe,
    Timestamp,
} from 'firebase/firestore';
import { getFirestoreInstance } from './firebase';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OrderUpdate {
    orderId: string;
    status: string;
    updatedAt: Date;
    message?: string;
}

export interface ChatMessage {
    id?: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: Date;
}

export interface Notification {
    id?: string;
    userId: string;
    title: string;
    body: string;
    type: 'order' | 'message' | 'system';
    read: boolean;
    createdAt: Date;
    data?: Record<string, string>;
}

// ─── Order Updates ──────────────────────────────────────────────────────────

/**
 * Subscribe to real-time order status updates.
 * @returns Unsubscribe function
 */
export function subscribeToOrderUpdates(
    orderId: string,
    callback: (update: OrderUpdate) => void
): Unsubscribe {
    const db = getFirestoreInstance();
    const orderRef = doc(db, 'orders', orderId);

    return onSnapshot(orderRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.data();
            callback({
                orderId,
                status: data.status,
                updatedAt: data.updatedAt instanceof Timestamp
                    ? data.updatedAt.toDate()
                    : new Date(),
                message: data.message,
            });
        }
    });
}

/**
 * Update order status in Firestore for real-time sync.
 */
export async function updateOrderStatus(
    orderId: string,
    status: string,
    message?: string
): Promise<void> {
    const db = getFirestoreInstance();
    const orderRef = doc(db, 'orders', orderId);

    await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp(),
        ...(message ? { message } : {}),
    });
}

// ─── Messaging ──────────────────────────────────────────────────────────────

/**
 * Subscribe to messages in a conversation.
 * @returns Unsubscribe function
 */
export function subscribeToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
): Unsubscribe {
    const db = getFirestoreInstance();
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                senderId: data.senderId,
                senderName: data.senderName,
                text: data.text,
                timestamp: data.timestamp instanceof Timestamp
                    ? data.timestamp.toDate()
                    : new Date(),
            };
        });
        callback(messages);
    });
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(
    conversationId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<void> {
    const db = getFirestoreInstance();
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');

    await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp(),
    });
}

// ─── Notifications ──────────────────────────────────────────────────────────

/**
 * Subscribe to user notifications.
 * @returns Unsubscribe function
 */
export function subscribeToNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
): Unsubscribe {
    const db = getFirestoreInstance();
    const notificationsRef = collection(db, 'notifications');
    const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const notifications: Notification[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                userId: data.userId,
                title: data.title,
                body: data.body,
                type: data.type,
                read: data.read || false,
                createdAt: data.createdAt instanceof Timestamp
                    ? data.createdAt.toDate()
                    : new Date(),
                data: data.data,
            };
        });
        callback(notifications);
    });
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
    const db = getFirestoreInstance();
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
}
