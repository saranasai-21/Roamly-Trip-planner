'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers } from 'lucide-react';

export interface MapMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  dayNumber?: number;
  type?: string;
  category?: string;
}

interface TripMapProps {
  markers: MapMarker[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (marker: MapMarker) => void;
  heightClass?: string;
}

export function TripMap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  heightClass = 'h-[360px]',
}: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Compute bounding box for fallback canvas/SVG view
  const validMarkers = markers.filter((m) => typeof m.lat === 'number' && typeof m.lng === 'number');

  const minLat = validMarkers.length ? Math.min(...validMarkers.map((m) => m.lat)) : -8.85;
  const maxLat = validMarkers.length ? Math.max(...validMarkers.map((m) => m.lat)) : -8.35;
  const minLng = validMarkers.length ? Math.min(...validMarkers.map((m) => m.lng)) : 115.0;
  const maxLng = validMarkers.length ? Math.max(...validMarkers.map((m) => m.lng)) : 115.4;

  const latSpan = Math.max(0.05, maxLat - minLat);
  const lngSpan = Math.max(0.05, maxLng - minLng);

  useEffect(() => {
    // Attempt dynamic MapLibre GL loading if WebGL is supported
    let mapInstance: any = null;

    const initMap = async () => {
      try {
        const isWebGLAvailable = () => {
          try {
            const canvas = document.createElement('canvas');
            return !!(
              window.WebGLRenderingContext &&
              (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
          } catch {
            return false;
          }
        };

        if (!isWebGLAvailable() || !mapContainer.current) {
          setUseFallback(true);
          return;
        }

        const maplibregl = (await import('maplibre-gl')).default;

        const tileStyle =
          process.env.NEXT_PUBLIC_MAPLIBRE_STYLE ||
          'https://demotiles.maplibre.org/style.json';

        const centerLng = (minLng + maxLng) / 2;
        const centerLat = (minLat + maxLat) / 2;

        mapInstance = new maplibregl.Map({
          container: mapContainer.current,
          style: tileStyle,
          center: [centerLng, centerLat],
          zoom: 10,
          attributionControl: false,
        });

        mapInstance.on('load', () => {
          setMapLoaded(true);

          // Add markers
          validMarkers.forEach((marker) => {
            const el = document.createElement('div');
            el.className =
              'w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform';
            el.innerText = marker.dayNumber ? `D${marker.dayNumber}` : '●';

            el.addEventListener('click', () => {
              if (onSelectMarker) onSelectMarker(marker);
            });

            new maplibregl.Marker({ element: el })
              .setLngLat([marker.lng, marker.lat])
              .setPopup(
                new maplibregl.Popup({ offset: 25 }).setHTML(
                  `<div class="p-2 font-sans"><p class="font-bold text-xs text-slate-900">${marker.title}</p><p class="text-[10px] text-slate-500">${marker.type || ''}</p></div>`
                )
              )
              .addTo(mapInstance);
          });
        });

        mapInstance.on('error', () => {
          setUseFallback(true);
        });
      } catch (e) {
        console.warn('MapLibre GL initialization skipped or unsupported in environment:', e);
        setUseFallback(true);
      }
    };

    initMap();

    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch {}
      }
    };
  }, [validMarkers.length]);

  // Project marker lat/lng to percentage in fallback map
  const getPositionPercent = (lat: number, lng: number) => {
    const x = ((lng - minLng) / lngSpan) * 80 + 10;
    // Invert Y because latitude increases upwards
    const y = ((maxLat - lat) / latSpan) * 75 + 12;
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner flex flex-col justify-between`}
    >
      {/* Real MapLibre Container (if supported) */}
      {!useFallback && (
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      )}

      {/* Fallback / Offline Vector Route Canvas */}
      {useFallback && (
        <div className="absolute inset-0 w-full h-full bg-[#f8fafc] overflow-hidden select-none">
          {/* Subtle topographical grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* SVG connecting route paths between sequential stops */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {validMarkers.length > 1 && (
              <polyline
                points={validMarkers
                  .map((m) => {
                    const pos = getPositionPercent(m.lat, m.lng);
                    return `${pos.x}%,${pos.y}%`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#9333ea"
                strokeWidth="2.5"
                strokeDasharray="6,4"
                className="opacity-70 animate-pulse"
              />
            )}
          </svg>

          {/* Marker Pins */}
          {validMarkers.map((marker, idx) => {
            const pos = getPositionPercent(marker.lat, marker.lng);
            const isSelected = selectedMarkerId === marker.id;

            return (
              <div
                key={marker.id || idx}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => onSelectMarker && onSelectMarker(marker)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group transition-all duration-200 ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold shadow-md border ${
                    isSelected
                      ? 'bg-purple-700 text-white border-purple-300 ring-4 ring-purple-300/40'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-purple-500'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    {marker.dayNumber || idx + 1}
                  </span>
                  <span className="max-w-[120px] truncate text-[11px] font-medium hidden sm:inline">
                    {marker.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Map Controls & Attribution */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-sm text-xs text-slate-700">
        <Navigation className="w-3.5 h-3.5 text-purple-600 animate-spin-slow" />
        <span className="font-semibold">{validMarkers.length} Locations</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-500 text-[11px]">
          {useFallback ? 'Interactive Vector Mode' : 'MapLibre Tile View'}
        </span>
      </div>

      <div className="absolute bottom-2 right-3 z-30 text-[10px] text-slate-500 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded border border-slate-200">
        MapLibre OpenStreetMap &copy; Roamly
      </div>
    </div>
  );
}
