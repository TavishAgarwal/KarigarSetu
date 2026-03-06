/**
 * Cloud Functions trigger helper.
 * Provides HTTP-based triggers for serverless AI workflow functions.
 *
 * Product Pipeline: artisan uploads photo → trigger AI analysis → save to DB
 * Order Notification: new order → trigger push notification via Firebase
 *
 * SERVER-SIDE ONLY.
 */
import { isCloudFunctionsEnabled } from './featureFlags';

interface PipelineTriggerPayload {
    productId: string;
    imageUrl: string;
    craftType: string;
    artisanId: string;
}

interface NotificationTriggerPayload {
    orderId: string;
    buyerId: string;
    artisanId: string;
    orderTotal: number;
}

/**
 * Trigger the product AI pipeline Cloud Function.
 * When an artisan uploads a product photo, this triggers:
 * 1. Image analysis (craft detection)
 * 2. AI listing generation
 * 3. Save structured output to database
 *
 * No-op when Cloud Functions are not configured.
 */
export async function triggerProductPipeline(
    payload: PipelineTriggerPayload
): Promise<{ triggered: boolean; error?: string }> {
    if (!isCloudFunctionsEnabled()) {
        console.info('[CloudFunctions] Product pipeline not configured, skipping trigger');
        return { triggered: false };
    }

    const url = process.env.CLOUD_FUNCTION_PRODUCT_PIPELINE_URL || process.env.AI_LISTING_FUNCTION_URL;
    if (!url) return { triggered: false };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Secret': process.env.CLOUD_FUNCTION_WEBHOOK_SECRET || '',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('[CloudFunctions] Product pipeline trigger failed:', text);
            return { triggered: false, error: text };
        }

        return { triggered: true };
    } catch (error) {
        console.error('[CloudFunctions] Product pipeline trigger error:', error);
        return {
            triggered: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Trigger the order notification Cloud Function.
 * When a new order arrives, this triggers:
 * 1. Push notification to artisan via Firebase
 * 2. Email notification (if configured)
 *
 * No-op when Cloud Functions are not configured.
 */
export async function triggerOrderNotification(
    payload: NotificationTriggerPayload
): Promise<{ triggered: boolean; error?: string }> {
    if (!isCloudFunctionsEnabled()) {
        console.info('[CloudFunctions] Order notification not configured, skipping trigger');
        return { triggered: false };
    }

    const url = process.env.CLOUD_FUNCTION_ORDER_NOTIFICATION_URL || process.env.ORDER_NOTIFY_FUNCTION_URL;
    if (!url) return { triggered: false };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Secret': process.env.CLOUD_FUNCTION_WEBHOOK_SECRET || '',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('[CloudFunctions] Order notification trigger failed:', text);
            return { triggered: false, error: text };
        }

        return { triggered: true };
    } catch (error) {
        console.error('[CloudFunctions] Order notification trigger error:', error);
        return {
            triggered: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
