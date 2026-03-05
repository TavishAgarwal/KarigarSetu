'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import UploadWidget from '@/components/UploadWidget';
import Navbar from '@/components/Navbar';
import VoiceInput from '@/components/VoiceInput';
import {
    X, Check, Pencil, MapPin, Briefcase, Clock, FileText,
    ChevronRight, ChevronLeft, Palette, Camera, Package, Truck,
    CreditCard, Sparkles, Loader2, Mic, Factory, Globe,
    Image as ImageIcon,
} from 'lucide-react';

// ─── All Indian States & Union Territories ───
const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

// ─── Districts by State ───
const STATE_DISTRICTS: Record<string, string[]> = {
    'Andhra Pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Kadapa', 'Krishna', 'Kurnool', 'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 'West Godavari'],
    'Arunachal Pradesh': ['Anjaw', 'Changlang', 'East Kameng', 'East Siang', 'Itanagar', 'Lohit', 'Papum Pare', 'Tawang', 'West Kameng', 'West Siang'],
    'Assam': ['Barpeta', 'Cachar', 'Darrang', 'Dhubri', 'Dibrugarh', 'Goalpara', 'Golaghat', 'Jorhat', 'Kamrup', 'Karbi Anglong', 'Nagaon', 'Sivasagar', 'Sonitpur', 'Tinsukia'],
    'Bihar': ['Araria', 'Aurangabad', 'Begusarai', 'Bhagalpur', 'Darbhanga', 'Gaya', 'Jehanabad', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Patna', 'Purnia', 'Samastipur', 'Vaishali'],
    'Chhattisgarh': ['Bastar', 'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Janjgir-Champa', 'Jashpur', 'Kanker', 'Korba', 'Koriya', 'Mahasamund', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Surguja'],
    'Goa': ['North Goa', 'South Goa'],
    'Gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Dahod', 'Gandhinagar', 'Jamnagar', 'Junagadh', 'Kutch', 'Mehsana', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Vadodara', 'Valsad'],
    'Haryana': ['Ambala', 'Bhiwani', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
    'Himachal Pradesh': ['Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'],
    'Jharkhand': ['Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum', 'Giridih', 'Godda', 'Hazaribagh', 'Palamu', 'Ranchi', 'West Singhbhum'],
    'Karnataka': ['Bagalkot', 'Bangalore Rural', 'Bangalore Urban', 'Belgaum', 'Bellary', 'Bidar', 'Chamarajanagar', 'Chikkamagaluru', 'Dakshina Kannada', 'Dharwad', 'Gulbarga', 'Hassan', 'Kodagu', 'Mandya', 'Mysore', 'Raichur', 'Shimoga', 'Tumkur', 'Udupi', 'Uttara Kannada'],
    'Kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'],
    'Madhya Pradesh': ['Balaghat', 'Betul', 'Bhopal', 'Chhindwara', 'Dewas', 'Dhar', 'Gwalior', 'Hoshangabad', 'Indore', 'Jabalpur', 'Mandla', 'Ratlam', 'Rewa', 'Sagar', 'Satna', 'Shahdol', 'Ujjain', 'Vidisha'],
    'Maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Bhandara', 'Chandrapur', 'Dhule', 'Jalgaon', 'Kolhapur', 'Latur', 'Mumbai', 'Nagpur', 'Nanded', 'Nashik', 'Pune', 'Ratnagiri', 'Sangli', 'Satara', 'Solapur', 'Thane', 'Wardha'],
    'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Senapati', 'Tamenglong', 'Thoubal', 'Ukhrul'],
    'Meghalaya': ['East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills', 'North Garo Hills', 'Ri-Bhoi', 'South Garo Hills', 'South West Garo Hills', 'West Garo Hills', 'West Jaintia Hills', 'West Khasi Hills'],
    'Mizoram': ['Aizawl', 'Champhai', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Serchhip'],
    'Nagaland': ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
    'Odisha': ['Angul', 'Balasore', 'Bhadrak', 'Bolangir', 'Cuttack', 'Dhenkanal', 'Ganjam', 'Gajapati', 'Jagatsinghpur', 'Jharsuguda', 'Kalahandi', 'Kendrapara', 'Keonjhar', 'Khordha', 'Koraput', 'Mayurbhanj', 'Puri', 'Rayagada', 'Sambalpur', 'Sundergarh'],
    'Punjab': ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka', 'Firozpur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar', 'Pathankot', 'Patiala', 'Rupnagar', 'Sangrur'],
    'Rajasthan': ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Tonk', 'Udaipur'],
    'Sikkim': ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Perambalur', 'Ramanathapuram', 'Salem', 'Sivagangai', 'Thanjavur', 'Theni', 'Tiruchirappalli', 'Tirunelveli', 'Tiruvannamalai', 'Vellore', 'Villupuram', 'Virudhunagar'],
    'Telangana': ['Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Karimnagar', 'Khammam', 'Mahabubabad', 'Medak', 'Nalgonda', 'Nizamabad', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Warangal'],
    'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
    'Uttar Pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Azamgarh', 'Barabanki', 'Bareilly', 'Bijnor', 'Budaun', 'Bulandshahr', 'Etawah', 'Faizabad', 'Firozabad', 'Gautam Buddh Nagar', 'Ghaziabad', 'Gorakhpur', 'Jaunpur', 'Kanpur', 'Lucknow', 'Mathura', 'Meerut', 'Moradabad', 'Muzaffarnagar', 'Prayagraj', 'Saharanpur', 'Sultanpur', 'Varanasi'],
    'Uttarakhand': ['Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar', 'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal', 'Udham Singh Nagar', 'Uttarkashi'],
    'West Bengal': ['Bankura', 'Birbhum', 'Burdwan', 'Cooch Behar', 'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Kolkata', 'Malda', 'Medinipur East', 'Medinipur West', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'Purulia', 'South 24 Parganas'],
    'Andaman and Nicobar Islands': ['Nicobar', 'North and Middle Andaman', 'South Andaman'],
    'Chandigarh': ['Chandigarh'],
    'Dadra and Nagar Haveli and Daman and Diu': ['Dadra and Nagar Haveli', 'Daman', 'Diu'],
    'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
    'Jammu and Kashmir': ['Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal', 'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Pulwama', 'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'],
    'Ladakh': ['Kargil', 'Leh'],
    'Lakshadweep': ['Lakshadweep'],
    'Puducherry': ['Karaikal', 'Mahe', 'Puducherry', 'Yanam'],
};

// ─── 30 Major Craft Types ───
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

const STEPS = [
    { label: 'Craft', icon: Palette },
    { label: 'Location', icon: MapPin },
    { label: 'Portfolio', icon: Camera },
    { label: 'Business', icon: Factory },
    { label: 'Shipping', icon: Truck },
    { label: 'Payment', icon: CreditCard },
];

const STORAGE_KEY = 'karigar_onboarding';

interface FormData {
    // Step 1 — Craft
    selectedCrafts: string[];
    craftSpecialization: string;
    materialsUsed: string;
    techniquesUsed: string;
    experienceYears: string;
    // Step 2 — Location
    selectedState: string;
    selectedDistrict: string;
    village: string;
    pincode: string;
    // Step 3 — Portfolio
    profileImage: string;
    portfolioImages: string[];
    bio: string;
    // Step 4 — Business
    productionCapacity: string;
    workshopSize: string;
    acceptsBulkOrders: boolean;
    // Step 5 — Shipping
    shipsDomestic: boolean;
    shipsInternational: boolean;
    // Step 6 — Payment
    upiId: string;
    bankAccount: string;
    ifscCode: string;
}

const defaultForm: FormData = {
    selectedCrafts: [],
    craftSpecialization: '',
    materialsUsed: '',
    techniquesUsed: '',
    experienceYears: '',
    selectedState: '',
    selectedDistrict: '',
    village: '',
    pincode: '',
    profileImage: '',
    portfolioImages: [],
    bio: '',
    productionCapacity: '',
    workshopSize: '',
    acceptsBulkOrders: false,
    shipsDomestic: true,
    shipsInternational: false,
    upiId: '',
    bankAccount: '',
    ifscCode: '',
};

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}

