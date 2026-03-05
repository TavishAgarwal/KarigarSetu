import { Clock, Users, Landmark, Heart } from 'lucide-react';

interface ArtisanImpactCardProps {
    laborDays: number;
    familiesSupported: number;
    craftAge: number;
    impactSummary: string;
}

export default function ArtisanImpactCard({
    laborDays,
    familiesSupported,
    craftAge,
    impactSummary,
}: ArtisanImpactCardProps) {
    return (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-3xl p-8 border border-orange-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Heart className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Support the Artisan</h2>
                    <p className="text-sm text-gray-500">This purchase makes a real impact</p>
                </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Labor Days */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 text-center border border-orange-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{laborDays}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                        Day{laborDays > 1 ? 's' : ''} of Skilled Labor
                    </p>
                </div>

                {/* Families */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 text-center border border-orange-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-rose-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{familiesSupported}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">
                        Artisan {familiesSupported > 1 ? 'Families' : 'Family'}
                    </p>
                </div>

                {/* Heritage Age */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 text-center border border-orange-100 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Landmark className="h-6 w-6 text-amber-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{craftAge.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 mt-1 font-medium">Year Craft Tradition</p>
                </div>
            </div>

            {/* Impact Summary */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-orange-100">
                <p className="text-sm text-gray-700 leading-relaxed">{impactSummary}</p>
            </div>
        </div>
    );
}
