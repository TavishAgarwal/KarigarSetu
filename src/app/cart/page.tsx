'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    CheckCircle2,
    Loader2,
} from 'lucide-react';

export default function CartPage() {
    const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
    const { token } = useAuth();
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderIds, setOrderIds] = useState<string[]>([]);
    const [placing, setPlacing] = useState(false);
    const [error, setError] = useState('');

    // Checkout form
    const [shippingForm, setShippingForm] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
    });

    const handlePlaceOrder = async () => {
        setPlacing(true);
        setError('');
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: cartItems.map(i => ({
                        productId: i.productId,
                        quantity: i.quantity,
                    })),
                    shippingForm,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to place order');
            setOrderIds(data.orderIds || []);
            setOrderPlaced(true);
            clearCart();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setPlacing(false);
        }
    };

    const shippingCost = cartTotal > 999 ? 0 : 99;
    const grandTotal = cartTotal + shippingCost;
    const isFormFilled = shippingForm.fullName && shippingForm.address && shippingForm.city && shippingForm.state && shippingForm.pincode && shippingForm.phone;

    // Order success
    if (orderPlaced) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center max-w-md w-full shadow-sm">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                        <p className="text-gray-500 mb-8">
                            Your order has been confirmed. The artisan will prepare your handcrafted items with care.
                        </p>
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-8">
                            {orderIds.map((oid, i) => (
                                <p key={oid} className="text-sm text-orange-700">
                                    <strong>Order {orderIds.length > 1 ? `#${i + 1}` : 'ID'}:</strong> {oid}
                                </p>
                            ))}
                            <p className="text-xs text-orange-500 mt-1">You will receive a confirmation email shortly.</p>
                        </div>
                        <Link href="/marketplace" className={buttonVariants({ className: "bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-3 w-full" })}>
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    // Empty cart
    if (cartItems.length === 0 && !orderPlaced) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="h-12 w-12 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-sm">
                            Discover unique handcrafted products by talented Indian artisans.
                        </p>
                        <Link href="/marketplace" className={buttonVariants({ className: "bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-3" })}>
                            Explore Crafts
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <main className="max-w-6xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Shopping Cart</h1>
                            <p className="text-gray-500">{cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart</p>
                        </div>
                        <Link href="/marketplace" className={buttonVariants({ variant: "outline", className: "gap-2 rounded-xl" })}>
                            <ArrowLeft className="h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map(item => (
                                <div key={item.productId} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                                    <div className="relative w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                                                <p className="text-sm text-gray-500 mt-0.5">by {item.artisanName}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-end justify-between mt-4">
                                            <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-8 text-center font-medium text-sm text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <p className="text-lg font-bold text-orange-600">
                                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary / Checkout */}
                        <div className="space-y-4">
                            {/* Summary Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="h-4 w-4 text-gray-500" />
                                    Order Summary
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cartCount} items)</span>
                                        <span className="font-medium">₹{cartTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className={`font-medium ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                            {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                                        </span>
                                    </div>
                                    {shippingCost > 0 && (
                                        <p className="text-xs text-gray-400">
                                            Free shipping on orders above ₹999
                                        </p>
                                    )}
                                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-lg text-orange-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                {!showCheckout ? (
                                    <Button
                                        onClick={() => setShowCheckout(true)}
                                        className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 gap-2"
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        Proceed to Checkout
                                    </Button>
                                ) : null}
                            </div>

                            {/* Checkout Form */}
                            {showCheckout && (
                                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        Shipping Address
                                    </h3>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={shippingForm.fullName}
                                                onChange={e => setShippingForm({ ...shippingForm, fullName: e.target.value })}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                                                placeholder="Enter your full name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                                            <textarea
                                                value={shippingForm.address}
                                                onChange={e => setShippingForm({ ...shippingForm, address: e.target.value })}
                                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 min-h-[60px] resize-y"
                                                placeholder="House/Flat, Street, Landmark"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    value={shippingForm.city}
                                                    onChange={e => setShippingForm({ ...shippingForm, city: e.target.value })}
                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                                                    placeholder="City"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                                                <input
                                                    type="text"
                                                    value={shippingForm.state}
                                                    onChange={e => setShippingForm({ ...shippingForm, state: e.target.value })}
                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                                                    placeholder="State"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">PIN Code</label>
                                                <input
                                                    type="text"
                                                    value={shippingForm.pincode}
                                                    onChange={e => setShippingForm({ ...shippingForm, pincode: e.target.value })}
                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                                                    placeholder="6-digit PIN"
                                                    maxLength={6}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                                                <input
                                                    type="tel"
                                                    value={shippingForm.phone}
                                                    onChange={e => setShippingForm({ ...shippingForm, phone: e.target.value })}
                                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                                                    placeholder="10-digit number"
                                                    maxLength={10}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Section */}
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <CreditCard className="h-4 w-4 text-gray-500" />
                                            Payment
                                        </h4>
                                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-orange-200">
                                                    <CreditCard className="h-5 w-5 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Cash on Delivery</p>
                                                    <p className="text-xs text-gray-500">Pay when you receive your order</p>
                                                </div>
                                            </div>
                                        </div>


                                        {error && (
                                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 mb-3">{error}</p>
                                        )}

                                        <Button
                                            onClick={handlePlaceOrder}
                                            disabled={!isFormFilled || placing}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3 gap-2 disabled:opacity-50"
                                        >
                                            {placing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Placing Order...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Place Order — ₹{grandTotal.toLocaleString('en-IN')}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}
