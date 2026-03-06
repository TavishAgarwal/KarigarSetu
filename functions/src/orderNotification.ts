/**
 * Order Notification Cloud Function
 *
 * When called, this function:
 * 1. Receives order details (orderId, buyerId, artisanId, orderTotal)
 * 2. Sends a push notification to the artisan via Firebase Cloud Messaging
 * 3. Creates a Firestore notification document for in-app display
 * 4. Sends confirmation back to the webhook
 *
 * Trigger: HTTP POST
 * Payload: { orderId, buyerId, artisanId, orderTotal }
 */

import * as admin from 'firebase-admin';
import type { IncomingMessage, ServerResponse } from 'http';

// ─── Config ─────────────────────────────────────────────────────────────────

const WEBHOOK_URL = process.env.WEBHOOK_URL || '';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// ─── Firebase Admin ─────────────────────────────────────────────────────────

let firebaseInitialized = false;

function initFirebase(): void {
    if (firebaseInitialized) return;

    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });

    firebaseInitialized = true;
}

function getFirestore(): admin.firestore.Firestore {
    initFirebase();
    return admin.firestore();
}

function getMessaging(): admin.messaging.Messaging {
    initFirebase();
    return admin.messaging();
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function sendToWebhook(type: string, data: Record<string, unknown>): Promise<void> {
    if (!WEBHOOK_URL) return;

    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': WEBHOOK_SECRET,
        },
        body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
        console.warn(`[OrderNotification] Webhook returned ${response.status}`);
    }
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

// ─── Notification Logic ─────────────────────────────────────────────────────

/**
 * Create an in-app notification in Firestore.
 */
async function createInAppNotification(
    artisanId: string,
    orderId: string,
    orderTotal: number
): Promise<void> {
    const db = getFirestore();

    await db.collection('notifications').add({
        userId: artisanId,
        title: '🎉 New Order Received!',
        body: `You just received an order worth ${formatCurrency(orderTotal)}. Check your dashboard to view details.`,
        type: 'order',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        data: {
            orderId,
            orderTotal: String(orderTotal),
        },
    });
}

/**
 * Update order status in Firestore for real-time sync.
 */
async function syncOrderToFirestore(
    orderId: string,
    artisanId: string,
    orderTotal: number
): Promise<void> {
    const db = getFirestore();

    await db.collection('orders').doc(orderId).set({
        orderId,
        artisanId,
        totalAmount: orderTotal,
        status: 'confirmed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        message: 'Order confirmed and artisan notified',
    }, { merge: true });
}

/**
 * Send a push notification via Firebase Cloud Messaging.
 * Requires the artisan to have registered an FCM token.
 */
async function sendPushNotification(
    artisanId: string,
    orderId: string,
    orderTotal: number
): Promise<boolean> {
    const db = getFirestore();

    // Look up the artisan's FCM token
    const tokenDoc = await db.collection('fcm_tokens').doc(artisanId).get();

    if (!tokenDoc.exists) {
        console.info(`[OrderNotification] No FCM token for artisan ${artisanId}, skipping push`);
        return false;
    }

    const { token } = tokenDoc.data() as { token: string };

    if (!token) {
        console.info(`[OrderNotification] Empty FCM token for artisan ${artisanId}`);
        return false;
    }

    try {
        const messaging = getMessaging();

        await messaging.send({
            token,
            notification: {
                title: '🎉 New Order!',
                body: `You received an order worth ${formatCurrency(orderTotal)}`,
            },
            data: {
                orderId,
                type: 'new_order',
                amount: String(orderTotal),
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'default',
                    channelId: 'orders',
                    clickAction: 'OPEN_ORDER',
                },
            },
            webpush: {
                notification: {
                    icon: '/icons/icon-192x192.png',
                    badge: '/icons/badge-72x72.png',
                    requireInteraction: true,
                },
                fcmOptions: {
                    link: `/dashboard/orders?highlight=${orderId}`,
                },
            },
        });

        console.log(`[OrderNotification] Push notification sent to artisan ${artisanId}`);
        return true;
    } catch (error) {
        console.error(`[OrderNotification] FCM send failed for artisan ${artisanId}:`, error);
        return false;
    }
}

// ─── Cloud Function Handler ─────────────────────────────────────────────────

export async function orderNotification(req: IncomingMessage, res: ServerResponse): Promise<void> {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Webhook-Secret');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    // Validate webhook secret
    const secret = req.headers['x-webhook-secret'];
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
    }

    try {
        // Parse request body
        const body = await new Promise<string>((resolve) => {
            let data = '';
            req.on('data', (chunk) => { data += chunk; });
            req.on('end', () => resolve(data));
        });

        const { orderId, buyerId, artisanId, orderTotal } = JSON.parse(body);

        if (!orderId || !artisanId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'orderId and artisanId are required' }));
            return;
        }

        console.log(`[OrderNotification] Processing order ${orderId} for artisan ${artisanId}`);

        // Run all notification tasks in parallel
        const [pushSent] = await Promise.all([
            sendPushNotification(artisanId, orderId, orderTotal || 0),
            createInAppNotification(artisanId, orderId, orderTotal || 0),
            syncOrderToFirestore(orderId, artisanId, orderTotal || 0),
        ]);

        // Send confirmation back to the main app
        await sendToWebhook('notification-sent', {
            orderId,
            artisanId,
            pushSent,
            timestamp: new Date().toISOString(),
        });

        console.log(`[OrderNotification] Completed for order ${orderId}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            orderId,
            pushSent,
            message: 'Artisan notified via push, in-app, and Firestore sync',
        }));
    } catch (error) {
        console.error('[OrderNotification] Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Notification failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        }));
    }
}
