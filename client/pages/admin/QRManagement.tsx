import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, QrCode, Plus, Download, Upload, Search, Filter, MapPin, Calendar, Activity, Eye, Edit, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QRCodeData {
  id: string;
  name: string;
  type: 'bin' | 'partner' | 'event' | 'promotional';
  location?: string;
  partnerId?: string;
  status: 'active' | 'inactive' | 'expired';
  scans: number;
  createdAt: string;
  expiryDate?: string;
  qrData: string;
  lastScannedAt?: string;
  description?: string;
}

export default function QRManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);

  const [newQR, setNewQR] = useState<Partial<QRCodeData>>({
    type: 'bin',
    status: 'active'
  });

  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([
    
  ]);

  const filteredQRCodes = qrCodes.filter(qr => {
    const matchesSearch = qr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         qr.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         qr.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || qr.type === filterType;
    const matchesStatus = filterStatus === 'all' || qr.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateQR = () => {
    const qrId = `QR${String(qrCodes.length + 1).padStart(3, '0')}`;
    const newQRCode: QRCodeData = {
      id: qrId,
      name: newQR.name || '',
      type: newQR.type as any,
      location: newQR.location,
      partnerId: newQR.partnerId,
      status: newQR.status as any,
      scans: 0,
      createdAt: new Date().toISOString().split('T')[0],
      expiryDate: newQR.expiryDate,
      qrData: `TRASHEE_${newQR.type?.toUpperCase()}_${qrId}`,
      description: newQR.description
    };

    setQRCodes([...qrCodes, newQRCode]);
    setNewQR({ type: 'bin', status: 'active' });
    setShowCreateDialog(false);
  };

  const handleDeleteQR = (id: string) => {
    setQRCodes(qrCodes.filter(qr => qr.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setQRCodes(qrCodes.map(qr => 
      qr.id === id 
        ? { ...qr, status: qr.status === 'active' ? 'inactive' : 'active' }
        : qr
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bin': return 'bg-blue-100 text-blue-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      case 'event': return 'bg-orange-100 text-orange-800';
      case 'promotional': return 'bg-pink-100 text-pink-800';
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
              <h1 className="text-xl font-bold">QR Code Management</h1>
              <p className="text-sm text-gray-500">Create and manage QR codes for bins, partners, and events</p>
            </div>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Generate QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New QR Code</DialogTitle>
                <DialogDescription>
                  Generate a new QR code for bins, partners, or events
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qr-name">QR Code Name</Label>
                  <Input
                    id="qr-name"
                    placeholder="Enter QR code name"
                    value={newQR.name || ''}
                    onChange={(e) => setNewQR({ ...newQR, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="qr-type">Type</Label>
                  <Select value={newQR.type} onValueChange={(value) => setNewQR({ ...newQR, type: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bin">Smart Bin</SelectItem>
                      <SelectItem value="partner">Partner Store</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="qr-location">Location</Label>
                  <Input
                    id="qr-location"
                    placeholder="Enter location"
                    value={newQR.location || ''}
                    onChange={(e) => setNewQR({ ...newQR, location: e.target.value })}
                  />
                </div>
                
                {newQR.type === 'partner' && (
                  <div>
                    <Label htmlFor="partner-id">Partner ID</Label>
                    <Input
                      id="partner-id"
                      placeholder="Enter partner ID"
                      value={newQR.partnerId || ''}
                      onChange={(e) => setNewQR({ ...newQR, partnerId: e.target.value })}
                    />
                  </div>
                )}
                
                {(newQR.type === 'event' || newQR.type === 'promotional') && (
                  <div>
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input
                      id="expiry-date"
                      type="date"
                      value={newQR.expiryDate || ''}
                      onChange={(e) => setNewQR({ ...newQR, expiryDate: e.target.value })}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="qr-description">Description</Label>
                  <Input
                    id="qr-description"
                    placeholder="Enter description"
                    value={newQR.description || ''}
                    onChange={(e) => setNewQR({ ...newQR, description: e.target.value })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateQR}>
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
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
                  <QrCode className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{qrCodes.length}</p>
                  <p className="text-xs text-gray-600">Total QR Codes</p>
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
                  <p className="text-2xl font-bold">{qrCodes.filter(qr => qr.status === 'active').length}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{qrCodes.reduce((sum, qr) => sum + qr.scans, 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Total Scans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{qrCodes.filter(qr => qr.type === 'bin').length}</p>
                  <p className="text-xs text-gray-600">Bin QR Codes</p>
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
              placeholder="Search QR codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bin">Smart Bins</SelectItem>
              <SelectItem value="partner">Partners</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* QR Codes List */}
        <div className="space-y-3">
          {filteredQRCodes.map((qr, index) => (
            <Card key={qr.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{qr.name}</h3>
                        <Badge className={getTypeColor(qr.type)}>
                          {qr.type.charAt(0).toUpperCase() + qr.type.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(qr.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(qr.status)}
                            {qr.status.charAt(0).toUpperCase() + qr.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          {qr.id}
                        </span>
                        {qr.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {qr.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {qr.scans} scans
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created: {qr.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQR(qr);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(qr.id)}
                    >
                      {qr.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteQR(qr.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQRCodes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No QR codes found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* QR Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Details</DialogTitle>
            <DialogDescription>
              View QR code information and scanning statistics
            </DialogDescription>
          </DialogHeader>
          
          {selectedQR && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-gray-600" />
                </div>
                <h3 className="font-semibold text-lg">{selectedQR.name}</h3>
                <p className="text-sm text-gray-500">{selectedQR.id}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <Badge className={getTypeColor(selectedQR.type)}>
                    {selectedQR.type.charAt(0).toUpperCase() + selectedQR.type.slice(1)}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(selectedQR.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedQR.status)}
                      {selectedQR.status.charAt(0).toUpperCase() + selectedQR.status.slice(1)}
                    </div>
                  </Badge>
                </div>
                
                {selectedQR.location && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm">{selectedQR.location}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Scans:</span>
                  <span className="text-sm font-semibold">{selectedQR.scans}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm">{selectedQR.createdAt}</span>
                </div>
                
                {selectedQR.lastScannedAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Scanned:</span>
                    <span className="text-sm">{selectedQR.lastScannedAt}</span>
                  </div>
                )}
                
                {selectedQR.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expires:</span>
                    <span className="text-sm">{selectedQR.expiryDate}</span>
                  </div>
                )}
                
                {selectedQR.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="text-sm mt-1">{selectedQR.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
