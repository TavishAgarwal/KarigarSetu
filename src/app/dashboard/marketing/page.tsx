'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sparkles,
    Instagram,
    MessageCircle,
    ShoppingBag,
    Megaphone,
    Loader2,
    Copy,
    Check,
} from 'lucide-react';

interface Product {
    id: string;
    title: string;
    category: string;
    description: string;
}

interface MarketingContent {
    instagramCaption: string;
    whatsappMessage: string;
    marketplaceDescription: string;
    promotionalText: string;
}

export default function MarketingPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [content, setContent] = useState<MarketingContent | null>(null);
    const [generating, setGenerating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [copiedField, setCopiedField] = useState('');

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

    const handleGenerate = async () => {
        const product = products.find((p) => p.id === selectedProduct);
        if (!product || !token) return;

        setGenerating(true);
        try {
            const res = await fetch('/api/ai/marketing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productTitle: product.title,
                    description: product.description,
                    craftType: product.category,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setContent(data.content);
            }
        } catch (err) {
            console.error('Marketing generation failed:', err);
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(''), 2000);
    };

    const cards = content
        ? [
            {
                icon: <Instagram className="h-5 w-5" />,
                title: 'Instagram Caption',
                content: content.instagramCaption,
                field: 'instagram',
                color: 'from-pink-500 to-purple-600',
            },
            {
                icon: <MessageCircle className="h-5 w-5" />,
                title: 'WhatsApp Message',
                content: content.whatsappMessage,
                field: 'whatsapp',
                color: 'from-green-500 to-green-600',
            },
            {
                icon: <ShoppingBag className="h-5 w-5" />,
                title: 'Marketplace Description',
                content: content.marketplaceDescription,
                field: 'marketplace',
                color: 'from-blue-500 to-blue-600',
            },
            {
                icon: <Megaphone className="h-5 w-5" />,
                title: 'Promotional Text',
                content: content.promotionalText,
                field: 'promo',
                color: 'from-orange-500 to-orange-600',
            },
        ]
        : [];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">AI Marketing Assistant</h1>
                        <p className="text-gray-500 mt-1">
                            Generate professional marketing content for your crafts across all platforms.
                        </p>
                    </div>

                    {/* Product Selector */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8">
                        <h2 className="font-bold text-gray-900 mb-4">Select a Product</h2>
                        <div className="flex gap-4">
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                                <SelectTrigger className="flex-1 rounded-xl">
                                    <SelectValue placeholder={loading ? 'Loading products...' : 'Choose a product'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleGenerate}
                                disabled={!selectedProduct || generating}
                                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2 px-6"
                            >
                                {generating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                                {generating ? 'Generating...' : 'Generate Content'}
                            </Button>
                        </div>
                    </div>

                    {/* Results */}
                    {generating && (
                        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Sparkles className="h-7 w-7 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Creating marketing magic...</h3>
                            <p className="text-gray-500">Our AI is crafting the perfect content for your product.</p>
                        </div>
                    )}

                    {content && !generating && (
                        <div className="grid md:grid-cols-2 gap-6">
                            {cards.map((card) => (
                                <div
                                    key={card.field}
                                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                                >
                                    <div className={`bg-gradient-to-r ${card.color} p-4 flex items-center gap-3 text-white`}>
                                        {card.icon}
                                        <span className="font-bold">{card.title}</span>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                            {card.content}
                                        </p>
                                        <button
                                            onClick={() => copyToClipboard(card.content, card.field)}
                                            className="mt-4 flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            {copiedField === card.field ? (
                                                <>
                                                    <Check className="h-4 w-4" /> Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4" /> Copy to Clipboard
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!content && !generating && (
                        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
                            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Megaphone className="h-7 w-7 text-orange-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to promote</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                Select a product and click &ldquo;Generate Content&rdquo; to create marketing content
                                for Instagram, WhatsApp, and more.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
