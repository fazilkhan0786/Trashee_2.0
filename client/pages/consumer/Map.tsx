import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Search, MapPin, Navigation, Filter, Trash2, Clock, Users, Star, Store, X } from 'lucide-react'; // ✅ Added X import
import { useNavigate } from 'react-router-dom';
import DashboardMap, { MapMarker } from '@/components/DashboardMap';
import { getLocations, Location } from '@/lib/locationsService';

// Using the Location interface from locationsService
export default function ConsumerMap() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load locations from Supabase
  useEffect(() => {
    async function loadLocations() {
      try {
        setLoading(true);
        setError(null);
        
        const { success, data, error } = await getLocations();
        
        if (!success || error) {
          console.error('Error fetching locations:', error);
          setError('Failed to load locations. Please try again');
          return;
        }
        
        setLocations(data || []);
      } catch (err) {
        console.error('Unexpected error loading locations:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadLocations();
  }, []);

  // Convert locations to map markers
  const mapMarkers: MapMarker[] = locations
    .filter(location => {
      if (filterType === 'all') return true;
      if (filterType === 'bins') return location.type === 'bin';
      if (filterType === 'partners') return location.type === 'partner';
      return true;
    })
    .filter(location => {
      if (!searchQuery) return true;
      return location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             location.address.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .map(location => ({
      id: location.id,
      lat: location.latitude || 28.6139 + (Math.random() - 0.5) * 0.02, // Use actual coordinates or random around Ahmedabad
      lng: location.longitude || 77.2090 + (Math.random() - 0.5) * 0.02,
      label: location.name,
      type: location.status === 'active' ? 'success' : 
            location.status === 'full' ? 'error' : 
            location.status === 'maintenance' ? 'warning' : 'default',
      info: location.type === 'bin' 
        ? `${location.fill_level || 0}% full • ${location.last_scanned || 'Never'} • ${location.distance}`
        : `${location.rating || 0}★ rating • ${location.distance} • Partner Store`
    }));

  const handleMarkerClick = (marker: MapMarker) => {
    const location = locations.find(loc => loc.id === marker.id);
    if (location) {
      setSelectedLocation(location);
    }
  };

  // Map center (Ahmedabad coordinates)
  const mapCenter = {
    lat: 23.0258,
    lng: 72.5873
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.pincode.includes(searchQuery);
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'bins' && location.type === 'bin') ||
                         (filterType === 'partners' && location.type === 'partner') ||
                         (filterType === 'nearby' && parseFloat(location.distance) <= 1.0) ||
                         (filterType === 'active' && location.status === 'active');
    return matchesSearch && matchesFilter;
  });

  const getFillLevelColor = (level?: number) => {
    if (!level) return '';
    if (level < 50) return 'text-emerald-600';
    if (level < 80) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-emerald-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-emerald-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-emerald-800">Trash Bin Map</h1>
            <p className="text-sm text-emerald-600/80">Find nearby bins and partner shops</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search and Filters */}
        <Card className="bg-white rounded-2xl shadow-md border border-emerald-100">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
              <Input
                placeholder="Search by pincode or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-lg"
              />
            </div>
            
            <div className="flex gap-3">
              {/* ✅ Removed className from Select component */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-500" />
                    <SelectValue placeholder="Filter" />
                  </div>
                  <div className="text-emerald-400">▼</div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all" className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50">
                    All Locations
                  </SelectItem>
                  <SelectItem value="bins" className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50">
                    Trash Bins Only
                  </SelectItem>
                  <SelectItem value="partners" className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50">
                    Partner Shops
                  </SelectItem>
                  <SelectItem value="nearby" className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50">
                    Nearby (≤1km)
                  </SelectItem>
                  <SelectItem value="active" className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50">
                    Active Only
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* ✅ Removed className from Select component */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <SelectValue placeholder="Sort by" />
                  <div className="text-emerald-400">▼</div>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="distance" className="px-3 py-2 hover:bg-emerald-50">
                    Distance
                  </SelectItem>
                  <SelectItem value="activity" className="px-3 py-2 hover:bg-emerald-50">
                    Recent Activity
                  </SelectItem>
                  <SelectItem value="fill-level" className="px-3 py-2 hover:bg-emerald-50">
                    Fill Level
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            <p className="text-emerald-700 font-medium">Loading locations...</p>
            <p className="text-emerald-400 text-sm">Finding the nearest bins and partners</p>
          </div>
        )}
        
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-md flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
              {/* ✅ Now X is imported and will work */}
              <X className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <p>{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-rose-700 border-rose-200 hover:bg-rose-50"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Map Section */}
        {!loading && !error && (
          <div className="rounded-2xl shadow-xl overflow-hidden border border-emerald-100">
            <DashboardMap
              center={mapCenter}
              zoom={13}
              markers={mapMarkers}
              height="h-80"
              title="Interactive Map"
              onMarkerClick={handleMarkerClick}
              className="w-full"
            />
          </div>
        )}

        {/* Locations List */}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <Card 
                  key={location.id} 
                  className={`bg-white rounded-2xl shadow-md border border-emerald-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 ${
                    index % 2 === 0 
                      ? 'animate-fadeInFromLeft' 
                      : 'animate-fadeInFromRight'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        location.type === 'bin' 
                          ? location.fill_level && location.fill_level > 80 
                            ? 'bg-rose-50' 
                            : location.fill_level && location.fill_level < 50
                            ? 'bg-emerald-50'
                            : 'bg-amber-50'
                          : 'bg-blue-50'
                      }`}>
                        {location.type === 'bin' ? (
                          <Trash2 className={`w-6 h-6 ${
                            location.fill_level && location.fill_level > 80 ? 'text-rose-600' : 
                            location.fill_level && location.fill_level < 50 ? 'text-emerald-600' : 'text-amber-600'
                          }`} />
                        ) : (
                          <Store className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{location.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{location.address}</span>
                            </div>
                            <p className="text-xs text-gray-400">PIN: {location.pincode}</p>
                          </div>
                          
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs mb-1 bg-gray-50 border border-gray-200 text-gray-700">
                              {location.distance}
                            </Badge>
                            {location.type === 'partner' && location.rating && (
                              <div className="flex items-center gap-1 text-xs">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-yellow-700">{location.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {location.type === 'bin' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Fill Level:</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className={`h-full rounded-full ${
                                      location.fill_level! < 50 ? 'bg-emerald-500' :
                                      location.fill_level! < 80 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${location.fill_level}%` }}
                                  ></div>
                                </div>
                                <span className={`font-medium ${getFillLevelColor(location.fill_level)}`}>
                                  {location.fill_level}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Last Scanned:</span>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-700">{location.last_scanned_by}</span>
                                <span className="text-gray-400">•</span>
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-gray-700">{location.last_scanned}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {location.type === 'partner' && location.rating && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Shop Rating:</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-yellow-700">{location.rating}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-3">
                          <Badge variant={
                            location.status === 'active' ? 'default' : 
                            location.status === 'full' ? 'destructive' : 
                            location.status === 'maintenance' ? 'secondary' : 'outline'
                          } className="text-sm capitalize">
                            {location.status}
                          </Badge>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedLocation(location)}
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 transition-colors"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No locations found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                <Button 
                  variant="default" 
                  className="mt-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:opacity-90 transition-all"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Details Modal - RESTORED FROM ORIGINAL CODE */}
      {selectedLocation && (
        <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLocation.type === 'bin' ? (
                  <Trash2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Store className="w-5 h-5 text-blue-600" />
                )}
                {selectedLocation.name}
              </DialogTitle>
              <DialogDescription>
                {selectedLocation.type === 'bin' ? 'Smart Trash Bin Details' : 'Partner Shop Details'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium">{selectedLocation.address}</p>
                </div>
                <div>
                  <span className="text-gray-600">Pincode:</span>
                  <p className="font-medium">{selectedLocation.pincode}</p>
                </div>
                <div>
                  <span className="text-gray-600">Distance:</span>
                  <p className="font-medium">{selectedLocation.distance}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={selectedLocation.status === 'active' ? 'default' : 'destructive'}>
                    {selectedLocation.status}
                  </Badge>
                </div>
              </div>
              
              {selectedLocation.type === 'bin' && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Fill Level:</span>
                    <span className={`font-bold ${getFillLevelColor(selectedLocation.fill_level)}`}>
                      {selectedLocation.fill_level}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        selectedLocation.fill_level! < 50 ? 'bg-emerald-500' :
                        selectedLocation.fill_level! < 80 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${selectedLocation.fill_level}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Last scanned by: {selectedLocation.last_scanned_by}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{selectedLocation.last_scanned}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedLocation.type === 'partner' && selectedLocation.rating && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shop Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{selectedLocation.rating}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLocation(null)}>
                Close
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Navigation className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}