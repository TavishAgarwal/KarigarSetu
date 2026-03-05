'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecommendationCard from './RecommendationCard';

interface RecommendedProduct {
    productId: string;
    title: string;
    price: number;
    imageUrl: string;
    artisanName: string;
    craftType: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    products?: RecommendedProduct[];
    loading?: boolean;
}

const SUGGESTIONS = [
    'Handmade gifts under ₹2000 for a wedding',
    'Blue pottery for home decor',
    'Traditional silk sarees from South India',
    'Wooden toys for children under ₹500',
    'Handwoven rugs for living room',
    'Unique jewelry for Diwali gifts',
];

export default function AiShopperChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (query?: string) => {
        const text = query || input.trim();
        if (!text || loading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
        };

        const loadingMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '',
            loading: true,
        };

        setMessages(prev => [...prev, userMsg, loadingMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/ai/personal-shopper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text }),
            });

            if (!res.ok) throw new Error('Failed');

            const data = await res.json();

            const aiMsg: ChatMessage = {
                id: loadingMsg.id,
                role: 'assistant',
                content: data.responseText,
                products: data.recommendedProducts,
            };

            setMessages(prev => prev.map(m => m.id === loadingMsg.id ? aiMsg : m));
        } catch {
            setMessages(prev => prev.map(m =>
                m.id === loadingMsg.id
                    ? { ...m, loading: false, content: 'Sorry, I had trouble processing your request. Please try again!' }
                    : m
            ));
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {messages.length === 0 ? (
                        /* Welcome Screen */
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
                                <Sparkles className="h-10 w-10 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                AI Craft Shopper
                            </h1>
                            <p className="text-gray-500 max-w-md mb-8 text-lg">
                                Describe what you&apos;re looking for in your own words, and I&apos;ll find the perfect handcrafted pieces for you.
                            </p>

                            {/* Suggestion Chips */}
                            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                                {SUGGESTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(s)}
                                        className="text-sm px-4 py-2.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
                                    >
                                        <ShoppingBag className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Chat Messages */
                        <div className="space-y-6">
                            {messages.map((msg) => (
                                <div key={msg.id}>
                                    {/* Message Bubble */}
                                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] ${msg.role === 'user'
                                            ? 'bg-orange-500 text-white rounded-2xl rounded-br-md px-5 py-3'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm'
                                            }`}>
                                            {msg.loading ? (
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span className="text-sm">Finding the perfect craft for you...</span>
                                                </div>
                                            ) : (
                                                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Cards */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mt-4 ml-0">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <ShoppingBag className="h-3.5 w-3.5" />
                                                Recommended for you
                                            </p>
                                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {msg.products.map((p) => (
                                                    <RecommendationCard key={p.productId} {...p} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Input Bar */}
            <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-3"
                    >
                        <input
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Describe what you're looking for..."
                            className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-all"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-5 h-[50px] shadow-sm"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </form>
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                        AI recommendations are based on available products. Results may vary.
                    </p>
                </div>
            </div>
        </div>
    );
}
