'use client';

import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix default leaflet marker icons (webpack/Next.js issue)
const fixLeafletIcons = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
};

// Custom orange marker for craft origin
const craftMarker = (_lat: number, _lon: number) => {
    if (typeof window === 'undefined') return null;
    return L.divIcon({
        html: `
      <div style="
        background: linear-gradient(135deg, #f97316, #ea580c);
        width: 36px; height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(249,115,22,0.5);
      "></div>
    `,
        className: '',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
    });
};

interface LeafletMapInnerProps {
    lat: number;
    lon: number;
    location: string;
}

export default function LeafletMapInner({ lat, lon, location }: LeafletMapInnerProps) {
    useEffect(() => {
        fixLeafletIcons();
    }, []);

    const marker = craftMarker(lat, lon);

    return (
        <MapContainer
            center={[lat, lon]}
            zoom={9}
            scrollWheelZoom={false}
            zoomControl={false}
            style={{ height: '280px', width: '100%', borderRadius: '16px' }}
            className="z-0"
        >
            <ZoomControl position="topright" />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {marker && (
                <Marker position={[lat, lon]} icon={marker}>
                    <Popup>
                        <div className="text-center py-1">
                            <p className="font-bold text-gray-900 text-sm">📍 Craft Origin</p>
                            <p className="text-orange-600 text-xs mt-0.5">{location}</p>
                        </div>
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
