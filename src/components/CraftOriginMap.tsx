'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

// Conditionally load Google Maps or Leaflet based on API key availability
const isGoogleMapsAvailable = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const LeafletMapInner = dynamic(() => import('./LeafletMapInner'), {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
});

const GoogleMapInner = dynamic(() => import('./GoogleMapInner'), {
    ssr: false,
    loading: () => <MapLoadingPlaceholder />,
});

function MapLoadingPlaceholder() {
    return (
        <div className="h-[280px] w-full rounded-2xl bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading map…</p>
            </div>
        </div>
    );
}

interface CraftOriginMapProps {
    location: string;
    state?: string;
    district?: string;
    latitude: number;
    longitude: number;
    craftType?: string;
}

export default function CraftOriginMap({
    location,
    state,
    district,
    latitude,
    longitude,
    craftType,
}: CraftOriginMapProps) {
    const displayLocation = [district, state || location].filter(Boolean).join(', ') || location;

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Craft Origin</h2>
                    <p className="text-sm text-gray-500">Where this craft tradition was born</p>
                </div>
            </div>

            {/* Location label */}
            <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-green-200 text-sm font-medium text-gray-700 shadow-sm">
                    <span className="text-base">📍</span>
                    {displayLocation}
                </span>
            </div>

            {/* Map — Google Maps if available, otherwise Leaflet */}
            <div className="rounded-2xl overflow-hidden shadow-sm border border-green-100">
                {isGoogleMapsAvailable ? (
                    <GoogleMapInner
                        lat={latitude}
                        lon={longitude}
                        location={displayLocation}
                    />
                ) : (
                    <LeafletMapInner
                        lat={latitude}
                        lon={longitude}
                        location={displayLocation}
                    />
                )}
            </div>

            {/* Legend / caption */}
            {craftType && (
                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                    <span className="font-medium text-green-700">{displayLocation}</span> is the traditional heartland of{' '}
                    <span className="font-medium">{craftType}</span> craftsmanship, where generations of artisan families have
                    honed and preserved this art form.
                </p>
            )}
        </div>
    );
}
