import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Trash2,
  Settings,
  Eye,
  MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardMap, { MapMarker } from '@/components/DashboardMap';

export default function AdminMapExample() {
  const navigate = useNavigate();
  const [selectedBin, setSelectedBin] = useState<any>(null);

  // Admin-specific map data with more detailed information
  const adminMapMarkers: MapMarker[] = [
    
  ];

  const mapCenter = {
    lat: 28.6139,
    lng: 77.2090
  };

  const handleMarkerClick = (marker: MapMarker) => {
    // In a real app, you'd fetch detailed bin data
    const binData = {
      id: marker.id,
      name: marker.label,
      status: marker.type,
      info: marker.info,
      lastCollection: '2 days ago',
      assignedCollector: 'John Doe',
      totalScans: 156,
      revenue: '$45.20'
    };
    setSelectedBin(binData);
  };

  // Admin dashboard stats
  const dashboardStats = [
    {
      title: 'Total Bins',
      value: '0',
      change: '0',
      icon: Trash2,
      color: 'text-blue-600'
    },
    {
      title: 'Active Bins',
      value: '0',
      change: '0',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Urgent Attention',
      value: '0',
      change: '0',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Maintenance Due',
      value: '0',
      change: '0',
      icon: Clock,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Map Dashboard</h1>
            <p className="text-gray-600 text-sm">Real-time bin monitoring and management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Live View
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change} from last week</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Map Dashboard */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Map Section - Takes up 3/4 of the space */}
          <div className="xl:col-span-3">
            <DashboardMap
              center={mapCenter}
              zoom={13}
              markers={adminMapMarkers}
              height="h-[600px]"
              title="Live Bin Monitoring"
              onMarkerClick={handleMarkerClick}
              className="shadow-lg"
            />
          </div>

          {/* Sidebar - Control Panel */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  View Urgent Bins
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Assign Collectors
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Bin Settings
                </Button>
              </CardContent>
            </Card>

            {/* Priority Bins */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Priority Bins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                {adminMapMarkers
                  .filter(marker => marker.type === 'error' || marker.type === 'warning')
                  .map((bin, index) => (
                    <div
                      key={bin.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleMarkerClick(bin)}
                    >
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        bin.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {bin.label}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {bin.info}
                        </p>
                        <Badge 
                          variant={bin.type === 'error' ? 'destructive' : 'secondary'}
                          className="text-xs mt-1"
                        >
                          {bin.type === 'error' ? 'URGENT' : 'WARNING'}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Map Legend */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
              <CardHeader>
                <CardTitle className="text-sm">Status Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Active / Normal</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Warning / Maintenance</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Critical / Full</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bin Details Modal */}
        <Dialog open={!!selectedBin} onOpenChange={() => setSelectedBin(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                {selectedBin?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedBin && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Bin ID</p>
                    <p className="font-medium">{selectedBin.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <Badge variant={
                      selectedBin.status === 'success' ? 'default' :
                      selectedBin.status === 'warning' ? 'secondary' :
                      'destructive'
                    }>
                      {selectedBin.status === 'success' ? 'Active' :
                       selectedBin.status === 'warning' ? 'Warning' : 'Critical'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Collection</p>
                    <p className="font-medium">{selectedBin.lastCollection}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Assigned Collector</p>
                    <p className="font-medium">{selectedBin.assignedCollector}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Scans</p>
                    <p className="font-medium">{selectedBin.totalScans}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Revenue Generated</p>
                    <p className="font-medium text-green-600">{selectedBin.revenue}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Details</p>
                  <p className="text-sm mt-1">{selectedBin.info}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <Users className="w-4 h-4 mr-2" />
                    Assign Collector
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
