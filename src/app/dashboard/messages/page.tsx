'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Search,
    Send,
    Star,
    Clock,
    Check,
    CheckCheck,
    Smile,
    MessageCircle,
    Users,
} from 'lucide-react';

interface Message {
    id: string;
    text: string;
    time: string;
    fromMe: boolean;
}

interface Conversation {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    isStarred: boolean;
    isOnline: boolean;
    messages: Message[];
}

export default function MessagesPage() {
    const [selectedConv, setSelectedConv] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [conversations] = useState<Conversation[]>([]);

    const activeConv = conversations.find((c) => c.id === selectedConv);

    const filteredConvs = conversations.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />

            <main className="flex-1 flex overflow-hidden">
                {/* Conversation List */}
                <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                        <h1 className="text-xl font-bold text-gray-900 mb-3">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search conversations..."
                                className="pl-10 rounded-xl bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Conversations or Empty State */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConvs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle className="h-7 w-7 text-orange-400" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-sm mb-1">No conversations yet</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    When buyers reach out about your crafts, their messages will appear here.
                                </p>
                            </div>
                        ) : (
                            filteredConvs.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConv(conv.id)}
                                    className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${selectedConv === conv.id ? 'bg-orange-50 border-l-2 border-l-orange-500' : ''
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedConv === conv.id ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            <span className="font-bold text-sm">{conv.avatar}</span>
                                        </div>
                                        {conv.isOnline && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm text-gray-900 flex items-center gap-1">
                                                {conv.name}
                                                {conv.isStarred && <Star className="h-3 w-3 text-orange-400 fill-orange-400" />}
                                            </span>
                                            <span className="text-xs text-gray-400">{conv.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
                                    </div>
                                    {conv.unread > 0 && (
                                        <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">
                                            {conv.unread}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                {activeConv ? (
                    <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{activeConv.avatar}</span>
                                </div>
                                {activeConv.isOnline && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{activeConv.name}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    {activeConv.isOnline ? (
                                        <><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online</>
                                    ) : (
                                        <><Clock className="h-3 w-3" /> Last seen recently</>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                            {activeConv.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${msg.fromMe
                                            ? 'bg-orange-500 text-white rounded-br-md'
                                            : 'bg-white text-gray-900 border border-gray-100 rounded-bl-md'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1 ${msg.fromMe ? 'text-orange-200' : 'text-gray-400'
                                            }`}>
                                            <span className="text-xs">{msg.time}</span>
                                            {msg.fromMe && <CheckCheck className="h-3 w-3" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Compose */}
                        <div className="bg-white border-t border-gray-100 p-4">
                            <div className="flex items-end gap-3">
                                <button className="text-gray-400 hover:text-gray-600 p-2">
                                    <Smile className="h-5 w-5" />
                                </button>
                                <Textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-xl resize-none min-h-[44px] max-h-[120px]"
                                    rows={1}
                                />
                                <Button
                                    disabled={!newMessage.trim()}
                                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-11 w-11 p-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
                        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                            <Users className="h-10 w-10 text-orange-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Your Inbox</h2>
                        <p className="text-gray-500 text-sm max-w-sm text-center leading-relaxed">
                            {conversations.length === 0
                                ? 'No messages yet. Once buyers discover your crafts on the marketplace and reach out, conversations will appear here.'
                                : 'Select a conversation to start chatting'}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
