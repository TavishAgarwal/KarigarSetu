'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { trackSearch } from '@/lib/analytics';

interface Product {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
    category: string;
    artisan: {
        location: string;
        user: { name: string };
    };
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function MarketplacePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([500, 25000]);
    const [sortBy, setSortBy] = useState('createdAt');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchProducts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '12');
            params.set('sortBy', sortBy);
            params.set('sortOrder', sortBy === 'price' ? 'asc' : 'desc');

            if (debouncedSearch.trim()) {
                params.set('search', debouncedSearch.trim());
            }
            if (selectedCategories.length === 1) {
                params.set('category', selectedCategories[0]);
            }
            if (selectedRegions.length > 0) {
                params.set('region', selectedRegions[0]);
            }
            if (priceRange[0] > 500) {
                params.set('minPrice', String(priceRange[0]));
            }

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();
            setProducts(data.products);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [selectedCategories, selectedRegions, priceRange, sortBy, debouncedSearch]);

    useEffect(() => {
        fetchProducts(1);
    }, [fetchProducts]);

    const clearSearch = () => {
        setSearchQuery('');
        searchInputRef.current?.focus();
    };

    // Keyboard shortcuts for marketplace
    useKeyboardShortcuts([
        {
            key: 'k',
            ctrlOrMeta: true,
            description: 'Focus search',
            handler: () => searchInputRef.current?.focus(),
        },
        {
            key: 'Escape',
            description: 'Clear search',
            handler: clearSearch,
        },
    ]);

    // Track search analytics
    useEffect(() => {
        if (debouncedSearch.trim()) {
            trackSearch(debouncedSearch.trim(), pagination.total);
        }
    }, [debouncedSearch, pagination.total]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block w-64 shrink-0">
                        <FilterSidebar
                            selectedCategories={selectedCategories}
                            selectedRegions={selectedRegions}
                            priceRange={priceRange}
                            onCategoryChange={setSelectedCategories}
                            onRegionChange={setSelectedRegions}
                            onPriceChange={setPriceRange}
                        />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Header */}
                        <div className="mb-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Handcrafted Treasures</h1>
                                    <p className="text-gray-500 mt-1">
                                        {debouncedSearch
                                            ? `Found ${pagination.total.toLocaleString()} results for "${debouncedSearch}"`
                                            : `Showing ${pagination.total.toLocaleString()} items from across India`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">Sort by:</span>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-[140px] bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="createdAt">Featured</SelectItem>
                                            <SelectItem value="price">Price</SelectItem>
                                            <SelectItem value="title">Name</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className="relative max-w-xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                    ref={searchInputRef}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by craft name, category, technique..."
                                    className="pl-12 pr-10 h-12 bg-white border-gray-200 focus:border-orange-300 focus:ring-orange-200 rounded-xl text-base shadow-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-2xl overflow-hidden animate-pulse"
                                    >
                                        <div className="aspect-[4/3] bg-gray-200" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        id={product.id}
                                        title={product.title}
                                        price={product.price}
                                        imageUrl={product.imageUrl}
                                        artisanName={product.artisan.user.name}
                                        location={product.artisan.location}
                                        category={product.category}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchProducts(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="flex items-center gap-1"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </Button>
                                {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => (
                                    <Button
                                        key={i}
                                        size="sm"
                                        variant={pagination.page === i + 1 ? 'default' : 'outline'}
                                        onClick={() => fetchProducts(i + 1)}
                                        className={pagination.page === i + 1 ? 'bg-orange-500 hover:bg-orange-600' : ''}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchProducts(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="flex items-center gap-1"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
