import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Search, Filter, FileText, CheckCircle, XCircle, Clock, User, Calendar, MapPin, Phone, Mail, Star, Eye, MessageCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Request {
  id: string;
  type: 'partner_registration' | 'collector_application' | 'bin_placement' | 'feature_request' | 'partnership' | 'data_export' | 'account_deletion' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedBy: {
    id: string;
    name: string;
    email: string;
    phone: string;
    userType: 'consumer' | 'partner' | 'collector' | 'external';
    organization?: string;
  };
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  lastUpdated: string;
  location?: string;
  attachments?: string[];
  adminNotes?: string;
  estimatedCompletion?: string;
  businessDetails?: {
    businessName?: string;
    businessType?: string;
    registrationNumber?: string;
    address?: string;
    website?: string;
  };
}

export default function AdminRequestManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const [requests, setRequests] = useState<Request[]>([
    
  ]);

  const requestTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'partner_registration', label: 'Partner Registration' },
    { value: 'collector_application', label: 'Collector Application' },
    { value: 'bin_placement', label: 'Bin Placement' },
    { value: 'feature_request', label: 'Feature Request' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'data_export', label: 'Data Export' },
    { value: 'account_deletion', label: 'Account Deletion' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || typeFilter === '' || request.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || statusFilter === '' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || priorityFilter === '' || request.priority === priorityFilter;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'partner_registration': return '🏪';
      case 'collector_application': return '🚛';
      case 'bin_placement': return '🗑️';
      case 'feature_request': return '💡';
      case 'partnership': return '🤝';
      case 'data_export': return '📊';
      case 'account_deletion': return '🗑️';
      default: return '📋';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'consumer': return '👤';
      case 'partner': return '🏪';
      case 'collector': return '🚛';
      case 'external': return '🌐';
      default: return '👤';
    }
  };

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    setShowDetailsDialog(true);
  };

  const handleUpdateStatus = (requestId: string, newStatus: string, notes?: string) => {
    setRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: newStatus as any, 
            reviewedBy: 'Current Admin',
            reviewedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
            lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' '),
            adminNotes: notes || request.adminNotes
          }
        : request
    ));
  };

  const handleSaveNotes = () => {
    if (!selectedRequest) return;
    
    setRequests(prev => prev.map(request => 
      request.id === selectedRequest.id 
        ? { 
            ...request, 
            adminNotes: adminNotes,
            lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
        : request
    ));
    
    setShowDetailsDialog(false);
  };

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    underReviewRequests: requests.filter(r => r.status === 'under_review').length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
    rejectedRequests: requests.filter(r => r.status === 'rejected').length,
    urgentRequests: requests.filter(r => r.priority === 'urgent').length
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
            <h1 className="text-xl font-bold">Request Management</h1>
            <p className="text-sm text-gray-500">Review and manage user requests and applications</p>
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
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalRequests}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.underReviewRequests}</p>
                  <p className="text-xs text-gray-500">Under Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.approvedRequests}</p>
                  <p className="text-xs text-gray-500">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.rejectedRequests}</p>
                  <p className="text-xs text-gray-500">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.urgentRequests}</p>
                  <p className="text-xs text-gray-500">Urgent</p>
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
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {requestTypes.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request, index) => (
            <Card key={request.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(request.type)}</span>
                      <div>
                        <h3 className="font-semibold">{request.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>ID: {request.id}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {request.submittedAt.split(' ')[0]}
                          </span>
                          {request.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {request.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{request.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getUserTypeIcon(request.submittedBy.userType)}</span>
                        <span className="font-medium">{request.submittedBy.name}</span>
                        {request.submittedBy.organization && (
                          <span className="text-gray-500">({request.submittedBy.organization})</span>
                        )}
                      </div>
                      {request.reviewedBy && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Reviewed by: {request.reviewedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                    
                    {request.estimatedCompletion && (
                      <div className="text-xs text-gray-500">
                        ETA: {request.estimatedCompletion}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    Last updated: {request.lastUpdated}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(request.id, 'under_review')}
                          className="text-blue-600"
                        >
                          Review
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(request.id, 'approved')}
                          className="text-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(request.id, 'rejected')}
                          className="text-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No requests found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Request Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Request Details - {selectedRequest?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Overview */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedRequest.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className={getPriorityColor(selectedRequest.priority)}>
                      {selectedRequest.priority} Priority
                    </Badge>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                    <span className="text-sm text-gray-500">Type: {selectedRequest.type.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedRequest.description}
                  </p>
                </div>
              </div>

              {/* Submitter Information */}
              <div>
                <h4 className="font-medium mb-3">Submitted By</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getUserTypeIcon(selectedRequest.submittedBy.userType)}</span>
                        <span className="font-medium">{selectedRequest.submittedBy.name}</span>
                        <Badge variant="outline">{selectedRequest.submittedBy.userType}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {selectedRequest.submittedBy.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedRequest.submittedBy.phone}
                        </div>
                        {selectedRequest.submittedBy.organization && (
                          <div>
                            <span className="font-medium">Organization:</span> {selectedRequest.submittedBy.organization}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Submitted:</span> {selectedRequest.submittedAt}
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span> {selectedRequest.lastUpdated}
                      </div>
                      {selectedRequest.location && (
                        <div>
                          <span className="font-medium">Location:</span> {selectedRequest.location}
                        </div>
                      )}
                      {selectedRequest.reviewedBy && (
                        <div>
                          <span className="font-medium">Reviewed By:</span> {selectedRequest.reviewedBy}
                        </div>
                      )}
                      {selectedRequest.estimatedCompletion && (
                        <div>
                          <span className="font-medium">ETA:</span> {selectedRequest.estimatedCompletion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Details (if applicable) */}
              {selectedRequest.businessDetails && (
                <div>
                  <h4 className="font-medium mb-3">Business Details</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Business Name:</span> {selectedRequest.businessDetails.businessName}
                      </div>
                      <div>
                        <span className="font-medium">Business Type:</span> {selectedRequest.businessDetails.businessType}
                      </div>
                      <div>
                        <span className="font-medium">Registration:</span> {selectedRequest.businessDetails.registrationNumber}
                      </div>
                      <div>
                        <span className="font-medium">Website:</span> 
                        <a href={selectedRequest.businessDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                          {selectedRequest.businessDetails.website}
                        </a>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">Address:</span> {selectedRequest.businessDetails.address}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h4 className="font-medium mb-2">Admin Notes</h4>
                <Textarea
                  placeholder="Add notes about this request..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Quick Actions */}
              {selectedRequest.status === 'pending' || selectedRequest.status === 'under_review' ? (
                <div>
                  <h4 className="font-medium mb-3">Quick Actions</h4>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'approved', adminNotes)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected', adminNotes)}
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    {selectedRequest.status === 'pending' && (
                      <Button
                        onClick={() => handleUpdateStatus(selectedRequest.id, 'under_review', adminNotes)}
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Start Review
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    {selectedRequest.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {selectedRequest.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                    {selectedRequest.status === 'completed' && <Star className="w-5 h-5 text-purple-600" />}
                    <span className="font-medium">
                      Request {selectedRequest.status} 
                      {selectedRequest.reviewedAt && ` on ${selectedRequest.reviewedAt.split(' ')[0]}`}
                    </span>
                  </div>
                  {selectedRequest.adminNotes && (
                    <p className="text-sm text-gray-600 mt-2">{selectedRequest.adminNotes}</p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button onClick={handleSaveNotes}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
