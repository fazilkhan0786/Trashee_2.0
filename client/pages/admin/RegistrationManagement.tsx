import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Store, Truck, Search, Filter, Eye, Check, X, Clock, Mail, Phone, MapPin, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PartnerRegistration {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  notes?: string;
}

interface CollectorRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  vehicleType: string;
  licenseNumber: string;
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: string[];
  notes?: string;
}

export default function RegistrationManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('partners');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);

  const [partnerRegistrations, setPartnerRegistrations] = useState<PartnerRegistration[]>([
    
  ]);

  const [collectorRegistrations, setCollectorRegistrations] = useState<CollectorRegistration[]>([
    
  ]);

  const filteredPartners = partnerRegistrations.filter(partner => {
    const matchesSearch = partner.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || partner.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredCollectors = collectorRegistrations.filter(collector => {
    const matchesSearch = collector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collector.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collector.vehicleType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || collector.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprovePartner = (id: string) => {
    setPartnerRegistrations(partnerRegistrations.map(partner => 
      partner.id === id ? { ...partner, status: 'approved' } : partner
    ));
  };

  const handleRejectPartner = (id: string) => {
    setPartnerRegistrations(partnerRegistrations.map(partner => 
      partner.id === id ? { ...partner, status: 'rejected' } : partner
    ));
  };

  const handleApproveCollector = (id: string) => {
    setCollectorRegistrations(collectorRegistrations.map(collector => 
      collector.id === id ? { ...collector, status: 'approved' } : collector
    ));
  };

  const handleRejectCollector = (id: string) => {
    setCollectorRegistrations(collectorRegistrations.map(collector => 
      collector.id === id ? { ...collector, status: 'rejected' } : collector
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
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
            <h1 className="text-xl font-bold">Registration Management</h1>
            <p className="text-sm text-gray-500">Review and approve partner and collector registrations</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{partnerRegistrations.length}</p>
                  <p className="text-xs text-gray-600">Partner Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{collectorRegistrations.length}</p>
                  <p className="text-xs text-gray-600">Collector Applications</p>
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
                  <p className="text-2xl font-bold">
                    {partnerRegistrations.filter(p => p.status === 'pending').length + 
                     collectorRegistrations.filter(c => c.status === 'pending').length}
                  </p>
                  <p className="text-xs text-gray-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {partnerRegistrations.filter(p => p.status === 'approved').length + 
                     collectorRegistrations.filter(c => c.status === 'approved').length}
                  </p>
                  <p className="text-xs text-gray-600">Approved Today</p>
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
              placeholder="Search registrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Registration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Partner Registrations
            </TabsTrigger>
            <TabsTrigger value="collectors" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Collector Registrations
            </TabsTrigger>
          </TabsList>

          {/* Partner Registrations */}
          <TabsContent value="partners" className="space-y-3">
            {filteredPartners.map((partner, index) => (
              <Card key={partner.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{partner.businessName}</h3>
                          <Badge className={getStatusColor(partner.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(partner.status)}
                              {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            <span>Owner: {partner.ownerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            <span>{partner.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            <span>{partner.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>{partner.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>Applied: {partner.registrationDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRegistration(partner);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      
                      {partner.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprovePartner(partner.id)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectPartner(partner.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Collector Registrations */}
          <TabsContent value="collectors" className="space-y-3">
            {filteredCollectors.map((collector, index) => (
              <Card key={collector.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-6 h-6 text-green-600" />
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
                            <Truck className="w-3 h-3" />
                            <span>Vehicle: {collector.vehicleType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            <span>License: {collector.licenseNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>Experience: {collector.experience}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRegistration(collector);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      
                      {collector.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveCollector(collector.id)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectCollector(collector.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {((activeTab === 'partners' && filteredPartners.length === 0) || 
          (activeTab === 'collectors' && filteredCollectors.length === 0)) && (
          <Card className="text-center py-12">
            <CardContent>
              {activeTab === 'partners' ? 
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" /> :
                <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              }
              <p className="text-gray-500 mb-2">No registrations found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Review complete registration information
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  'businessName' in selectedRegistration ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {'businessName' in selectedRegistration ? 
                    <Store className="w-6 h-6 text-blue-600" /> :
                    <Truck className="w-6 h-6 text-green-600" />
                  }
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {'businessName' in selectedRegistration ? selectedRegistration.businessName : selectedRegistration.name}
                  </h3>
                  <Badge className={getStatusColor(selectedRegistration.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedRegistration.status)}
                      {selectedRegistration.status.charAt(0).toUpperCase() + selectedRegistration.status.slice(1)}
                    </div>
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {'businessName' in selectedRegistration ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Business Name</label>
                      <p className="text-sm">{selectedRegistration.businessName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Owner Name</label>
                      <p className="text-sm">{selectedRegistration.ownerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Business Type</label>
                      <p className="text-sm">{selectedRegistration.businessType}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-sm">{selectedRegistration.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Vehicle Type</label>
                      <p className="text-sm">{selectedRegistration.vehicleType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">License Number</label>
                      <p className="text-sm">{selectedRegistration.licenseNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience</label>
                      <p className="text-sm">{selectedRegistration.experience}</p>
                    </div>
                  </>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm">{selectedRegistration.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-sm">{selectedRegistration.phone}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">Address</label>
                  <p className="text-sm">{selectedRegistration.address}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Documents Submitted</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRegistration.documents.map((doc: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {selectedRegistration.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedRegistration.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {selectedRegistration?.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if ('businessName' in selectedRegistration) {
                      handleApprovePartner(selectedRegistration.id);
                    } else {
                      handleApproveCollector(selectedRegistration.id);
                    }
                    setShowDetailsDialog(false);
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if ('businessName' in selectedRegistration) {
                      handleRejectPartner(selectedRegistration.id);
                    } else {
                      handleRejectCollector(selectedRegistration.id);
                    }
                    setShowDetailsDialog(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
