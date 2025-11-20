import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Search, MapPin, Navigation, Filter, Trash2, Clock, Users, Star, Store, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardMap, { MapMarker } from '@/components/DashboardMap';
import { getLocations, Location } from '@/lib/locationsService';

// Define a simple keyframe animation for list items (assumes you have CSS setup for this or can inline it)
// If you cannot use custom CSS animations, remove the 'animate-fadeInFromLeft/Right' classes.

export default function collectorMap() {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Header (Unified with Profile Page Theme: Blue/Cyan) */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Location Map</h1>
            <p className="text-blue-100 mt-1">Find nearby bins and partner shops</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search and Filters */}
        <Card className="bg-white rounded-3xl shadow-xl border border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-800">
              <Search className="w-5 h-5 text-blue-600" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, pincode, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl h-10 transition-all"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex items-center gap-2 w-full px-4 py-2 border-gray-200 rounded-xl text-gray-700 h-10 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 transition-colors">
                  <Filter className="w-4 h-4 text-blue-500" />
                  <SelectValue placeholder="Filter Type" />
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-lg shadow-lg border-gray-100">
                  <SelectItem value="all" className="px-3 py-2 hover:bg-blue-50">All Locations</SelectItem>
                  <SelectItem value="bins" className="px-3 py-2 hover:bg-blue-50">Trash Bins Only</SelectItem>
                  <SelectItem value="partners" className="px-3 py-2 hover:bg-blue-50">Partner Shops</SelectItem>
                  <SelectItem value="nearby" className="px-3 py-2 hover:bg-blue-50">Nearby (≤1km)</SelectItem>
                  <SelectItem value="active" className="px-3 py-2 hover:bg-blue-50">Active Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex items-center gap-2 w-full px-4 py-2 border-gray-200 rounded-xl text-gray-700 h-10 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 transition-colors">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-lg shadow-lg border-gray-100">
                  <SelectItem value="distance" className="px-3 py-2 hover:bg-blue-50">Distance</SelectItem>
                  <SelectItem value="activity" className="px-3 py-2 hover:bg-blue-50">Recent Activity</SelectItem>
                  <SelectItem value="fill-level" className="px-3 py-2 hover:bg-blue-50">Fill Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading and Error States */}
        {loading && (
          <Card className="flex flex-col items-center justify-center py-12 space-y-3 rounded-3xl shadow-xl bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-blue-700 font-medium">Loading locations...</p>
            <p className="text-blue-400 text-sm">Finding the nearest bins and partners</p>
          </Card>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl flex items-start gap-3 shadow-md">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
              <X className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="font-semibold">Error Loading Map Data</p>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3 text-red-700 border-red-300 hover:bg-red-100 transition-colors"
                onClick={() => window.location.reload()}
              >
                Retry Load
              </Button>
            </div>
          </div>
        )}

        {/* Map Section */}
        {!loading && !error && (
          <Card className="rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Navigation className='w-5 h-5 text-blue-600' /> Interactive View
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DashboardMap
                center={mapCenter}
                zoom={13}
                markers={mapMarkers}
                height="h-80"
                onMarkerClick={handleMarkerClick}
                className="w-full"
              />
            </CardContent>
          </Card>
        )}

        {/* Locations List */}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <Card 
                  key={location.id} 
                  className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5`}
                  // Simplified animation classes for broader compatibility
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      
                      {/* Icon Indicator */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        location.type === 'bin' 
                          ? location.fill_level && location.fill_level > 80 
                            ? 'bg-rose-100' 
                            : location.fill_level && location.fill_level < 50
                            ? 'bg-emerald-100'
                            : 'bg-amber-100'
                          : 'bg-blue-100'
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
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{location.name}</h3>
                          <Badge variant={
                            location.status === 'active' ? 'default' : 
                            location.status === 'full' ? 'destructive' : 
                            location.status === 'maintenance' ? 'secondary' : 'outline'
                          } className="text-xs font-medium ml-2 capitalize whitespace-nowrap">
                            {location.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className='truncate'>{location.address}</span>
                        </div>
                        
                        {location.type === 'bin' && (
                          <div className="space-y-1 pt-1 border-t border-gray-100 mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 flex items-center gap-1"><Users className="w-3 h-3"/> Last by:</span>
                              <span className="font-medium text-gray-700">{location.last_scanned_by || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3"/> Last Scan:</span>
                              <span className="font-medium text-gray-700">{location.last_scanned || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Fill Level:</span>
                              <div className="flex items-center gap-2 w-1/2">
                                <div className="w-full h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className={`h-full rounded-full ${
                                      location.fill_level! < 50 ? 'bg-emerald-500' :
                                      location.fill_level! < 80 ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${location.fill_level}%` }}
                                  ></div>
                                </div>
                                <span className={`font-bold text-sm ${getFillLevelColor(location.fill_level)}`}>
                                  {location.fill_level}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {location.type === 'partner' && location.rating && (
                           <div className="flex justify-between items-center text-sm pt-1 border-t border-gray-100 mt-2">
                              <span className='text-gray-600'>Rating:</span>
                              <div className="flex items-center gap-1 text-yellow-600 font-bold">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                {location.rating}
                              </div>
                           </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-12 rounded-3xl shadow-lg border-gray-100">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No locations found matching your criteria</p>
                <Button 
                  variant="default" 
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all transform hover:scale-[1.02]"
                  onClick={() => { setSearchQuery(''); setFilterType('all'); }}
                >
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Location Details Modal */}
      {selectedLocation && (
        <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DialogContent className='max-w-lg rounded-3xl shadow-2xl border-0'>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl text-gray-800">
                {selectedLocation.type === 'bin' ? (
                  <Trash2 className="w-5 h-5 text-cyan-600" />
                ) : (
                  <Store className="w-5 h-5 text-blue-600" />
                )}
                {selectedLocation.name}
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                {selectedLocation.type === 'bin' ? 'Smart Trash Bin Details' : 'Partner Shop Details'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm border-b pb-3 border-gray-100">
                <div>
                  <span className="text-gray-500 block">Address:</span>
                  <p className="font-medium text-gray-800">{selectedLocation.address}</p>
                </div>
                <div>
                  <span className="text-gray-500 block">Pincode:</span>
                  <p className="font-medium text-gray-800">{selectedLocation.pincode}</p>
                </div>
                <div>
                  <span className="text-gray-500 block">Distance:</span>
                  <p className="font-medium text-gray-800">{selectedLocation.distance}</p>
                </div>
                <div>
                  <span className="text-gray-500 block">Status:</span>
                  <Badge variant={selectedLocation.status === 'active' ? 'default' : 'destructive'} className="text-xs capitalize bg-blue-100 text-blue-800 border-blue-200">
                    {selectedLocation.status}
                  </Badge>
                </div>
              </div>
              
              {selectedLocation.type === 'bin' && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Fill Level:</span>
                    <span className={`font-bold text-lg ${getFillLevelColor(selectedLocation.fill_level)}`}>
                      {selectedLocation.fill_level}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        selectedLocation.fill_level! < 50 ? 'bg-emerald-500' :
                        selectedLocation.fill_level! < 80 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${selectedLocation.fill_level}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-3 border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{selectedLocation.last_scanned_by || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{selectedLocation.last_scanned || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedLocation.type === 'partner' && selectedLocation.rating && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shop Rating:</span>
                    <div className="flex items-center gap-1 text-lg font-bold text-yellow-700">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {selectedLocation.rating}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className='pt-4'>
              <Button variant="outline" onClick={() => setSelectedLocation(null)} className="border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
                Close
              </Button>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg transition-all transform hover:scale-[1.02]">
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