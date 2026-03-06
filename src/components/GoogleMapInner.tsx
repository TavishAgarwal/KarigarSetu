'use client';

import { useEffect, useRef, useState } from 'react';

interface GoogleMapInnerProps {
    lat: number;
    lon: number;
    location: string;
    markers?: Array<{
        lat: number;
        lon: number;
        title: string;
        label?: string;
    }>;
    showHeatmap?: boolean;
    heatmapData?: Array<{ lat: number; lon: number; weight: number }>;
}

export default function GoogleMapInner({
    lat,
    lon,
    location,
    markers = [],
    showHeatmap = false,
    heatmapData = [],
}: GoogleMapInnerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            setError('Google Maps API key not configured');
            return;
        }

        let map: google.maps.Map;

        async function initMap() {
            try {
                const { Loader } = await import('@googlemaps/js-api-loader');

                const loader = new Loader({
                    apiKey: apiKey!,
                    version: 'weekly',
                    libraries: showHeatmap ? ['visualization', 'marker'] : ['marker'],
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (loader as any).importLibrary('maps');
                if (showHeatmap) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (loader as any).importLibrary('visualization');
                }

                if (!mapRef.current) return;

                map = new google.maps.Map(mapRef.current, {
                    center: { lat, lng: lon },
                    zoom: 9,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }],
                        },
                    ],
                });

                // Custom craft origin marker
                const mainMarker = new google.maps.Marker({
                    position: { lat, lng: lon },
                    map,
                    title: location,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#f97316',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3,
                        scale: 12,
                    },
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="text-align: center; padding: 4px 8px;">
                            <p style="font-weight: 700; color: #1f2937; font-size: 13px;">📍 Craft Origin</p>
                            <p style="color: #ea580c; font-size: 12px; margin-top: 2px;">${location}</p>
                        </div>
                    `,
                });

                mainMarker.addListener('click', () => {
                    infoWindow.open(map, mainMarker);
                });

                // Additional markers (artisan clusters)
                for (const m of markers) {
                    new google.maps.Marker({
                        position: { lat: m.lat, lng: m.lon },
                        map,
                        title: m.title,
                        label: m.label,
                    });
                }

                // Heatmap layer for demand visualization
                if (showHeatmap && heatmapData.length > 0) {
                    const heatmapPoints = heatmapData.map((point) => ({
                        location: new google.maps.LatLng(point.lat, point.lon),
                        weight: point.weight,
                    }));

                    new google.maps.visualization.HeatmapLayer({
                        data: heatmapPoints,
                        map,
                        radius: 30,
                        gradient: [
                            'rgba(0, 0, 0, 0)',
                            'rgba(249, 115, 22, 0.4)',
                            'rgba(249, 115, 22, 0.6)',
                            'rgba(234, 88, 12, 0.8)',
                            'rgba(220, 38, 38, 1)',
                        ],
                    });
                }

                setMapLoaded(true);
            } catch (err) {
                console.error('[GoogleMap] Failed to load:', err);
                setError('Failed to load Google Maps');
            }
        }

        initMap();

        return () => {
            // Cleanup if needed
        };
    }, [lat, lon, location, markers, showHeatmap, heatmapData]);

    if (error) {
        return (
            <div className="h-[280px] w-full rounded-2xl bg-gray-100 flex items-center justify-center">
                <p className="text-sm text-gray-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                ref={mapRef}
                style={{ height: '280px', width: '100%', borderRadius: '16px' }}
                className="z-0"
            />
            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Loading Google Maps…</p>
                    </div>
                </div>
            )}
        </div>
    );
}
