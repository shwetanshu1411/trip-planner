import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Place } from '../types';

interface MapProps {
  places: Place[];
  center?: { lat: number; lng: number };
}

const Map: React.FC<MapProps> = ({ places, center }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'no-token'>('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    if (!token) {
      console.error('Mapbox token is missing. Please add VITE_MAPBOX_ACCESS_TOKEN to your secrets.');
      setStatus('no-token');
      return;
    }

    if (!mapContainer.current) return;

    mapboxgl.accessToken = token;

    try {
      const initialCenter: [number, number] = center 
        ? [center.lng, center.lat] 
        : (places.length > 0 ? [places[0].geo.lng, places[0].geo.lat] : [0, 0]);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: 12,
        attributionControl: false,
      });

      map.current.on('load', () => {
        setStatus('ready');
        // Force a resize after load to ensure it fills the container
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
          }
        }, 100);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox GL Error:', e);
        // Ignore style loading errors which are often transient
        if (e.error?.message?.includes('Style is not done loading')) return;
        setStatus('error');
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle container resizing
      const resizeObserver = new ResizeObserver(() => {
        if (map.current) {
          map.current.resize();
        }
      });
      resizeObserver.observe(mapContainer.current);

      return () => {
        resizeObserver.disconnect();
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (err) {
      console.error('Failed to initialize Mapbox:', err);
      setStatus('error');
    }
  }, [retryCount]);

  useEffect(() => {
    if (!map.current || status !== 'ready' || places.length === 0) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(m => m.remove());

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidPoints = false;

    places.forEach((place, index) => {
      if (!place.geo || typeof place.geo.lng !== 'number' || typeof place.geo.lat !== 'number') return;

      hasValidPoints = true;
      const el = document.createElement('div');
      el.className = 'w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform';
      el.innerHTML = `${index + 1}`;

      new mapboxgl.Marker(el)
        .setLngLat([place.geo.lng, place.geo.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-sm">${place.name}</h3>
                <p class="text-xs text-slate-500 mt-1">${place.category}</p>
              </div>
            `)
        )
        .addTo(map.current!);

      bounds.extend([place.geo.lng, place.geo.lat]);
    });

    if (hasValidPoints) {
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 1000 });
    }
  }, [places, status]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner">
      <div 
        ref={mapContainer} 
        className={`absolute inset-0 transition-opacity duration-500 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`} 
      />
      
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50/80 backdrop-blur-sm">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading map...</p>
        </div>
      )}

      {status === 'no-token' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Mapbox Token Required</h4>
          <p className="text-sm text-slate-500 max-w-[280px] mb-6">
            Please add your Mapbox Access Token to the <strong>Secrets</strong> panel as 
            <code className="mx-1 bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">VITE_MAPBOX_ACCESS_TOKEN</code>.
          </p>
          <Button variant="outline" size="sm" onClick={() => setRetryCount(prev => prev + 1)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-2">Map Failed to Load</h4>
          <p className="text-sm text-slate-500 max-w-[280px] mb-6">
            There was an issue initializing the map. This could be due to an invalid token or network restrictions.
          </p>
          <Button variant="outline" size="sm" onClick={() => setRetryCount(prev => prev + 1)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default Map;
