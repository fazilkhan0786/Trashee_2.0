import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Search, Filter, MapPin, Trash2, AlertTriangle, CheckCircle, Plus, Edit, Eye, Settings, Zap, Calendar, Users, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SmartBin {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  fillLevel: number;
  capacity: number;
  status: 'online' | 'offline' | 'maintenance' | 'full';
  batteryLevel: number;
  lastCollection: string;
  totalScans: number;
  qrCode: string;
  temperature: number;
  installDate: string;
  maintenanceSchedule: string;
  collector?: string;
}

export default function AdminBinManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [selectedBin, setSelectedBin] = useState<SmartBin | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [editingBin, setEditingBin] = useState<SmartBin | null>(null);
  const [binForm, setBinForm] = useState<Partial<SmartBin>>({});

  const [smartBins, setSmartBins] = useState<SmartBin[]>([
    
  ]);

  const locations = [{ value: 'all', label: 'All Locations' }, { value: 'Downtown Plaza', label: 'Downtown Plaza' }, { value: 'City Mall', label: 'City Mall' }, { value: 'Park Avenue', label: 'Park Avenue' }, { value: 'University Gate', label: 'University Gate' }];
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'full', label: 'Full' }
  ];

  const filteredBins = smartBins.filter(bin => {
    const matchesSearch = bin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bin.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusFilter === '' || bin.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || locationFilter === '' ||
                           bin.location.includes(locationFilter);
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'full': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFillLevelColor = (level: number) => {
    if (level >= 90) return 'bg-red-500';
    if (level >= 70) return 'bg-orange-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBatteryColor = (level: number) => {
    if (level <= 20) return 'text-red-600';
    if (level <= 50) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleViewDetails = (bin: SmartBin) => {
    setSelectedBin(bin);
    setShowDetailsDialog(true);
  };

  const handleScheduleMaintenance = (binId: string) => {
    setSmartBins(prev => prev.map(bin => 
      bin.id === binId ? { ...bin, status: 'maintenance' as const } : bin
    ));
  };

  const handleEditBin = (bin: SmartBin) => {
    setEditingBin(bin);
    setBinForm({
      name: bin.name,
      location: bin.location,
      latitude: bin.latitude,
      longitude: bin.longitude,
      capacity: bin.capacity,
      status: bin.status
    });
    setShowDetailsDialog(false);
    setShowEditDialog(true);
  };

  const handleUpdateBin = () => {
    if (!editingBin || !binForm.name || !binForm.location) return;

    const updatedBin: SmartBin = {
      ...editingBin,
      name: binForm.name,
      location: binForm.location,
      latitude: binForm.latitude || editingBin.latitude,
      longitude: binForm.longitude || editingBin.longitude,
      capacity: binForm.capacity || editingBin.capacity,
      status: binForm.status || editingBin.status
    };

    setSmartBins(prev => prev.map(bin =>
      bin.id === editingBin.id ? updatedBin : bin
    ));
    setShowEditDialog(false);
    setEditingBin(null);
    setBinForm({});
  };

  const handleViewMap = (bin: SmartBin) => {
    setSelectedBin(bin);
    setShowMapDialog(true);
  };

  const handleScheduleCollection = (binId: string) => {
    console.log('Scheduling collection for bin:', binId);
    alert('Collection scheduled successfully!');
  };

  const handleViewAnalytics = (binId: string) => {
    console.log('Viewing analytics for bin:', binId);
    alert('Analytics view coming soon!');
  };

  const handleAddBin = () => {
    const newBin: SmartBin = {
      id: `BIN-${String(smartBins.length + 1).padStart(3, '0')}`,
      name: 'New Smart Bin',
      location: 'New Location',
      latitude: 19.0760,
      longitude: 72.8777,
      fillLevel: 0,
      capacity: 100,
      status: 'online',
      batteryLevel: 100,
      lastCollection: new Date().toISOString().slice(0, 16).replace('T', ' '),
      totalScans: 0,
      qrCode: `TRASHEE_BIN_${String(smartBins.length + 1).padStart(3, '0')}`,
      temperature: 25,
      installDate: new Date().toISOString().split('T')[0],
      maintenanceSchedule: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    setSmartBins([...smartBins, newBin]);
    setShowAddDialog(false);
  };

  const stats = {
    totalBins: smartBins.length,
    onlineBins: smartBins.filter(b => b.status === 'online').length,
    fullBins: smartBins.filter(b => b.fillLevel >= 90).length,
    maintenanceBins: smartBins.filter(b => b.status === 'maintenance').length,
    averageFill: Math.round(smartBins.reduce((sum, b) => sum + b.fillLevel, 0) / smartBins.length),
    totalScans: smartBins.reduce((sum, b) => sum + b.totalScans, 0)
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
          <div className="flex-1">
            <h1 className="text-xl font-bold">Smart Bin Management</h1>
            <p className="text-sm text-gray-500">Monitor and manage smart bins across the city</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Bin
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalBins}</p>
                  <p className="text-xs text-gray-500">Total Bins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.onlineBins}</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.fullBins}</p>
                  <p className="text-xs text-gray-500">Full Bins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.maintenanceBins}</p>
                  <p className="text-xs text-gray-500">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageFill}%</p>
                  <p className="text-xs text-gray-500">Avg Fill</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Scans</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search bins by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location.value} value={location.value}>{location.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBins.map((bin, index) => (
            <Card key={bin.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{bin.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {bin.location}
                      </div>
                    </div>
                    <Badge className={getStatusColor(bin.status)}>
                      {bin.status}
                    </Badge>
                  </div>

                  {/* Fill Level */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Fill Level</span>
                      <span className="font-medium">{bin.fillLevel}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getFillLevelColor(bin.fillLevel)}`}
                        style={{ width: `${bin.fillLevel}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Battery</span>
                      <div className={`font-semibold ${getBatteryColor(bin.batteryLevel)}`}>
                        ⚡ {bin.batteryLevel}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Temp</span>
                      <div className="font-semibold">{bin.temperature}°C</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Scans</span>
                      <div className="font-semibold">{bin.totalScans}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Collection</span>
                      <div className="font-semibold">{bin.lastCollection.split(' ')[0]}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(bin)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBin(bin)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScheduleMaintenance(bin.id)}
                      disabled={bin.status === 'maintenance'}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Urgent Alerts */}
                  {bin.fillLevel >= 90 && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-red-700 font-medium">Urgent collection needed!</span>
                    </div>
                  )}
                  
                  {bin.batteryLevel <= 20 && (
                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-md">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span className="text-xs text-orange-700 font-medium">Low battery warning</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBins.length === 0 && (
          <div className="text-center py-12">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bins found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Bin Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Bin Details - {selectedBin?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBin && (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedBin.fillLevel}%</div>
                  <div className="text-xs text-gray-600">Fill Level</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold ${getBatteryColor(selectedBin.batteryLevel)}`}>{selectedBin.batteryLevel}%</div>
                  <div className="text-xs text-gray-600">Battery</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedBin.temperature}°C</div>
                  <div className="text-xs text-gray-600">Temperature</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedBin.totalScans}</div>
                  <div className="text-xs text-gray-600">Total Scans</div>
                </div>
              </div>

              {/* Bin Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bin ID:</span>
                      <span className="font-medium">{selectedBin.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge className={getStatusColor(selectedBin.status)}>
                        {selectedBin.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span className="font-medium">{selectedBin.capacity}L</span>
                    </div>
                    <div className="flex justify-between">
                      <span>QR Code:</span>
                      <span className="font-medium">{selectedBin.qrCode}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Location & Schedule</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium text-right">{selectedBin.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="font-medium">{selectedBin.latitude}, {selectedBin.longitude}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Collection:</span>
                      <span className="font-medium">{selectedBin.lastCollection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Maintenance:</span>
                      <span className="font-medium">{selectedBin.maintenanceSchedule}</span>
                    </div>
                    {selectedBin.collector && (
                      <div className="flex justify-between">
                        <span>Assigned Collector:</span>
                        <span className="font-medium">{selectedBin.collector}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="font-semibold mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedBin && handleViewMap(selectedBin)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    View Map
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedBin && handleScheduleCollection(selectedBin.id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Collection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedBin && handleScheduleMaintenance(selectedBin.id)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Maintenance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedBin && handleViewAnalytics(selectedBin.id)}
                  >
                    <BarChart className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button onClick={() => selectedBin && handleEditBin(selectedBin)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Bin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Smart Bin
            </DialogTitle>
            <DialogDescription>
              Configure a new smart bin for the network
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="binName">Bin Name</Label>
              <Input id="binName" placeholder="Enter bin name" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Enter location address" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" type="number" step="0.000001" placeholder="19.0760" />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" type="number" step="0.000001" placeholder="72.8777" />
              </div>
            </div>
            <div>
              <Label htmlFor="capacity">Capacity (Liters)</Label>
              <Input id="capacity" type="number" placeholder="100" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBin}>
              <Plus className="w-4 h-4 mr-2" />
              Add Bin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bin Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Smart Bin - {editingBin?.name}
            </DialogTitle>
            <DialogDescription>
              Update bin configuration and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="editBinName">Bin Name</Label>
              <Input
                id="editBinName"
                placeholder="Enter bin name"
                value={binForm.name || ''}
                onChange={(e) => setBinForm({...binForm, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="editLocation">Location</Label>
              <Input
                id="editLocation"
                placeholder="Enter location address"
                value={binForm.location || ''}
                onChange={(e) => setBinForm({...binForm, location: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="editLatitude">Latitude</Label>
                <Input
                  id="editLatitude"
                  type="number"
                  step="0.000001"
                  placeholder="19.0760"
                  value={binForm.latitude || ''}
                  onChange={(e) => setBinForm({...binForm, latitude: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="editLongitude">Longitude</Label>
                <Input
                  id="editLongitude"
                  type="number"
                  step="0.000001"
                  placeholder="72.8777"
                  value={binForm.longitude || ''}
                  onChange={(e) => setBinForm({...binForm, longitude: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="editCapacity">Capacity (Liters)</Label>
                <Input
                  id="editCapacity"
                  type="number"
                  placeholder="100"
                  value={binForm.capacity || ''}
                  onChange={(e) => setBinForm({...binForm, capacity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={binForm.status}
                  onValueChange={(value) => setBinForm({...binForm, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingBin(null);
              setBinForm({});
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBin}
              disabled={!binForm.name || !binForm.location}
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Bin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Map View Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Map View - {selectedBin?.name}
            </DialogTitle>
            <DialogDescription>
              Location and surrounding area view
            </DialogDescription>
          </DialogHeader>

          {selectedBin && (
            <div className="space-y-4">
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">{selectedBin.name}</p>
                  <p className="text-sm text-gray-500">{selectedBin.location}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Coordinates: {selectedBin.latitude}, {selectedBin.longitude}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Interactive map integration would be implemented here
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Distance from center:</span>
                  <p>2.3 km</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Nearest collector:</span>
                  <p>{selectedBin.collector || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Area coverage:</span>
                  <p>500m radius</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Traffic level:</span>
                  <p>High</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMapDialog(false)}>
              Close
            </Button>
            <Button>
              <MapPin className="w-4 h-4 mr-2" />
              Open in Maps
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
