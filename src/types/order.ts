/** Shared order-related types used across pages, components, and API routes. */

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export const VALID_ORDER_STATUSES: OrderStatus[] = [
    'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED',
];

/** Valid status transitions for order state machine */
export const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED'],
    SHIPPED: ['DELIVERED'],
};

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    product?: {
        id: string;
        title: string;
        imageUrl: string;
    };
}

export interface Order {
    id: string;
    buyerId: string;
    artisanId: string;
    totalAmount: number;
    status: OrderStatus;
    buyerName: string;
    buyerAddress: string;
    buyerPhone: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}
