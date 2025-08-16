import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, MapPin, Navigation, Trash2, Clock, Users, Star, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardMap, { MapMarker } from '@/components/DashboardMap';

export default function MapExample() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('distance');

  // Example map configuration
  const mapCenter = {
    lat: 23.0258, // Ahmedabad coordinates
    lng: 72.5873
  };

  // Example markers data
  const mapMarkers: MapMarker[] = [
    
  ];

  const handleMarkerClick = (marker: MapMarker) => {
    console.log('Marker clicked:', marker);
    // Handle marker click - could open a modal, navigate, etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/consumer/home')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Map Integration Example</h1>
              <p className="text-gray-600 text-sm">Google Maps integrated into dashboard layout</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search Location</label>
                <Input
                  placeholder="Search bins, partners, areas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Filter Type</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="bins">Smart Bins Only</SelectItem>
                    <SelectItem value="partners">Partners Only</SelectItem>
                    <SelectItem value="available">Available Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Distance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="fill-level">Fill Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Map Section - This is where DashboardMap is integrated */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map takes up 2/3 of the space on large screens */}
          <div className="lg:col-span-2">
            <DashboardMap
              center={mapCenter}
              zoom={13}
              markers={mapMarkers}
              height="h-[500px]"
              title="Live Bin & Partner Locations"
              onMarkerClick={handleMarkerClick}
              className="shadow-lg"
            />
          </div>

          {/* Sidebar with location list */}
          <div className="space-y-4">
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Nearby Locations
                  <Badge variant="secondary" className="ml-auto">
                    {mapMarkers.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {mapMarkers.map((location, index) => (
                  <div
                    key={location.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleMarkerClick(location)}
                  >
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                      location.type === 'success' ? 'bg-green-500' :
                      location.type === 'warning' ? 'bg-yellow-500' :
                      location.type === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {location.label}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {location.info}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={
                            location.type === 'success' ? 'default' :
                            location.type === 'warning' ? 'secondary' :
                            location.type === 'error' ? 'destructive' :
                            'outline'
                          }
                          className="text-xs"
                        >
                          {location.id?.includes('BIN') ? 'Smart Bin' : 'Partner'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Map Legend */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader>
                <CardTitle className="text-sm">Map Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Available / Active</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Nearly Full / Warning</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Full / Needs Attention</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Partner Store</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Example: Compact Map without Card wrapper */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Compact Map Example (No Card Wrapper)</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <DashboardMap
              center={mapCenter}
              zoom={12}
              markers={mapMarkers.slice(0, 3)} // Show fewer markers
              height="h-64"
              showTitle={false} // Hide the card wrapper
              onMarkerClick={handleMarkerClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
