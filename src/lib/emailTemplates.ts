/**
 * Order confirmation email template generator.
 * Produces clean, responsive HTML emails for order confirmations.
 */

interface OrderEmailData {
    orderId: string;
    buyerName: string;
    items: {
        title: string;
        artisanName: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    shippingAddress?: string;
    estimatedDelivery?: string;
}

/**
 * Generate an HTML email for order confirmation.
 * Uses inline styles for maximum email client compatibility.
 */
export function generateOrderConfirmationEmail(data: OrderEmailData): string {
    const itemRows = data.items
        .map(
            (item) => `
        <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151;">
                <strong>${escapeHtml(item.title)}</strong>
                <br /><span style="color: #9ca3af; font-size: 12px;">by ${escapeHtml(item.artisanName)}</span>
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: center; font-size: 14px; color: #374151;">
                ${item.quantity}
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 14px; color: #374151;">
                ₹${item.price.toLocaleString('en-IN')}
            </td>
        </tr>`
        )
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation — KarigarSetu</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" width="100%" style="background-color: #f9fafb; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">🪔 KarigarSetu</h1>
                            <p style="margin: 8px 0 0; color: #fed7aa; font-size: 14px;">AI-Powered Marketplace for Indian Artisans</p>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 32px 32px 16px;">
                            <h2 style="margin: 0 0 8px; font-size: 20px; color: #111827;">Thank you, ${escapeHtml(data.buyerName)}! 🎉</h2>
                            <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                Your order has been confirmed. You're supporting traditional Indian artisans and preserving centuries-old craft heritage.
                            </p>
                        </td>
                    </tr>

                    <!-- Order ID -->
                    <tr>
                        <td style="padding: 0 32px 24px;">
                            <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px; text-align: center;">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #9a3412; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Order ID</p>
                                <p style="margin: 0; font-size: 18px; color: #c2410c; font-weight: 700; font-family: monospace;">${escapeHtml(data.orderId)}</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Items Table -->
                    <tr>
                        <td style="padding: 0 32px 24px;">
                            <table role="presentation" width="100%" style="border-collapse: collapse;">
                                <thead>
                                    <tr>
                                        <td style="padding: 10px 16px; background-color: #f9fafb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 8px 0 0 0;">Product</td>
                                        <td style="padding: 10px 16px; background-color: #f9fafb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; text-align: center;">Qty</td>
                                        <td style="padding: 10px 16px; background-color: #f9fafb; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; text-align: right; border-radius: 0 8px 0 0;">Price</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemRows}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2" style="padding: 16px; font-size: 16px; font-weight: 700; color: #111827; text-align: right;">Total</td>
                                        <td style="padding: 16px; font-size: 16px; font-weight: 700; color: #c2410c; text-align: right;">₹${data.totalAmount.toLocaleString('en-IN')}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </td>
                    </tr>

                    ${data.shippingAddress ? `
                    <!-- Shipping -->
                    <tr>
                        <td style="padding: 0 32px 24px;">
                            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px;">
                                <p style="margin: 0 0 4px; font-size: 12px; color: #166534; text-transform: uppercase; font-weight: 600;">Shipping To</p>
                                <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">${escapeHtml(data.shippingAddress)}</p>
                                ${data.estimatedDelivery ? `<p style="margin: 8px 0 0; font-size: 13px; color: #16a34a;">Estimated delivery: ${escapeHtml(data.estimatedDelivery)}</p>` : ''}
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    <!-- CTA -->
                    <tr>
                        <td style="padding: 0 32px 32px; text-align: center;">
                            <a href="https://karigarsetu.com/dashboard/orders" style="display: inline-block; background-color: #f97316; color: #ffffff; font-weight: 600; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
                                Track Your Order →
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #f3f4f6;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #9ca3af;">
                                Made with ❤️ for India's artisan heritage
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #d1d5db;">
                                <a href="https://karigarsetu.com" style="color: #f97316; text-decoration: none;">karigarsetu.com</a>
                                &nbsp;·&nbsp;
                                <a href="https://karigarsetu.com/marketplace" style="color: #f97316; text-decoration: none;">Marketplace</a>
                                &nbsp;·&nbsp;
                                <a href="https://karigarsetu.com/impact" style="color: #f97316; text-decoration: none;">Our Impact</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/** Escape HTML entities for safe insertion into template */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
