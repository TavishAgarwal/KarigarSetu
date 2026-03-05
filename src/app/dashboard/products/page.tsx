'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    Package,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CompactAuthBadge } from '@/components/AuthenticityBadge';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
    tags: string;
    createdAt: string;
    craftAuthenticity?: {
        authenticityScore: number;
    } | null;
}

export default function ProductsPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, low-stock, high-value
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        fetch('/api/artisan/profile', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.profile?.products) setProducts(data.profile.products);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setProducts((prev) => prev.filter((p) => p.id !== id));
            }
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeleting(null);
        }
    };

    const filtered = products
        .filter((p) => {
            if (search) {
                const q = search.toLowerCase();
                return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
            }
            return true;
        })
        .filter((p) => {
            if (filter === 'low-stock') return p.stock <= 5;
            if (filter === 'high-value') return p.price >= 2000;
            return true;
        });

    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock <= 5).length;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                            <p className="text-gray-500 mt-1">
                                Manage your craft listings and inventory
                            </p>
                        </div>
                        <Link href="/dashboard/ai-generator">
                            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2">
                                <Plus className="h-4 w-4" /> Add Product
                            </Button>
                        </Link>
                    </div>

                    {/* Stats Row */}
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <Package className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                                    <p className="text-sm text-gray-500">Total Products</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                    <span className="text-green-600 font-bold text-sm">₹</span>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">₹{totalValue.toLocaleString('en-IN')}</p>
                                    <p className="text-sm text-gray-500">Inventory Value</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${lowStockCount > 0 ? 'bg-orange-50' : 'bg-green-50'} rounded-xl flex items-center justify-center`}>
                                    <AlertTriangle className={`h-5 w-5 ${lowStockCount > 0 ? 'text-orange-500' : 'text-green-500'}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
                                    <p className="text-sm text-gray-500">Low Stock Items</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-6">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search products by name or category..."
                                    className="pl-10 rounded-xl"
                                />
                            </div>
                            <div className="flex gap-2">
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'low-stock', label: 'Low Stock' },
                                    { key: 'high-value', label: 'High Value' },
                                ].map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilter(f.key)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="h-7 w-7 text-orange-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {search || filter !== 'all' ? 'No matching products' : 'No products yet'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {search || filter !== 'all'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Start by creating your first AI-powered product listing.'}
                            </p>
                            {!search && filter === 'all' && (
                                <Link href="/dashboard/ai-generator">
                                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2">
                                        <Plus className="h-4 w-4" /> Create First Listing
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((product) => {
                                const tags: string[] = (() => {
                                    try { return JSON.parse(product.tags); } catch { return []; }
                                })();

                                return (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all overflow-hidden"
                                    >
                                        <div className="flex items-center p-4 gap-4">
                                            {/* Image */}
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                                                            {product.title}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
                                                    </div>
                                                    <span className="text-orange-600 font-bold text-lg whitespace-nowrap">
                                                        ₹{product.price.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    <span
                                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${product.stock > 5
                                                            ? 'bg-green-50 text-green-700'
                                                            : product.stock > 0
                                                                ? 'bg-orange-50 text-orange-700'
                                                                : 'bg-red-50 text-red-700'
                                                            }`}
                                                    >
                                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                                    </span>
                                                    {tags.slice(0, 2).map((tag: string) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="text-xs bg-gray-50 text-gray-600"
                                                        >
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                    {product.craftAuthenticity && product.craftAuthenticity.authenticityScore >= 80 && (
                                                        <CompactAuthBadge score={product.craftAuthenticity.authenticityScore} />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Link href={`/product/${product.id}`}>
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg">
                                                        <Eye className="h-4 w-4 text-gray-400" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg">
                                                    <Pencil className="h-4 w-4 text-gray-400" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 p-0 rounded-lg"
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deleting === product.id}
                                                >
                                                    {deleting === product.id ? (
                                                        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 text-red-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
