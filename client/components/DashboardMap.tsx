import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

// TypeScript interfaces for component props
export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  id?: string;
  type?: 'default' | 'success' | 'warning' | 'error';
  info?: string;
}

export interface DashboardMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers: MapMarker[];
  className?: string;
  height?: string;
  title?: string;
  showTitle?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const DashboardMap: React.FC<DashboardMapProps> = ({
  center,
  zoom,
  markers,
  className = '',
  height = 'h-96',
  title = 'Interactive Map',
  showTitle = true,
  onMarkerClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Script is already loading
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
      };
      
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your API key.');
      };

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    try {
      // Initialize the map
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: zoom,
        styles: [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [{ weight: '2.00' }]
          },
          {
            featureType: 'all',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#9c9c9c' }]
          },
          {
            featureType: 'all',
            elementType: 'labels.text',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [{ color: '#f2f2f2' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'landscape.man_made',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'poi',
            elementType: 'all',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'road',
            elementType: 'all',
            stylers: [{ saturation: -100 }, { lightness: 45 }]
          },
          {
            featureType: 'road',
            elementType: 'geometry.fill',
            stylers: [{ color: '#eeeeee' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#7b7b7b' }]
          },
          {
            featureType: 'road',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [{ visibility: 'simplified' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'all',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'water',
            elementType: 'all',
            stylers: [{ color: '#46bcec' }, { visibility: 'on' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{ color: '#c8d7d4' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#070707' }]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#ffffff' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative'
      });

      mapInstanceRef.current = map;
    } catch (err) {
      setError('Failed to initialize map');
      console.error('Map initialization error:', err);
    }
  }, [isLoaded, center, zoom]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const markerColor = getMarkerColor(markerData.type);
      
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapInstanceRef.current,
        title: markerData.label,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      // Add info window if info is provided
      if (markerData.info || markerData.label) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-sm">${markerData.label}</h3>
              ${markerData.info ? `<p class="text-xs text-gray-600 mt-1">${markerData.info}</p>` : ''}
            </div>
          `
        });

        marker.addListener('click', () => {
          // Close other info windows
          markersRef.current.forEach(m => {
            if (m.infoWindow) m.infoWindow.close();
          });
          
          infoWindow.open(mapInstanceRef.current, marker);
          
          // Call onMarkerClick callback if provided
          if (onMarkerClick) {
            onMarkerClick(markerData);
          }
        });

        marker.infoWindow = infoWindow;
      }

      markersRef.current.push(marker);
    });
  }, [markers, onMarkerClick]);

  const getMarkerColor = (type?: string): string => {
    switch (type) {
      case 'success':
        return '#10b981'; // green-500
      case 'warning':
        return '#f59e0b'; // amber-500
      case 'error':
        return '#ef4444'; // red-500
      default:
        return '#3b82f6'; // blue-500
    }
  };

  const renderLoadingState = () => (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
      <div className="text-center text-gray-600">
        <Navigation className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading Map...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
      <div className="text-center text-gray-600">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <p className="text-sm font-medium">Map Error</p>
        <p className="text-xs text-gray-500 mt-1">{error}</p>
        <Badge variant="destructive" className="mt-2 text-xs">
          Check API Key
        </Badge>
      </div>
    </div>
  );

  const MapContent = () => {
    if (error) return renderErrorState();
    if (!isLoaded) return renderLoadingState();
    
    return (
      <div 
        ref={mapRef} 
        className={`w-full ${height} rounded-lg overflow-hidden`}
        style={{ minHeight: '200px' }}
      />
    );
  };

  if (!showTitle) {
    return (
      <div className={`w-full ${className}`}>
        <MapContent />
      </div>
    );
  }

  return (
    <Card className={`w-full animate-in fade-in-50 slide-in-from-bottom-4 duration-700 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          {title}
          {markers.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {markers.length} {markers.length === 1 ? 'marker' : 'markers'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MapContent />
      </CardContent>
    </Card>
  );
};

export default DashboardMap;
