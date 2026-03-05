'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import VoiceInput from '@/components/VoiceInput';
import {
    User,
    Mail,
    MapPin,
    Clock,
    Palette,
    Shield,
    AlertTriangle,
    Loader2,
    Package,
    Calendar,
    Pencil,
    X,
    Check,
    ChevronDown,
    Mic,
} from 'lucide-react';

const CRAFT_TYPES = [
    'Madhubani Painting', 'Blue Pottery', 'Banarasi Silk Weaving', 'Chikankari Embroidery',
    'Dhokra Metal Casting', 'Bidriware', 'Pattachitra', 'Pashmina Weaving',
    'Terracotta Craft', 'Warli Painting', 'Phulkari Embroidery', 'Kalamkari',
    'Zardozi Embroidery', 'Khadi Weaving', 'Bamboo Craft', 'Woodcarving',
    'Stone Carving', 'Lac Bangles', 'Block Printing', 'Tie & Dye (Bandhani)',
    'Cane & Bamboo Furniture', 'Filigree Jewelry', 'Kundan Jewelry', 'Brass & Copper Work',
    'Leather Craft', 'Jute Craft', 'Coconut Shell Craft', 'Paper Mache',
    'Puppetry (Kathputli)', 'Glass Bead Work',
];

interface ProfileData {
    id: string;
    craftType: string;
    location: string;
    experienceYears: number;
    bio: string;
    profileImage: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    products: { id: string }[];
}

