'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Sparkles, ChevronDown, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

interface AiCraftGuideProps {
    productId: string;
    productTitle: string;
    craftType: string;
}

const SUGGESTED_QUESTIONS = [
    'How is this craft made?',
    'What materials are used?',
    'Why is this craft culturally significant?',
    'What makes this piece unique?',
    'How long does it take to make?',
];

export default function AiCraftGuide({ productId, productTitle, craftType }: AiCraftGuideProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current && messages.length > 0) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    async function askQuestion(question: string) {
        if (!question.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: question };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        if (!expanded) setExpanded(true);

        try {
            const res = await fetch('/api/ai/craft-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, question }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, { role: 'ai', content: data.answer }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'ai', content: 'Sorry, I could not connect to the craft guide. Please try again.' },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        askQuestion(input);
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl border border-indigo-100 overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Ask About This Craft
                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                <Sparkles className="h-3 w-3" /> AI Guide
                            </span>
                        </h2>
                        <p className="text-sm text-gray-500">
                            Ask anything about {craftType} craftsmanship
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {expanded && (
                <div className="px-6 pb-6">
                    {/* Suggested Questions */}
                    {messages.length === 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">
                                Suggested Questions
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_QUESTIONS.map((q) => (
                                    <button
                                        key={q}
                                        onClick={() => askQuestion(q)}
                                        className="text-sm px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-full hover:bg-indigo-50 hover:border-indigo-300 transition-all font-medium"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.length > 0 && (
                        <div className="space-y-4 mb-4 max-h-80 overflow-y-auto pr-1">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'ai' && (
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Bot className="h-4 w-4 text-indigo-600" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-white border border-indigo-100 text-gray-700 rounded-bl-sm shadow-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <User className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4 text-indigo-600" />
                                    </div>
                                    <div className="bg-white border border-indigo-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Quick follow-ups after conversation starts */}
                    {messages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
                                <button
                                    key={q}
                                    onClick={() => askQuestion(q)}
                                    disabled={loading}
                                    className="text-xs px-2.5 py-1 bg-white border border-indigo-200 text-indigo-600 rounded-full hover:bg-indigo-50 transition-all disabled:opacity-40"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Ask about ${productTitle}…`}
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm placeholder:text-gray-400 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