function OnboardingContent() {
    const { token } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true';
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [showBioVoice, setShowBioVoice] = useState(false);
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<{ craftType?: string; materials?: string[]; tags?: string[]; suggestedTitle?: string } | null>(null);
    const [generatingBio, setGeneratingBio] = useState(false);

    // Form data
    const [form, setForm] = useState<FormData>(defaultForm);

    // Load from sessionStorage or fetch existing profile in edit mode
    useEffect(() => {
        if (isEditMode && token) {
            // Edit mode: load existing profile data
            setProfileLoading(true);
            fetch('/api/artisan/profile', { headers: { Authorization: `Bearer ${token}` } })
                .then((r) => r.json())
                .then((data) => {
                    if (data.profile) {
                        const p = data.profile;
                        const crafts = p.craftType ? p.craftType.split(', ').filter(Boolean) : [];
                        // Parse location: "Village, District, State" or "District, State"
                        const locParts = (p.location || '').split(', ');
                        let village = '', district = '', state = '';
                        if (locParts.length >= 3) {
                            village = locParts.slice(0, -2).join(', ');
                            district = locParts[locParts.length - 2];
                            state = locParts[locParts.length - 1];
                        } else if (locParts.length === 2) {
                            district = locParts[0];
                            state = locParts[1];
                        }
                        setForm({
                            selectedCrafts: crafts,
                            craftSpecialization: p.craftSpecialization || '',
                            materialsUsed: p.materialsUsed || '',
                            techniquesUsed: p.techniquesUsed || '',
                            experienceYears: p.experienceYears?.toString() || '',
                            selectedState: p.state || state,
                            selectedDistrict: p.district || district,
                            village: village,
                            pincode: p.pincode || '',
                            profileImage: p.profileImage || '',
                            portfolioImages: [],
                            bio: p.bio || '',
                            productionCapacity: p.productionCapacity?.toString() || '',
                            workshopSize: p.workshopSize?.toString() || '',
                            acceptsBulkOrders: p.acceptsBulkOrders || false,
                            shipsDomestic: p.shipsDomestic !== undefined ? p.shipsDomestic : true,
                            shipsInternational: p.shipsInternational || false,
                            upiId: p.upiId || '',
                            bankAccount: p.bankAccount || '',
                            ifscCode: p.ifscCode || '',
                        });
                    }
                })
                .catch(console.error)
                .finally(() => setProfileLoading(false));
        } else {
            // New registration: load from sessionStorage
            try {
                const saved = sessionStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setForm((prev) => ({ ...prev, ...parsed }));
                    if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep);
                }
            } catch {
                // ignore
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, token]);

    // Persist to sessionStorage on form change
    const persist = useCallback((data: FormData, step: number) => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, currentStep: step }));
        } catch {
            // ignore
        }
    }, []);

    const updateForm = (updates: Partial<FormData>) => {
        setForm((prev) => {
            const next = { ...prev, ...updates };
            persist(next, currentStep);
            return next;
        });
    };

    const toggleCraft = (craft: string) => {
        const next = form.selectedCrafts.includes(craft)
            ? form.selectedCrafts.filter((c) => c !== craft)
            : [...form.selectedCrafts, craft];
        updateForm({ selectedCrafts: next });
    };

    const handleStateChange = (state: string) => {
        updateForm({ selectedState: state, selectedDistrict: '' });
    };

    // ─── AI Auto-Fill from image ───
    const handleAiAnalyze = async (imageUrl: string) => {
        if (!token || !imageUrl) return;
        setAiAnalyzing(true);
        try {
            const res = await fetch('/api/ai/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ imageUrl }),
            });
            if (res.ok) {
                const data = await res.json();
                setAiSuggestions(data);
                // Auto-fill materials if empty
                if (data.materials && data.materials.length > 0 && !form.materialsUsed) {
                    updateForm({ materialsUsed: data.materials.join(', ') });
                }
            }
        } catch (err) {
            console.error('AI analysis failed:', err);
        } finally {
            setAiAnalyzing(false);
        }
    };

    // ─── AI Bio Generate ───
    const handleGenerateBio = async () => {
        if (!token || !form.selectedCrafts.length) return;
        setGeneratingBio(true);
        try {
            const res = await fetch('/api/ai/generate-listing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    imageUrl: form.profileImage || '',
                    description: `Artisan specializing in ${form.selectedCrafts.join(', ')} with ${form.experienceYears || 'several'} years of experience.`,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.listing?.description) {
                    updateForm({ bio: data.listing.description });
                }
            }
        } catch (err) {
            console.error('Bio generation failed:', err);
        } finally {
            setGeneratingBio(false);
        }
    };

    // ─── Step Validation ───
    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 0: return form.selectedCrafts.length > 0 && form.experienceYears !== '';
            case 1: return form.selectedState !== '' && form.selectedDistrict !== '';
            case 2: return form.bio.trim().length > 0;
            case 3: return true; // all optional
            case 4: return true; // all toggles
            case 5: return true; // optional
            default: return true;
        }
    };

    const handleNext = () => {
        if (!isStepValid(currentStep)) {
            setError('Please fill in the required fields');
            return;
        }
        setError('');
        if (currentStep < STEPS.length - 1) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            persist(form, nextStep);
        } else {
            setShowPreview(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setError('');
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            persist(form, prevStep);
        }
    };

    // ─── Submit ───
    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        const location = form.selectedDistrict && form.selectedState
            ? `${form.village ? form.village + ', ' : ''}${form.selectedDistrict}, ${form.selectedState}`
            : form.village || '';

        const payload = {
            craftType: form.selectedCrafts.join(', '),
            craftSpecialization: form.craftSpecialization || null,
            materialsUsed: form.materialsUsed || null,
            techniquesUsed: form.techniquesUsed || null,
            location,
            state: form.selectedState,
            district: form.selectedDistrict,
            pincode: form.pincode || null,
            experienceYears: parseInt(form.experienceYears) || 0,
            bio: form.bio,
            profileImage: form.profileImage || null,
            productionCapacity: form.productionCapacity ? parseInt(form.productionCapacity) : null,
            workshopSize: form.workshopSize ? parseInt(form.workshopSize) : null,
            acceptsBulkOrders: form.acceptsBulkOrders,
            shipsDomestic: form.shipsDomestic,
            shipsInternational: form.shipsInternational,
            upiId: form.upiId || null,
            bankAccount: form.bankAccount || null,
            ifscCode: form.ifscCode || null,
        };

        try {
            const url = isEditMode ? '/api/artisan/profile' : '/api/artisan/create-profile';
            const method = isEditMode ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || (isEditMode ? 'Failed to update profile' : 'Failed to create profile'));
            }

            // Clear sessionStorage on success
            sessionStorage.removeItem(STORAGE_KEY);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setShowPreview(false);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-colors bg-white';

    // ─── Step Content Renderers ───
    const renderStep1 = () => (
        <div className="space-y-6">
            {/* Craft Types */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">What do you make?</h2>
                <p className="text-gray-500 text-sm mb-4">Choose one or more craft types that describe your work.</p>
                <div className="flex flex-wrap gap-2">
                    {CRAFT_TYPES.map((craft) => {
                        const isSelected = form.selectedCrafts.includes(craft);
                        return (
                            <button
                                key={craft}
                                onClick={() => toggleCraft(craft)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${isSelected
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                                    }`}
                            >
                                {isSelected && <span className="mr-1">✓</span>}
                                {craft}
                            </button>
                        );
                    })}
                </div>
                {form.selectedCrafts.length > 0 && (
                    <p className="mt-3 text-sm text-orange-600 font-medium">
                        {form.selectedCrafts.length} craft{form.selectedCrafts.length > 1 ? 's' : ''} selected
                    </p>
                )}
            </div>

            {/* Specialization */}
            <div>
                <Label className="text-gray-700 font-semibold block mb-2">Craft Specialization</Label>
                <input
                    value={form.craftSpecialization}
                    onChange={(e) => updateForm({ craftSpecialization: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Miniature Madhubani portraits on silk"
                />
            </div>

            {/* Materials & Techniques */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Label className="text-gray-700 font-semibold block mb-2">Materials Used</Label>
                    <input
                        value={form.materialsUsed}
                        onChange={(e) => updateForm({ materialsUsed: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Natural dyes, handmade paper"
                    />
                </div>
                <div>
                    <Label className="text-gray-700 font-semibold block mb-2">Techniques Used</Label>
                    <input
                        value={form.techniquesUsed}
                        onChange={(e) => updateForm({ techniquesUsed: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Hand-painting, block printing"
                    />
                </div>
            </div>

            {/* Experience */}
            <div>
                <Label className="text-gray-700 font-semibold block mb-2">Years of Experience *</Label>
                <Input
                    type="number"
                    value={form.experienceYears}
                    onChange={(e) => updateForm({ experienceYears: e.target.value })}
                    placeholder="e.g., 15"
                    className="rounded-xl h-12"
                    min="0"
                    max="80"
                />
            </div>

            {/* AI Auto-Fill */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-800">AI Auto-Fill</span>
                </div>
                <p className="text-xs text-orange-700 mb-3">Upload a craft image and AI will suggest materials, tags, and more.</p>
                <UploadWidget
                    onUpload={(url) => {
                        updateForm({ profileImage: url });
                        handleAiAnalyze(url);
                    }}
                    currentImage={form.profileImage}
                />
                {aiAnalyzing && (
                    <div className="flex items-center gap-2 mt-3 text-orange-600 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing your craft...
                    </div>
                )}
                {aiSuggestions && !aiAnalyzing && (
                    <div className="mt-3 bg-white rounded-xl p-3 border border-orange-100 space-y-2">
                        <p className="text-xs font-medium text-gray-500">AI Suggestions:</p>
                        {aiSuggestions.craftType && (
                            <p className="text-sm"><span className="font-medium text-gray-700">Detected craft:</span> {aiSuggestions.craftType}</p>
                        )}
                        {aiSuggestions.materials && (
                            <p className="text-sm"><span className="font-medium text-gray-700">Materials:</span> {aiSuggestions.materials.join(', ')}</p>
                        )}
                        {aiSuggestions.tags && (
                            <div className="flex flex-wrap gap-1">
                                {aiSuggestions.tags.map((t, i) => (
                                    <span key={i} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{t}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Where are you based?</h2>
                <p className="text-gray-500 text-sm mb-4">Help buyers discover artisans from your region.</p>
            </div>

            <div>
                <Label className="text-gray-700 font-semibold block mb-2">State *</Label>
                <Select value={form.selectedState} onValueChange={handleStateChange}>
                    <SelectTrigger className="rounded-xl h-12 bg-white">
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {INDIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {form.selectedState && (
                <div>
                    <Label className="text-gray-700 font-semibold block mb-2">District *</Label>
                    <Select value={form.selectedDistrict} onValueChange={(v) => updateForm({ selectedDistrict: v })}>
                        <SelectTrigger className="rounded-xl h-12 bg-white">
                            <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {(STATE_DISTRICTS[form.selectedState] || []).map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div>
                <Label className="text-gray-700 font-semibold block mb-2">Village / City</Label>
                <input
                    value={form.village}
                    onChange={(e) => updateForm({ village: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., Jaipur"
                />
            </div>

            <div>
                <Label className="text-gray-700 font-semibold block mb-2">Pincode</Label>
                <input
                    value={form.pincode}
                    onChange={(e) => updateForm({ pincode: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., 302001"
                    maxLength={6}
                />
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Show your craft</h2>
                <p className="text-gray-500 text-sm mb-4">Upload photos and tell your story.</p>
            </div>

            {/* Profile Image */}
            <div>
                <Label className="text-gray-700 font-semibold block mb-2">Profile / Craft Photo</Label>
                <UploadWidget onUpload={(url) => updateForm({ profileImage: url })} currentImage={form.profileImage} />
            </div>

            {/* Bio */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-gray-700 font-semibold">Tell us your story *</Label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowBioVoice(!showBioVoice)}
                            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${showBioVoice ? 'bg-orange-100 text-orange-700' : 'text-orange-600 hover:bg-orange-50'
                                }`}
                        >
                            <Mic className="h-3 w-3" />
                            {showBioVoice ? 'Hide' : 'Voice'}
                        </button>
                        <button
                            type="button"
                            onClick={handleGenerateBio}
                            disabled={generatingBio || form.selectedCrafts.length === 0}
                            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg text-purple-600 hover:bg-purple-50 disabled:opacity-50 transition-colors"
                        >
                            {generatingBio ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            AI Write
                        </button>
                    </div>
                </div>

                {showBioVoice && (
                    <div className="mb-3">
                        <VoiceInput
                            onTranscript={(text) => updateForm({ bio: form.bio ? form.bio + ' ' + text : text })}
                            placeholder="Speak about your craft journey..."
                        />
                    </div>
                )}

                <Textarea
                    value={form.bio}
                    onChange={(e) => updateForm({ bio: e.target.value })}
                    placeholder="Tell buyers about your craft, your journey, and what makes your work special..."
                    className="min-h-[120px] rounded-xl border-gray-200"
                />
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Business Capacity</h2>
                <p className="text-gray-500 text-sm mb-4">Help us understand your production scale. All fields are optional.</p>
            </div>

            <div>
                <Label className="text-gray-700 font-semibold block mb-2">Production Capacity (items/month)</Label>
                <Input
                    type="number"
                    value={form.productionCapacity}
                    onChange={(e) => updateForm({ productionCapacity: e.target.value })}
                    placeholder="e.g., 50"
                    className="rounded-xl h-12"
                    min="0"
                />
            </div>

            <div>
                <Label className="text-gray-700 font-semibold block mb-2">Workshop Size (sq ft)</Label>
                <Input
                    type="number"
                    value={form.workshopSize}
                    onChange={(e) => updateForm({ workshopSize: e.target.value })}
                    placeholder="e.g., 200"
                    className="rounded-xl h-12"
                    min="0"
                />
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-gray-900">Accept Bulk Orders</p>
                        <p className="text-sm text-gray-500">Can you fulfill large quantity orders?</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => updateForm({ acceptsBulkOrders: !form.acceptsBulkOrders })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${form.acceptsBulkOrders ? 'bg-orange-500' : 'bg-gray-300'}`}
                    >
                        <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${form.acceptsBulkOrders ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Shipping Preferences</h2>
                <p className="text-gray-500 text-sm mb-4">Where can you ship your crafts?</p>
            </div>

            <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Package className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Ships within India</p>
                                <p className="text-sm text-gray-500">Domestic shipping</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => updateForm({ shipsDomestic: !form.shipsDomestic })}
                            className={`relative w-12 h-7 rounded-full transition-colors ${form.shipsDomestic ? 'bg-orange-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${form.shipsDomestic ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Globe className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">International Shipping</p>
                                <p className="text-sm text-gray-500">Ship worldwide</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => updateForm({ shipsInternational: !form.shipsInternational })}
                            className={`relative w-12 h-7 rounded-full transition-colors ${form.shipsInternational ? 'bg-orange-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${form.shipsInternational ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep6 = () => (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Setup</h2>
                <p className="text-gray-500 text-sm mb-4">Optional for now, required before receiving payouts.</p>
            </div>

            <div>
                <Label className="text-gray-700 font-semibold block mb-2">UPI ID</Label>
                <input
                    value={form.upiId}
                    onChange={(e) => updateForm({ upiId: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., yourname@paytm"
                />
            </div>

            <div>
                <Label className="text-gray-700 font-semibold block mb-2">Bank Account Number</Label>
                <input
                    value={form.bankAccount}
                    onChange={(e) => updateForm({ bankAccount: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., 1234567890"
                />
            </div>

            <div>
                <Label className="text-gray-700 font-semibold block mb-2">IFSC Code</Label>
                <input
                    value={form.ifscCode}
                    onChange={(e) => updateForm({ ifscCode: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., SBIN0001234"
                />
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-700">
                    🔒 Your payment details are encrypted and stored securely. You can always update these later from your profile settings.
                </p>
            </div>
        </div>
    );

    const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];

    const location = form.selectedDistrict && form.selectedState
        ? `${form.village ? form.village + ', ' : ''}${form.selectedDistrict}, ${form.selectedState}`
        : form.village || '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/50">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Loading state for edit mode */}
                {profileLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-3" />
                        <p className="text-gray-500">Loading your profile...</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-4">
                                <span>✦</span> {isEditMode ? 'EDIT REGISTRATION' : 'ARTISAN REGISTRATION'}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{isEditMode ? 'Edit Your Profile' : 'Complete Your Profile'}</h1>
                            <p className="text-gray-500">Step {currentStep + 1} of {STEPS.length} — {STEPS[currentStep].label}</p>
                        </div>

                        {/* Stepper Progress Bar */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                {STEPS.map((step, i) => {
                                    const Icon = step.icon;
                                    const isActive = i === currentStep;
                                    const isComplete = i < currentStep;
                                    return (
                                        <div key={i} className="flex flex-col items-center flex-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (isComplete) {
                                                        setCurrentStep(i);
                                                        persist(form, i);
                                                    }
                                                }}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isComplete
                                                    ? 'bg-orange-500 text-white cursor-pointer hover:bg-orange-600'
                                                    : isActive
                                                        ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                                                        : 'bg-gray-100 text-gray-400'
                                                    }`}
                                            >
                                                {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                            </button>
                                            <span className={`text-xs mt-1.5 font-medium ${isActive || isComplete ? 'text-orange-600' : 'text-gray-400'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Progress bar */}
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                                    style={{ width: `${((currentStep) / (STEPS.length - 1)) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                            {stepRenderers[currentStep]()}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 mb-4">
                                {error}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <Button
                                    onClick={handleBack}
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl text-base gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </Button>
                            )}
                            <Button
                                onClick={handleNext}
                                className="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-2xl shadow-lg shadow-orange-200 gap-2"
                                disabled={!isStepValid(currentStep)}
                            >
                                {currentStep === STEPS.length - 1 ? (
                                    <>Review Profile <Check className="h-4 w-4" /></>
                                ) : (
                                    <>Continue <ChevronRight className="h-4 w-4" /></>
                                )}
                            </Button>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            By continuing, you agree to KarigarSetu&apos;s Terms of Service.
                        </p>

                        {/* ─── Preview Dialog ─── */}
                        {showPreview && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPreview(false)} />

                                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-3xl px-6 py-8 text-white">
                                        <h3 className="text-2xl font-bold mb-1">{isEditMode ? 'Profile Changes' : 'Profile Preview'}</h3>
                                        <p className="text-orange-100 text-sm">Review your details before {isEditMode ? 'saving changes' : 'creating your artisan profile'}.</p>
                                    </div>

                                    {/* Profile Image */}
                                    {form.profileImage && (
                                        <div className="px-6 -mt-6">
                                            <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                                                <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Details */}
                                    <div className="px-6 py-6 space-y-4">
                                        <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                                            <Briefcase className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Craft Types</span>
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {form.selectedCrafts.map((c) => (
                                                        <span key={c} className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">{c}</span>
                                                    ))}
                                                </div>
                                                {form.craftSpecialization && (
                                                    <p className="text-sm text-gray-600 mt-1">Specialization: {form.craftSpecialization}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                                            <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
                                            <div>
                                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Location</span>
                                                <p className="font-medium text-gray-900">{location || 'Not provided'}</p>
                                                {form.pincode && <p className="text-sm text-gray-500">PIN: {form.pincode}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                                            <Clock className="h-5 w-5 text-orange-500 shrink-0" />
                                            <div>
                                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Experience</span>
                                                <p className="font-medium text-gray-900">{form.experienceYears} years</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                                            <FileText className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Bio</span>
                                                <p className="text-gray-700 text-sm mt-1 leading-relaxed">{form.bio || 'Not provided'}</p>
                                            </div>
                                        </div>

                                        {(form.productionCapacity || form.acceptsBulkOrders) && (
                                            <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                                                <Factory className="h-5 w-5 text-orange-500 shrink-0" />
                                                <div>
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Business</span>
                                                    <p className="text-sm text-gray-700">
                                                        {form.productionCapacity && `${form.productionCapacity} items/month`}
                                                        {form.acceptsBulkOrders && ' • Accepts bulk orders'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                                            <Truck className="h-5 w-5 text-orange-500 shrink-0" />
                                            <div>
                                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Shipping</span>
                                                <div className="flex gap-2 mt-1">
                                                    {form.shipsDomestic && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">🇮🇳 India</span>}
                                                    {form.shipsInternational && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🌍 International</span>}
                                                </div>
                                            </div>
                                        </div>

                                        {(form.upiId || form.bankAccount) && (
                                            <div className="flex items-center gap-3 py-3">
                                                <CreditCard className="h-5 w-5 text-orange-500 shrink-0" />
                                                <div>
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Payment</span>
                                                    <p className="text-sm text-gray-700">
                                                        {form.upiId && `UPI: ${form.upiId}`}
                                                        {form.bankAccount && ` • Bank: ****${form.bankAccount.slice(-4)}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Error in dialog */}
                                    {error && (
                                        <div className="mx-6 mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="px-6 pb-6 flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowPreview(false)}
                                            className="flex-1 h-12 rounded-2xl text-base gap-2"
                                        >
                                            <Pencil className="h-4 w-4" /> Edit Details
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base rounded-2xl shadow-lg shadow-orange-200 gap-2"
                                        >
                                            {loading ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> {isEditMode ? 'Saving...' : 'Creating...'}</>
                                            ) : (
                                                <><Check className="h-4 w-4" /> {isEditMode ? 'Save Changes' : 'Complete Profile'}</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
