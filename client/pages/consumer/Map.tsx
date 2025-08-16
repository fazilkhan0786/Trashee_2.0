import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Search, MapPin, Navigation, Filter, Trash2, Clock, Users, Star, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardMap, { MapMarker } from '@/components/DashboardMap';

interface MapLocation {
  id: string;
  type: 'bin' | 'partner';
  name: string;
  address: string;
  pincode: string;
  fillLevel?: number;
  lastScanned?: string;
  lastScannedBy?: string;
  distance: string;
  status: 'active' | 'inactive' | 'full' | 'maintenance';
  rating?: number;
}

export default function ConsumerMap() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const locations: MapLocation[] = [
    
  ];

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
      lat: 28.6139 + (Math.random() - 0.5) * 0.02, // Random coordinates around Ahmedabad
      lng: 77.2090 + (Math.random() - 0.5) * 0.02,
      label: location.name,
      type: location.status === 'active' ? 'success' : 
            location.status === 'full' ? 'error' : 
            location.status === 'maintenance' ? 'warning' : 'default',
      info: location.type === 'bin' 
        ? `${location.fillLevel}% full • ${location.lastScanned} • ${location.distance}`
        : `${location.rating}★ rating • ${location.distance} • Partner Store`
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
    if (level < 50) return 'text-green-600';
    if (level < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Trash Bin Map</h1>
            <p className="text-sm text-gray-500">Find nearby bins and partner shops</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by pincode or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="bins">Trash Bins Only</SelectItem>
                  <SelectItem value="partners">Partner Shops</SelectItem>
                  <SelectItem value="nearby">Nearby (≤1km)</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="activity">Recent Activity</SelectItem>
                  <SelectItem value="fill-level">Fill Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Map Section */}
        <DashboardMap
          center={mapCenter}
          zoom={13}
          markers={mapMarkers}
          height="h-80"
          title="Interactive Map"
          onMarkerClick={handleMarkerClick}
          className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100"
        />

        {/* Locations List */}
        <div className="space-y-3">
          {filteredLocations.map((location, index) => (
            <Card 
              key={location.id} 
              className={`hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 2) * 100}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    location.type === 'bin' 
                      ? location.fillLevel && location.fillLevel > 80 
                        ? 'bg-red-100' 
                        : location.fillLevel && location.fillLevel < 50
                        ? 'bg-green-100'
                        : 'bg-yellow-100'
                      : 'bg-blue-100'
                  }`}>
                    {location.type === 'bin' ? (
                      <Trash2 className={`w-6 h-6 ${
                        location.fillLevel && location.fillLevel > 80 ? 'text-red-600' : 
                        location.fillLevel && location.fillLevel < 50 ? 'text-green-600' : 'text-yellow-600'
                      }`} />
                    ) : (
                      <Store className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{location.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{location.address}</span>
                        </div>
                        <p className="text-xs text-gray-400">PIN: {location.pincode}</p>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs mb-1">
                          {location.distance}
                        </Badge>
                        {location.type === 'partner' && location.rating && (
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{location.rating}</span>
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
                                  location.fillLevel! < 50 ? 'bg-green-500' :
                                  location.fillLevel! < 80 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${location.fillLevel}%` }}
                              ></div>
                            </div>
                            <span className={getFillLevelColor(location.fillLevel)}>
                              {location.fillLevel}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last Scanned:</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-500" />
                            <span>{location.lastScannedBy}</span>
                            <span className="text-gray-400">•</span>
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span>{location.lastScanned}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-3">
                      <Badge variant={
                        location.status === 'active' ? 'default' : 
                        location.status === 'full' ? 'destructive' : 
                        location.status === 'maintenance' ? 'secondary' : 'outline'
                      }>
                        {location.status}
                      </Badge>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedLocation(location)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No locations found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Location Details Modal */}
      {selectedLocation && (
        <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLocation.type === 'bin' ? (
                  <Trash2 className="w-5 h-5 text-green-600" />
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
                    <span className={`font-bold ${getFillLevelColor(selectedLocation.fillLevel)}`}>
                      {selectedLocation.fillLevel}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        selectedLocation.fillLevel! < 50 ? 'bg-green-500' :
                        selectedLocation.fillLevel! < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedLocation.fillLevel}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Last scanned by: {selectedLocation.lastScannedBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{selectedLocation.lastScanned}</span>
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
              <Button className="bg-primary hover:bg-primary/90">
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