export default function ProfilePage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');

    // Edit mode state
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [craftDropdownOpen, setCraftDropdownOpen] = useState(false);
    const [showBioVoice, setShowBioVoice] = useState(false);
    const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);
    const [editForm, setEditForm] = useState({
        name: '',
        location: '',
        experienceYears: '',
        bio: '',
    });

    useEffect(() => {
        if (!token) return;
        fetch('/api/artisan/profile', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.profile) setProfile(data.profile);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    const startEditing = () => {
        if (!profile) return;
        setEditForm({
            name: profile.user.name || '',
            location: profile.location || '',
            experienceYears: String(profile.experienceYears || ''),
            bio: profile.bio || '',
        });
        // Parse comma-separated craft types into array
        const crafts = profile.craftType ? profile.craftType.split(',').map(c => c.trim()).filter(Boolean) : [];
        setSelectedCrafts(crafts);
        setCraftDropdownOpen(false);
        setEditing(true);
    };

    const toggleCraft = (craft: string) => {
        setSelectedCrafts(prev =>
            prev.includes(craft) ? prev.filter(c => c !== craft) : [...prev, craft]
        );
    };

    const cancelEditing = () => {
        setEditing(false);
        setCraftDropdownOpen(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/artisan/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: editForm.name,
                    location: editForm.location,
                    craftType: selectedCrafts.join(', '),
                    experienceYears: Number(editForm.experienceYears) || 0,
                    bio: editForm.bio,
                }),
            });
            const data = await res.json();
            if (data.profile) {
                setProfile(data.profile);
                setEditing(false);
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteInput !== 'DELETE') return;
        setDeleting(true);
        try {
            const res = await fetch('/api/auth/delete-account', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                logout();
                router.push('/');
            }
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setDeleting(false);
        }
    };

    const joinDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : '—';

    const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-colors bg-white';
    const labelClass = 'block text-xs font-medium text-gray-500 mb-1';

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
                        <p className="text-gray-500">Manage your account details</p>
                    </div>
                    {!loading && !editing && (
                        <Button
                            onClick={startEditing}
                            variant="outline"
                            className="gap-2 rounded-xl border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    )}
                    {editing && (
                        <div className="flex gap-2">
                            <Button
                                onClick={cancelEditing}
                                variant="outline"
                                className="gap-2 rounded-xl"
                                disabled={saving}
                            >
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                                disabled={saving}
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Profile Header Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
                            <div className="h-32 bg-gradient-to-r from-orange-500 to-orange-400" />
                            <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
                                {profile?.profileImage ? (
                                    <img
                                        src={profile.profileImage}
                                        alt={user?.name || ''}
                                        className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl border-4 border-white bg-orange-500 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-3xl">
                                            {(editing ? editForm.name : user?.name)?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    </div>
                                )}

                                {editing ? (
                                    <div className="mt-3 w-full max-w-xs">
                                        <label className={labelClass}>Full Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className={`${inputClass} text-center`}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-bold text-gray-900 mt-3">{user?.name}</h2>
                                        <p className="text-sm text-gray-500 capitalize mb-6">{user?.role || 'Artisan'}</p>
                                    </>
                                )}

                                {editing ? (
                                    <div className="w-full grid sm:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className={labelClass}>
                                                <MapPin className="h-3 w-3 inline mr-1" />Location
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                className={inputClass}
                                                placeholder="e.g. Jaipur, Rajasthan"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className={labelClass}>
                                                <Palette className="h-3 w-3 inline mr-1" />Craft Types
                                            </label>

                                            {/* Selected chips */}
                                            {selectedCrafts.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {selectedCrafts.map(craft => (
                                                        <span
                                                            key={craft}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium"
                                                        >
                                                            {craft}
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleCraft(craft)}
                                                                className="hover:text-orange-900"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Dropdown toggle */}
                                            <button
                                                type="button"
                                                onClick={() => setCraftDropdownOpen(!craftDropdownOpen)}
                                                className={`${inputClass} flex items-center justify-between cursor-pointer`}
                                            >
                                                <span className="text-gray-400">
                                                    {selectedCrafts.length === 0
                                                        ? 'Select craft types...'
                                                        : `${selectedCrafts.length} selected`}
                                                </span>
                                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${craftDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {/* Dropdown list */}
                                            {craftDropdownOpen && (
                                                <div className="mt-1 max-h-52 overflow-y-auto border border-gray-200 rounded-xl bg-white shadow-lg">
                                                    {CRAFT_TYPES.map(craft => {
                                                        const isSelected = selectedCrafts.includes(craft);
                                                        return (
                                                            <button
                                                                key={craft}
                                                                type="button"
                                                                onClick={() => toggleCraft(craft)}
                                                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-orange-50 transition-colors ${isSelected ? 'bg-orange-50 text-orange-700 font-medium' : 'text-gray-700'
                                                                    }`}
                                                            >
                                                                {craft}
                                                                {isSelected && <Check className="h-4 w-4 text-orange-500" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                <Clock className="h-3 w-3 inline mr-1" />Experience (years)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={editForm.experienceYears}
                                                onChange={(e) => setEditForm({ ...editForm, experienceYears: e.target.value })}
                                                className={inputClass}
                                                placeholder="e.g. 10"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                                                <Package className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Products Listed</p>
                                                <p className="text-sm font-medium text-gray-900">{profile?.products?.length || 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Member Since</p>
                                                <p className="text-sm font-medium text-gray-900">{joinDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full grid sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Mail className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                                                <MapPin className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Location</p>
                                                <p className="text-sm font-medium text-gray-900">{profile?.location || 'Not set'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <Palette className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Craft Type</p>
                                                <p className="text-sm font-medium text-gray-900">{profile?.craftType || 'Not set'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <Clock className="h-4 w-4 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Experience</p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {profile?.experienceYears ? `${profile.experienceYears} years` : 'Not set'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                                                <Package className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Products Listed</p>
                                                <p className="text-sm font-medium text-gray-900">{profile?.products?.length || 0}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Member Since</p>
                                                <p className="text-sm font-medium text-gray-900">{joinDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                Bio
                                {editing && (
                                    <button
                                        type="button"
                                        onClick={() => setShowBioVoice(!showBioVoice)}
                                        className={`ml-auto flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${showBioVoice
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'text-orange-600 hover:bg-orange-50'
                                            }`}
                                    >
                                        <Mic className="h-3 w-3" />
                                        {showBioVoice ? 'Hide Voice' : 'Use Voice'}
                                    </button>
                                )}
                            </h3>
                            {editing ? (
                                <div className="space-y-3">
                                    {showBioVoice && (
                                        <VoiceInput
                                            onTranscript={(text) =>
                                                setEditForm((prev) => ({
                                                    ...prev,
                                                    bio: prev.bio ? prev.bio + ' ' + text : text,
                                                }))
                                            }
                                            placeholder="Speak your bio in any language..."
                                        />
                                    )}
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        className={`${inputClass} min-h-[100px] resize-y`}
                                        placeholder="Write a short bio about yourself and your craft..."
                                    />
                                </div>
                            ) : (
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {profile?.bio || <span className="text-gray-400 italic">No bio added yet</span>}
                                </p>
                            )}
                        </div>

                        {/* Account Security */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-gray-500" />
                                Account Security
                            </h3>
                            <div className="flex items-center justify-between py-3 border-b border-gray-50">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Password</p>
                                    <p className="text-xs text-gray-500">••••••••</p>
                                </div>
                                <span className="text-xs text-gray-400">Secured with bcrypt</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Authentication</p>
                                    <p className="text-xs text-gray-500">JWT Token</p>
                                </div>
                                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">Active</span>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white rounded-2xl border-2 border-red-100 p-6">
                            <h3 className="font-bold text-red-700 mb-1 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Danger Zone
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Permanently delete your account and all associated data including products, craft stories, and profile information. This action cannot be undone.
                            </p>

                            {!confirmDelete ? (
                                <Button
                                    onClick={() => setConfirmDelete(true)}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                >
                                    Delete My Account
                                </Button>
                            ) : (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <p className="text-sm font-medium text-red-800 mb-3">
                                        Type <span className="font-mono bg-red-100 px-2 py-0.5 rounded">DELETE</span> to confirm permanent account deletion:
                                    </p>
                                    <input
                                        type="text"
                                        value={deleteInput}
                                        onChange={(e) => setDeleteInput(e.target.value)}
                                        placeholder="Type DELETE"
                                        className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-300"
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleDeleteAccount}
                                            disabled={deleteInput !== 'DELETE' || deleting}
                                            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                                        >
                                            {deleting ? (
                                                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...</>
                                            ) : (
                                                'Permanently Delete Account'
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setConfirmDelete(false);
                                                setDeleteInput('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
