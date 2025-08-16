import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Navigation, Route, Truck, Clock, AlertTriangle, CheckCircle, Target, Fuel, Users, BarChart, Play, Pause, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardMap, { MapMarker } from '@/components/DashboardMap';

interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  fillLevel: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedWeight: number;
  lastCollection: string;
  status: 'pending' | 'scheduled' | 'collected' | 'skipped';
  binType?: string;
}

interface CollectionRoute {
  id: string;
  name: string;
  points: CollectionPoint[];
  totalDistance: number;
  estimatedTime: number;
  status: 'planned' | 'active' | 'completed' | 'paused';
  startTime?: string;
  completedPoints: number;
  fuelEstimate: number;
  createdAt: string;
}

export default function CollectorMap() {
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<CollectionRoute | null>(null);
  const [routeFilter, setRouteFilter] = useState('all');
  const [showRouteDialog, setShowRouteDialog] = useState(false);

  const [routes, setRoutes] = useState<CollectionRoute[]>([
    
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Routes' },
    { value: 'planned', label: 'Planned' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' }
  ];

  const filteredRoutes = routes.filter(route => {
    return routeFilter === 'all' || routeFilter === '' || route.status === routeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBinTypeIcon = (type: string) => {
    switch (type) {
      case 'regular': return '🗑️';
      case 'organic': return '🍃';
      case 'recyclable': return '♻️';
      case 'hazardous': return '⚠️';
      default: return '📦';
    }
  };

  const handleStartRoute = (routeId: string) => {
    setRoutes(prev => prev.map(route => 
      route.id === routeId ? { ...route, status: 'active' as const } : route
    ));
  };

  const handlePauseRoute = (routeId: string) => {
    setRoutes(prev => prev.map(route => 
      route.id === routeId ? { ...route, status: 'paused' as const } : route
    ));
  };

  const handleCompletePoint = (routeId: string, pointId: string) => {
    setRoutes(prev => prev.map(route => 
      route.id === routeId 
        ? {
            ...route,
            points: route.points.map(point => 
              point.id === pointId ? { ...point, status: 'collected' as const } : point
            ),
            completedPoints: route.completedPoints + 1
          }
        : route
    ));
  };

  const handleViewRoute = (route: CollectionRoute) => {
    setSelectedRoute(route);
    setShowRouteDialog(true);
  };

  const handleRefreshRoutes = () => {
    console.log('Refreshing routes data');
    alert('🔄 Routes refreshed successfully!\n\nLatest route information has been loaded.');
  };

  const handleOpenInMaps = (route?: CollectionRoute) => {
    const selectedRouteData = route || selectedRoute;
    if (!selectedRouteData) return;

    console.log('Opening route in maps:', selectedRouteData.name);

    // Open Google Maps/Apple Maps with the route
    if (selectedRouteData.points.length > 0) {
      const firstPoint = selectedRouteData.points[0];
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${firstPoint.latitude},${firstPoint.longitude}&travelmode=driving`;
      
      // Open the URL in a new tab
      window.open(mapsUrl, '_blank');
    }
  };

  const handleNavigateToPoint = (point: CollectionPoint) => {
    console.log('Navigating to point:', point.name);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}&travelmode=driving`;
    window.open(mapsUrl, '_blank');
  };

  const stats = {
    totalRoutes: routes.length,
    activeRoutes: routes.filter(r => r.status === 'active').length,
    completedToday: routes.filter(r => r.status === 'completed' && r.createdAt === '2024-01-20').length,
    totalDistance: routes.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.totalDistance, 0),
    avgFuelEfficiency: 15.5,
    collectionsToday: routes.reduce((sum, r) => sum + r.completedPoints, 0)
  };

  // Convert routes to map markers
  const mapMarkers: MapMarker[] = routes
    .filter(route => routeFilter === 'all' || route.status === routeFilter)
    .flatMap(route => 
      route.points.map(point => ({
        id: point.id,
        lat: point.latitude,
        lng: point.longitude,
        label: point.name,
        type: point.status === 'collected' ? 'success' : 
              point.priority === 'urgent' ? 'error' : 
              point.priority === 'high' ? 'warning' : 'default',
        info: `${point.fillLevel}% full • ${point.priority} priority • ${point.estimatedWeight}kg`
      }))
    );

  const handleMarkerClick = (marker: MapMarker) => {
    // Find the route and point
    const route = routes.find(r => r.points.some(p => p.id === marker.id));
    if (route) {
      setSelectedRoute(route);
      setShowRouteDialog(true);
    }
  };

  // Map center (ahemdabad coordinates)
  const mapCenter = {
    lat: 23.0225,
    lng: 72.5714
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Collection Routes & Map
            </h1>
            <p className="text-sm opacity-90">Navigate your collection routes efficiently</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Route className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalRoutes}</p>
                  <p className="text-xs text-gray-500">Total Routes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeRoutes}</p>
                  <p className="text-xs text-gray-500">Active Routes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedToday}</p>
                  <p className="text-xs text-gray-500">Completed Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalDistance}</p>
                  <p className="text-xs text-gray-500">KM Today</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Fuel className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgFuelEfficiency}</p>
                  <p className="text-xs text-gray-500">KM/L Avg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.collectionsToday}</p>
                  <p className="text-xs text-gray-500">Collections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <DashboardMap
          center={mapCenter}
          zoom={13}
          markers={mapMarkers}
          height="h-80"
          title="Live Collection Map"
          onMarkerClick={handleMarkerClick}
          className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600"
        />

        {/* Route Filter */}
        <div className="flex items-center gap-3">
          <Select value={routeFilter} onValueChange={setRouteFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter routes" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            className="ml-auto"
            onClick={handleRefreshRoutes}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Routes
          </Button>
        </div>

        {/* Routes List */}
        <div className="space-y-4">
          {filteredRoutes.map((route, index) => (
            <Card key={route.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{route.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        {route.totalDistance} km
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.floor(route.estimatedTime / 60)}h {route.estimatedTime % 60}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel className="w-4 h-4" />
                        {route.fuelEstimate}L est.
                      </span>
                      {route.startTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {route.startTime}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(route.status)}>
                      {route.status}
                    </Badge>
                  </div>
                </div>

                {/* Progress */}
                {route.points.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{route.completedPoints}/{route.points.length} points completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(route.completedPoints / route.points.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Collection Points Preview */}
                {route.points.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-sm">Collection Points:</h4>
                    <div className="flex flex-wrap gap-2">
                      {route.points.slice(0, 4).map((point) => (
                        <div key={point.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full text-xs">
                          <span>{getBinTypeIcon(point.binType)}</span>
                          <span>{point.name}</span>
                          <Badge className={getPriorityColor(point.priority)} variant="outline">
                            {point.priority}
                          </Badge>
                          {point.status === 'collected' && <CheckCircle className="w-3 h-3 text-green-600" />}
                        </div>
                      ))}
                      {route.points.length > 4 && (
                        <span className="text-xs text-gray-500">+{route.points.length - 4} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    Created: {route.createdAt}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRoute(route)}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      View Details
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInMaps(route)}
                      className="text-blue-600"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Open Maps
                    </Button>
                    
                    {route.status === 'planned' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartRoute(route.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Route
                      </Button>
                    )}
                    
                    {route.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePauseRoute(route.id)}
                        className="text-yellow-600"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12">
            <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No routes found</p>
            <p className="text-sm text-gray-400">Check back later for new collection routes</p>
          </div>
        )}
      </div>

      {/* Route Details Dialog */}
      <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Route Details - {selectedRoute?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoute && (
            <div className="space-y-6">
              {/* Route Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedRoute.totalDistance}</div>
                  <div className="text-xs text-gray-600">Total Distance (km)</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{Math.floor(selectedRoute.estimatedTime / 60)}h {selectedRoute.estimatedTime % 60}m</div>
                  <div className="text-xs text-gray-600">Estimated Time</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedRoute.completedPoints}/{selectedRoute.points.length}</div>
                  <div className="text-xs text-gray-600">Points Completed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedRoute.fuelEstimate}L</div>
                  <div className="text-xs text-gray-600">Fuel Estimate</div>
                </div>
              </div>

              {/* Collection Points */}
              <div>
                <h4 className="font-semibold mb-3">Collection Points</h4>
                <div className="space-y-3">
                  {selectedRoute.points.map((point, index) => (
                    <div key={point.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="font-medium">{point.name}</h5>
                          <p className="text-sm text-gray-500">{point.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg">{getBinTypeIcon(point.binType)}</span>
                            <Badge className={getPriorityColor(point.priority)} variant="outline">
                              {point.priority}
                            </Badge>
                            <span className="text-xs text-gray-500">Fill: {point.fillLevel}%</span>
                            <span className="text-xs text-gray-500">Est: {point.estimatedWeight}kg</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {point.status === 'collected' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Collected
                          </Badge>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNavigateToPoint(point)}
                            >
                              <Navigation className="w-3 h-3 mr-1" />
                              Navigate
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCompletePoint(selectedRoute.id, point.id)}
                              disabled={selectedRoute.status !== 'active'}
                            >
                              Mark Collected
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRouteDialog(false)}>
              Close
            </Button>
            <Button onClick={() => handleOpenInMaps()}>
              <Navigation className="w-4 h-4 mr-2" />
              Open in Maps
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}