import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Search, MapPin, Navigation, Filter, Trash2, Clock, Users, Star, Store, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardMap, { MapMarker } from '@/components/DashboardMap';
import { getLocations, Location } from '@/lib/locationsService';
import { supabase } from '@/lib/supabase'; // Restored original import

export default function PartnerMap() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- State and Handlers for "Add Shop" ---
  const [showAddShopDialog, setShowAddShopDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newShopData, setNewShopData] = useState({
    name: '',
    address: '',
    pincode: '',
    description: '',
  });

  // --- START: EXISTING "Add Shop" Logic ---
  const handleAddShop = async () => {
    if (!newShopData.name || !newShopData.address || !newShopData.pincode) {
      alert("Please fill in all required fields: Shop Name, Address, and Pincode.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to submit a shop request.");
      }

      const { error } = await supabase
        .from('shop_requests')
        .insert({
          partner_id: user.id,
          shop_name: newShopData.name,
          address: newShopData.address,
          pincode: newShopData.pincode,
          description: newShopData.description,
        });

      if (error) {
        throw error;
      }

      alert(`Shop "${newShopData.name}" has been submitted for verification!`);
      setShowAddShopDialog(false);
      setNewShopData({ name: '', address: '', pincode: '', description: '' }); // Clear form
    } catch (error: any) {
      console.error("Error adding new shop:", error);
      alert(`Failed to submit shop: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- END: EXISTING "Add Shop" Logic ---

  useEffect(() => {
    async function loadLocations() {
      try {
        setLoading(true);
        setError(null);
        const { success, data, error } = await getLocations();
        if (!success || error) {
          setError('Failed to load locations.');
          return;
        }
        setLocations(data || []);
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, []);

  const mapMarkers: MapMarker[] = locations
    .filter(location => {
      if (filterType === 'all') return true;
      if (filterType === 'bins') return location.type === 'bin';
      if (filterType === 'partners') return location.type === 'partner';
      return true;
    })
    .filter(location => location.name.toLowerCase().includes(searchQuery.toLowerCase()) || location.address.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(location => ({
      id: location.id,
      lat: location.latitude || 23.0258,
      lng: location.longitude || 72.5873,
      label: location.name,
      type: location.status === 'active' ? 'success' : 'default',
      info: location.type === 'bin' ? `${location.fill_level || 0}% full` : `${location.rating || 0}★ rating`
    }));

  const handleMarkerClick = (marker: MapMarker) => {
    const location = locations.find(loc => loc.id === marker.id);
    if (location) setSelectedLocation(location);
  };

  const mapCenter = { lat: 23.0258, lng: 72.5873 };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (location.pincode && location.pincode.includes(searchQuery));
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'bins' && location.type === 'bin') ||
                         (filterType === 'partners' && location.type === 'partner') ||
                         (filterType === 'nearby' && parseFloat(location.distance) <= 1.0) ||
                         (filterType === 'active' && location.status === 'active');
    return matchesSearch && matchesFilter;
  });

  const getFillLevelColor = (level?: number) => {
    if (level === undefined || level === null) return 'text-gray-500';
    if (level < 50) return 'text-green-600';
    if (level < 80) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getFillLevelBg = (level?: number) => {
    if (level === undefined || level === null) return 'bg-gray-200';
    if (level < 50) return 'bg-green-500';
    if (level < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pb-20 relative overflow-hidden">
      
      {/* Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header (Matching Partner Style) */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-4 shadow-xl relative z-10 animate-in slide-in-from-top duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2 text-white hover:bg-white/20 rounded-full transition">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Locations Map</h1>
              <p className="text-indigo-100 text-sm">Manage your shops and view nearby bins</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddShopDialog(true)}
            className="bg-white text-purple-700 hover:bg-indigo-50 shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Shop
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4 relative z-10">
        
        {/* Search and Filters Card (Glassy Effect) */}
        <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <Input
                placeholder="Search by pincode or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1 border-purple-200 focus:ring-purple-500">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-purple-500" />
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
                <SelectTrigger className="flex-1 border-purple-200 focus:ring-purple-500"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="activity">Recent Activity</SelectItem>
                  <SelectItem value="fill-level">Fill Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading && <div className="text-center py-8 text-purple-700 font-medium">Loading locations...</div>}
        {error && <div className="text-center py-8 text-red-600 font-medium bg-red-100 rounded-xl">{error}</div>}

        {/* Dashboard Map */}
        {!loading && !error && (
          <DashboardMap 
            center={mapCenter} 
            zoom={13} 
            markers={mapMarkers} 
            height="h-80" 
            title="Interactive Map" 
            onMarkerClick={handleMarkerClick} 
            className="rounded-xl border-2 border-purple-100 shadow-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100" 
          />
        )}

        {/* Location List */}
        {!loading && !error && (
          <div className="space-y-3">
            {filteredLocations.map((location, index) => (
              <Card 
                key={location.id} 
                className={`bg-white/90 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${Math.min(index * 100, 500)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${location.type === 'bin' ? (location.fill_level && location.fill_level > 80 ? 'bg-red-500/10' : 'bg-green-500/10') : 'bg-indigo-500/10'}`}>
                      {location.type === 'bin' 
                        ? <Trash2 className={`w-7 h-7 ${getFillLevelColor(location.fill_level)}`} /> 
                        : <Store className="w-7 h-7 text-indigo-600" />
                      }
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{location.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1"><MapPin className="w-3 h-3" /><span>{location.address}</span></div>
                          <p className="text-xs text-gray-400">PIN: {location.pincode}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <Badge className="text-xs mb-1 bg-purple-100 text-purple-700 border-purple-300">{location.distance}</Badge>
                          {location.type === 'partner' && location.rating && <div className="flex items-center gap-1 text-sm"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /><span>{location.rating}</span></div>}
                        </div>
                      </div>
                      
                      {location.type === 'bin' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Fill Level:</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full">
                                <div className={`h-full rounded-full transition-all ${getFillLevelBg(location.fill_level)}`} style={{ width: `${location.fill_level}%` }}></div>
                              </div>
                              <span className={getFillLevelColor(location.fill_level)}>{location.fill_level}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500"><span className="text-gray-600">Last Scanned:</span><div className="flex items-center gap-2"><Users className="w-3 h-3" /><span>{location.last_scanned_by}</span><Clock className="w-3 h-3" /><span>{location.last_scanned}</span></div></div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <Badge variant={location.status === 'active' ? 'default' : 'destructive'} className={location.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>{location.status}</Badge>
                        <Button size="sm" variant="outline" onClick={() => setSelectedLocation(location)} className="text-purple-600 border-purple-200 hover:bg-purple-50">View Details</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredLocations.length === 0 && <div className="text-center py-12 text-gray-500 bg-white/70 rounded-xl shadow-lg">No locations found matching the criteria.</div>}
          </div>
        )}
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DialogContent className="max-w-md rounded-xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-purple-700">
                {selectedLocation.type === 'bin' ? <Trash2 /> : <Store />}
                {selectedLocation.name}
              </DialogTitle>
              <DialogDescription>{selectedLocation.type === 'bin' ? 'Smart Trash Bin Details' : 'Partner Shop Details'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm p-3 bg-purple-50 rounded-lg">
                <div><span className="text-gray-600">Address:</span><p className="font-medium">{selectedLocation.address}</p></div>
                <div><span className="text-gray-600">Pincode:</span><p className="font-medium">{selectedLocation.pincode}</p></div>
                <div><span className="text-gray-600">Distance:</span><p className="font-medium">{selectedLocation.distance}</p></div>
                <div><span className="text-gray-600">Status:</span><Badge variant={selectedLocation.status === 'active' ? 'default' : 'destructive'} className={selectedLocation.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>{selectedLocation.status}</Badge></div>
              </div>
              {selectedLocation.type === 'bin' && (
                <div className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Fill Level:</span>
                    <span className={`font-bold ${getFillLevelColor(selectedLocation.fill_level)}`}>{selectedLocation.fill_level}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div className={`h-full rounded-full transition-all ${getFillLevelBg(selectedLocation.fill_level)}`} style={{ width: `${selectedLocation.fill_level}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <div className="flex items-center gap-1"><Users className="w-3 h-3" /><span>Last scanned by: {selectedLocation.last_scanned_by}</span></div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{selectedLocation.last_scanned}</span></div>
                  </div>
                </div>
              )}
              {selectedLocation.type === 'partner' && selectedLocation.rating && (
                <div className="p-3 bg-white border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shop Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold">{selectedLocation.rating}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLocation(null)} className="hover:border-purple-300">Close</Button>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md">
                <Navigation className="w-4 h-4 mr-2" />Get Directions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Shop Modal (Refined Style) */}
      <Dialog open={showAddShopDialog} onOpenChange={setShowAddShopDialog}>
        <DialogContent className="max-w-md rounded-xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-purple-700 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Add a New Shop
            </DialogTitle>
            <DialogDescription>
              Register a new shop location. It will be reviewed by an admin before appearing on the map.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shop-name">Shop Name *</Label>
              <Input id="shop-name" value={newShopData.name} onChange={(e) => setNewShopData(prev => ({ ...prev, name: e.target.value }))} className="focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-address">Address *</Label>
              <Textarea id="shop-address" value={newShopData.address} onChange={(e) => setNewShopData(prev => ({ ...prev, address: e.target.value }))} className="focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-pincode">Pincode *</Label>
              <Input id="shop-pincode" value={newShopData.pincode} onChange={(e) => setNewShopData(prev => ({ ...prev, pincode: e.target.value }))} className="focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shop-description">Description (Optional)</Label>
              <Textarea id="shop-description" value={newShopData.description} onChange={(e) => setNewShopData(prev => ({ ...prev, description: e.target.value }))} className="focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddShopDialog(false)} disabled={isSubmitting} className="hover:border-purple-300">Cancel</Button>
            <Button 
              onClick={handleAddShop} 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}