import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Search, Filter, MessageSquare, AlertTriangle, Clock, CheckCircle, User, Calendar, MapPin, Phone, Mail, Flag, Eye, MessageCircle, Archive, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: 'bin_issue' | 'app_bug' | 'payment' | 'partner_issue' | 'service' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  submittedBy: {
    id: string;
    name: string;
    email: string;
    phone: string;
    userType: 'consumer' | 'partner' | 'collector';
  };
  submittedAt: string;
  assignedTo?: string;
  lastUpdated: string;
  location?: string;
  attachments?: string[];
  resolution?: string;
  rating?: number;
  binId?: string;
}

export default function AdminComplaintManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [resolution, setResolution] = useState('');

  const [complaints, setComplaints] = useState<Complaint[]>([
    
  ]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'bin_issue', label: 'Bin Issues' },
    { value: 'app_bug', label: 'App Bugs' },
    { value: 'payment', label: 'Payment Issues' },
    { value: 'partner_issue', label: 'Partner Issues' },
    { value: 'service', label: 'Service Issues' },
    { value: 'other', label: 'Other' }
  ];

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         complaint.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusFilter === '' || complaint.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || priorityFilter === '' || complaint.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || categoryFilter === '' || complaint.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bin_issue': return '🗑️';
      case 'app_bug': return '🐛';
      case 'payment': return '💳';
      case 'partner_issue': return '🏪';
      case 'service': return '🛠️';
      default: return '❓';
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'consumer': return '👤';
      case 'partner': return '🏪';
      case 'collector': return '🚛';
      default: return '👤';
    }
  };

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsDialog(true);
  };

  const handleUpdateStatus = (complaintId: string, newStatus: string) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { ...complaint, status: newStatus as any, lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ') }
        : complaint
    ));
  };

  const handleResolveComplaint = () => {
    if (!selectedComplaint || !resolution) return;
    
    setComplaints(prev => prev.map(complaint => 
      complaint.id === selectedComplaint.id 
        ? { 
            ...complaint, 
            status: 'resolved' as const, 
            resolution,
            lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
        : complaint
    ));
    
    setShowDetailsDialog(false);
    setResolution('');
  };

  const handleAssignComplaint = (complaintId: string, assignee: string) => {
    setComplaints(prev => prev.map(complaint => 
      complaint.id === complaintId 
        ? { 
            ...complaint, 
            assignedTo: assignee,
            status: 'in_progress' as const,
            lastUpdated: new Date().toISOString().slice(0, 19).replace('T', ' ')
          }
        : complaint
    ));
  };

  const stats = {
    totalComplaints: complaints.length,
    pendingComplaints: complaints.filter(c => c.status === 'pending').length,
    inProgressComplaints: complaints.filter(c => c.status === 'in_progress').length,
    resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
    urgentComplaints: complaints.filter(c => c.priority === 'urgent').length,
    averageRating: complaints.filter(c => c.rating).reduce((sum, c) => sum + (c.rating || 0), 0) / complaints.filter(c => c.rating).length || 0
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
            <h1 className="text-xl font-bold">Complaint Management</h1>
            <p className="text-sm text-gray-500">Track and resolve user complaints</p>
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
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalComplaints}</p>
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
                  <p className="text-2xl font-bold">{stats.pendingComplaints}</p>
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
                  <p className="text-2xl font-bold">{stats.inProgressComplaints}</p>
                  <p className="text-xs text-gray-500">In Progress</p>
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
                  <p className="text-2xl font-bold">{stats.resolvedComplaints}</p>
                  <p className="text-xs text-gray-500">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.urgentComplaints}</p>
                  <p className="text-xs text-gray-500">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Avg Rating</p>
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
              placeholder="Search complaints..."
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
              {statuses.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.map((complaint, index) => (
            <Card key={complaint.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCategoryIcon(complaint.category)}</span>
                      <div>
                        <h3 className="font-semibold">{complaint.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>ID: {complaint.id}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {complaint.submittedAt.split(' ')[0]}
                          </span>
                          {complaint.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {complaint.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getUserTypeIcon(complaint.submittedBy.userType)}</span>
                        <span className="font-medium">{complaint.submittedBy.name}</span>
                      </div>
                      {complaint.assignedTo && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Assigned to: {complaint.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </div>
                    
                    {complaint.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{complaint.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    Last updated: {complaint.lastUpdated}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(complaint)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    {complaint.status === 'pending' && (
                      <Select
                        onValueChange={(value) => handleUpdateStatus(complaint.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No complaints found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Complaint Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Complaint Details - {selectedComplaint?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-6">
              {/* Complaint Overview */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedComplaint.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className={getPriorityColor(selectedComplaint.priority)}>
                      {selectedComplaint.priority} Priority
                    </Badge>
                    <Badge className={getStatusColor(selectedComplaint.status)}>
                      {selectedComplaint.status}
                    </Badge>
                    <span className="text-sm text-gray-500">Category: {selectedComplaint.category}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h4 className="font-medium mb-3">Submitted By</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getUserTypeIcon(selectedComplaint.submittedBy.userType)}</span>
                        <span className="font-medium">{selectedComplaint.submittedBy.name}</span>
                        <Badge variant="outline">{selectedComplaint.submittedBy.userType}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {selectedComplaint.submittedBy.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedComplaint.submittedBy.phone}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Submitted:</span> {selectedComplaint.submittedAt}
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span> {selectedComplaint.lastUpdated}
                      </div>
                      {selectedComplaint.location && (
                        <div>
                          <span className="font-medium">Location:</span> {selectedComplaint.location}
                        </div>
                      )}
                      {selectedComplaint.binId && (
                        <div>
                          <span className="font-medium">Related Bin:</span> {selectedComplaint.binId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div>
                <h4 className="font-medium mb-3">Assignment</h4>
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedComplaint.assignedTo || ''}
                    onValueChange={(value) => handleAssignComplaint(selectedComplaint.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tech Team Lead">Tech Team Lead</SelectItem>
                      <SelectItem value="Support Manager">Support Manager</SelectItem>
                      <SelectItem value="Operations Team">Operations Team</SelectItem>
                      <SelectItem value="Payment Team">Payment Team</SelectItem>
                      <SelectItem value="Partner Relations">Partner Relations</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {selectedComplaint.assignedTo && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <User className="w-3 h-3 mr-1" />
                      {selectedComplaint.assignedTo}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Resolution */}
              {selectedComplaint.status === 'resolved' && selectedComplaint.resolution ? (
                <div>
                  <h4 className="font-medium mb-2">Resolution</h4>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">{selectedComplaint.resolution}</p>
                    {selectedComplaint.rating && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm">User Rating:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= (selectedComplaint.rating || 0)
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedComplaint.status !== 'closed' && (
                <div>
                  <h4 className="font-medium mb-2">Add Resolution</h4>
                  <Textarea
                    placeholder="Describe how this complaint was resolved..."
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            {selectedComplaint && selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
              <Button 
                onClick={handleResolveComplaint}
                disabled={!resolution}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}