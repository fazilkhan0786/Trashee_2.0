import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Users, MapPin, Calendar, Activity, Eye, Edit, UserPlus, Search, Filter, Truck, Clock, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Collector {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'busy';
  zone: string;
  assignedBins: string[];
  totalCollections: number;
  joinedDate: string;
  lastActive: string;
  rating: number;
  avatar?: string;
}

interface Assignment {
  id: string;
  collectorId: string;
  binIds: string[];
  zone: string;
  status: 'pending' | 'active' | 'completed';
  assignedAt: string;
  scheduledFor: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

export default function CollectorAssignment() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);

  const [collectors, setCollectors] = useState<Collector[]>([
    
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    
  ]);

  const zones = ['All', 'Downtown', 'University Area', 'City Mall', 'Park Avenue', 'Tech District'];
  const availableBins = ['BIN010', 'BIN011', 'BIN012', 'BIN013', 'BIN014', 'BIN015'];

  const filteredCollectors = collectors.filter(collector => {
    const matchesSearch = collector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collector.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collector.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = filterZone === 'all' || collector.zone === filterZone;
    const matchesStatus = filterStatus === 'all' || collector.status === filterStatus;
    return matchesSearch && matchesZone && matchesStatus;
  });

  const handleAssignCollector = (collectorId: string, binIds: string[], priority: string) => {
    const newAssignment: Assignment = {
      id: `ASN${String(assignments.length + 1).padStart(3, '0')}`,
      collectorId,
      binIds,
      zone: collectors.find(c => c.id === collectorId)?.zone || '',
      status: 'pending',
      assignedAt: new Date().toISOString(),
      scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      priority: priority as any,
      estimatedTime: `${binIds.length} hours`
    };

    setAssignments([...assignments, newAssignment]);
    
    // Update collector's assigned bins
    setCollectors(collectors.map(collector => 
      collector.id === collectorId 
        ? { ...collector, assignedBins: [...collector.assignedBins, ...binIds], status: 'busy' }
        : collector
    ));
    
    setShowAssignDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'busy': return <Clock className="w-4 h-4" />;
      case 'inactive': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center justify-between">
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
              <h1 className="text-xl font-bold">Collector Assignment</h1>
              <p className="text-sm text-gray-500">Assign collectors to bins and manage collection routes</p>
            </div>
          </div>
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Assign Collector
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Collector to Bins</DialogTitle>
                <DialogDescription>
                  Select a collector and assign bins for collection
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Select Collector</Label>
                  <Select onValueChange={(value) => setSelectedCollector(collectors.find(c => c.id === value) || null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose collector" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectors.filter(c => c.status === 'active').map(collector => (
                        <SelectItem key={collector.id} value={collector.id}>
                          {collector.name} - {collector.zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Available Bins</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableBins.map(bin => (
                      <div key={bin} className="flex items-center space-x-2">
                        <input type="checkbox" id={bin} className="rounded" />
                        <Label htmlFor={bin} className="text-sm">{bin}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label>Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => selectedCollector && handleAssignCollector(selectedCollector.id, ['BIN010'], 'medium')}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{collectors.length}</p>
                  <p className="text-xs text-gray-600">Total Collectors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{collectors.filter(c => c.status === 'active').length}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{assignments.filter(a => a.status === 'pending').length}</p>
                  <p className="text-xs text-gray-600">Pending Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{collectors.reduce((sum, c) => sum + c.assignedBins.length, 0)}</p>
                  <p className="text-xs text-gray-600">Assigned Bins</p>
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
              placeholder="Search collectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterZone} onValueChange={setFilterZone}>
            <SelectTrigger className="w-40">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <SelectValue placeholder="Zone" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.slice(1).map(zone => (
                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Collectors List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCollectors.map((collector, index) => (
            <Card key={collector.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{collector.name}</h3>
                      <Badge className={getStatusColor(collector.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(collector.status)}
                          {collector.status.charAt(0).toUpperCase() + collector.status.slice(1)}
                        </div>
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        <span>{collector.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        <span>{collector.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{collector.zone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-3 h-3" />
                        <span>{collector.assignedBins.length} assigned bins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        <span>{collector.totalCollections} total collections</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Rating:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-semibold">{collector.rating}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log('Viewing collector details:', collector.id);
                            alert(`Collector Details:\n\nName: ${collector.name}\nEmail: ${collector.email}\nPhone: ${collector.phone}\nZone: ${collector.zone}\nStatus: ${collector.status}\nTotal Collections: ${collector.totalCollections}\nAssigned Bins: ${collector.assignedBins.length}\nRating: ${collector.rating}★\nJoined: ${collector.joinedDate}\nLast Active: ${collector.lastActive}`);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        {collector.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCollector(collector);
                              setShowAssignDialog(true);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current Assignments */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Current Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const collector = collectors.find(c => c.id === assignment.collectorId);
                return (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-gray-600" />
                      </div>
                      
                      <div>
                        <p className="font-medium">{collector?.name}</p>
                        <p className="text-sm text-gray-600">
                          {assignment.binIds.join(', ')} - {assignment.zone}
                        </p>
                        <p className="text-xs text-gray-500">
                          Scheduled: {new Date(assignment.scheduledFor).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(assignment.priority)}>
                        {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                      </Badge>
                      <Badge variant="outline">
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {filteredCollectors.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No collectors found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}