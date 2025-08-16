import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Search, Filter, Monitor, Plus, Edit, Eye, Trash2, Play, Pause, BarChart, Users, Calendar, Target, Image, Link, Clock, Upload, FileImage, Video, X, Check, Megaphone, Send, Tv, Building, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  type: 'banner' | 'popup' | 'native' | 'video';
  placement: 'home_top' | 'home_bottom' | 'dashboard' | 'scanner' | 'profile' | 'global' | 'smart_bin';
  targetAudience: 'all' | 'consumers' | 'partners' | 'collectors' | 'premium';
  status: 'active' | 'paused' | 'scheduled' | 'expired' | 'draft';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  impressions: number;
  clicks: number;
  ctr: number;
  imageUrl?: string;
  linkUrl?: string;
  createdAt: string;
  lastUpdated: string;
  advertiser: string;
}

interface PartnerAdRequest {
  id: string;
  partnerName: string;
  partnerEmail: string;
  adTitle: string;
  adDescription: string;
  budget: number;
  duration: string;
  targetAudience: string;
  businessCategory: string;
  additionalNotes: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export default function AdminAdManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRequestsDialog, setShowRequestsDialog] = useState(false);
  const [showSmartBinDialog, setShowSmartBinDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequestForRejection, setSelectedRequestForRejection] = useState<PartnerAdRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'ads' | 'requests' | 'smart-bins'>('ads');
  const [newAd, setNewAd] = useState<Partial<Advertisement>>({
    type: 'banner',
    placement: 'home_top',
    targetAudience: 'all',
    status: 'draft',
    priority: 'medium'
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    image?: File;
    video?: File;
  }>({});
  const [uploadPreview, setUploadPreview] = useState<{
    image?: string;
    video?: string;
  }>({});

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([
    
  ]);

  const [partnerAdRequests, setPartnerAdRequests] = useState<PartnerAdRequest[]>([
    
  ]);

  const adTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'banner', label: 'Banner' },
    { value: 'popup', label: 'Popup' },
    { value: 'native', label: 'Native' },
    { value: 'video', label: 'Video' }
  ];

  const placements = [
    { value: 'all', label: 'All Placements' },
    { value: 'home_top', label: 'Home Top' },
    { value: 'home_bottom', label: 'Home Bottom' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'scanner', label: 'Scanner' },
    { value: 'profile', label: 'Profile' },
    { value: 'global', label: 'Global' },
    { value: 'smart_bin', label: 'Smart Trash Bin' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'expired', label: 'Expired' },
    { value: 'draft', label: 'Draft' }
  ];

  const filteredAds = React.useMemo(() => {
    try {
      return advertisements.filter(ad => {
        if (!ad) return false;

        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch = !searchLower ||
          (ad.title && ad.title.toLowerCase().includes(searchLower)) ||
          (ad.description && ad.description.toLowerCase().includes(searchLower)) ||
          (ad.advertiser && ad.advertiser.toLowerCase().includes(searchLower));

        const matchesType = typeFilter === 'all' || typeFilter === '' || ad.type === typeFilter;
        const matchesPlacement = placementFilter === 'all' || placementFilter === '' || ad.placement === placementFilter;
        const matchesStatus = statusFilter === 'all' || statusFilter === '' || ad.status === statusFilter;

        return matchesSearch && matchesType && matchesPlacement && matchesStatus;
      });
    } catch (error) {
      console.error('Filter error:', error);
      return advertisements;
    }
  }, [advertisements, searchQuery, typeFilter, placementFilter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner': return '🖼️';
      case 'popup': return '🪟';
      case 'native': return '📱';
      case 'video': return '🎥';
      default: return '📢';
    }
  };

  const handleViewDetails = (ad: Advertisement) => {
    setSelectedAd(ad);
    setShowDetailsDialog(true);
  };

  const handleToggleStatus = (adId: string) => {
    setAdvertisements(prev => prev.map(ad => 
      ad.id === adId 
        ? { ...ad, status: ad.status === 'active' ? 'paused' : 'active' as 'active' | 'paused' | 'scheduled' | 'expired' | 'draft' }
        : ad
    ));
  };

  const handleDeleteAd = (adId: string) => {
    if (confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) {
      setAdvertisements(prev => prev.filter(ad => ad.id !== adId));
      alert('Advertisement deleted successfully!');
    }
  };

  const handleApproveRequest = (requestId: string) => {
    setPartnerAdRequests(prev => prev.map(req =>
      req.id === requestId
        ? { ...req, status: 'approved', reviewedAt: new Date().toISOString().split('T')[0], reviewedBy: 'Admin' }
        : req
    ));
    alert('✅ Partner ad request approved! You can now create an ad from this request.');
  };

  const handleRejectRequest = (requestId: string) => {
    const request = partnerAdRequests.find(req => req.id === requestId);
    if (request) {
      setSelectedRequestForRejection(request);
      setShowRejectDialog(true);
    }
  };

  const handleConfirmRejection = () => {
    if (selectedRequestForRejection) {
      setPartnerAdRequests(prev => prev.map(req =>
        req.id === selectedRequestForRejection.id
          ? { ...req, status: 'rejected', reviewedAt: new Date().toISOString().split('T')[0], reviewedBy: 'Admin' }
          : req
      ));

      // Simulate sending notification to partner
      console.log('Sending rejection notification to partner:', {
        partnerId: selectedRequestForRejection.partnerEmail,
        reason: rejectionReason || 'No specific reason provided',
        adTitle: selectedRequestForRejection.adTitle
      });

      alert(`❌ Partner ad request rejected and notification sent to ${selectedRequestForRejection.partnerName}.\n\nReason: ${rejectionReason || 'No specific reason provided'}`);

      // Reset state
      setShowRejectDialog(false);
      setSelectedRequestForRejection(null);
      setRejectionReason('');
    }
  };

  const createAdFromRequest = (request: PartnerAdRequest) => {
    const newAdFromRequest: Advertisement = {
      id: `AD-${String(advertisements.length + 1).padStart(3, '0')}`,
      title: request.adTitle,
      description: request.adDescription,
      type: 'banner',
      placement: 'smart_bin',
      targetAudience: 'all',
      status: 'draft',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      budget: request.budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      advertiser: request.partnerName
    };

    setAdvertisements([...advertisements, newAdFromRequest]);
    alert('🎯 Advertisement created successfully from partner request! Check the Smart Bin Ads tab to manage it.');
  };

  const handleFileUpload = (type: 'image' | 'video', file: File) => {
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos

    if (file.size > maxSize) {
      alert(`File size too large. Max size: ${type === 'image' ? '5MB' : '50MB'}`);
      return;
    }

    const allowedTypes = type === 'image'
      ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      : ['video/mp4', 'video/webm', 'video/mov'];

    if (!allowedTypes.includes(file.type)) {
      alert(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(prev => ({
      ...prev,
      [type]: previewUrl
    }));

    // For demo purposes, set a placeholder URL in newAd
    if (type === 'image') {
      setNewAd({...newAd, imageUrl: previewUrl});
    }
  };

  const handleRemoveFile = (type: 'image' | 'video') => {
    if (uploadPreview[type]) {
      URL.revokeObjectURL(uploadPreview[type]!);
    }

    setUploadedFiles(prev => {
      const updated = {...prev};
      delete updated[type];
      return updated;
    });

    setUploadPreview(prev => {
      const updated = {...prev};
      delete updated[type];
      return updated;
    });

    if (type === 'image') {
      setNewAd({...newAd, imageUrl: ''});
    }
  };

  const handleAddAd = () => {
    if (!newAd.title || !newAd.description) return;

    if (newAd.id) {
      // Editing existing ad
      const updatedAd: Advertisement = {
        ...newAd as Advertisement,
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      setAdvertisements(advertisements.map(ad =>
        ad.id === newAd.id ? updatedAd : ad
      ));
    } else {
      // Creating new ad
      const ad: Advertisement = {
        id: `AD-${String(advertisements.length + 1).padStart(3, '0')}`,
        title: newAd.title,
        description: newAd.description,
        type: newAd.type as any,
        placement: newAd.placement as any,
        targetAudience: newAd.targetAudience as any,
        status: newAd.status as any,
        priority: newAd.priority as any,
        startDate: newAd.startDate || new Date().toISOString().split('T')[0],
        endDate: newAd.endDate,
        budget: newAd.budget,
        spent: 0,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        imageUrl: newAd.imageUrl,
        linkUrl: newAd.linkUrl,
        createdAt: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
        advertiser: newAd.advertiser || 'Internal'
      };

      setAdvertisements([...advertisements, ad]);
    }
    setShowAddDialog(false);
    setNewAd({
      type: 'banner',
      placement: 'home_top',
      targetAudience: 'all',
      status: 'draft',
      priority: 'medium'
    });

    // Clear uploaded files
    Object.values(uploadPreview).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    setUploadedFiles({});
    setUploadPreview({});
  };

  const stats = {
    totalAds: advertisements.length,
    activeAds: advertisements.filter(ad => ad.status === 'active').length,
    totalImpressions: advertisements.reduce((sum, ad) => sum + ad.impressions, 0),
    totalClicks: advertisements.reduce((sum, ad) => sum + ad.clicks, 0),
    averageCTR: advertisements.filter(ad => ad.impressions > 0).reduce((sum, ad) => sum + ad.ctr, 0) / advertisements.filter(ad => ad.impressions > 0).length || 0,
    totalSpent: advertisements.reduce((sum, ad) => sum + (ad.spent || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              try {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/admin/dashboard');
                }
              } catch (error) {
                console.error('Navigation error:', error);
                navigate('/admin/dashboard');
              }
            }}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Advertisement Management</h1>
            <p className="text-sm text-gray-500">Create and manage app advertisements & partner requests</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setActiveTab('smart-bins')} variant="outline">
              <Tv className="w-4 h-4 mr-2" />
              Smart Bin Ads
            </Button>
            <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('ads')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ads'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Monitor className="w-4 h-4 inline mr-2" />
            Advertisements ({advertisements.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'requests'
                ? 'border-purple-500 text-purple-600 bg-purple-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Megaphone className="w-4 h-4 inline mr-2" />
            Partner Requests ({partnerAdRequests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('smart-bins')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'smart-bins'
                ? 'border-green-500 text-green-600 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Tv className="w-4 h-4 inline mr-2" />
            Smart Bin Ads ({advertisements.filter(ad => ad.placement === 'smart_bin').length})
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Content based on active tab */}
        {activeTab === 'ads' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalAds}</p>
                      <p className="text-xs text-gray-500">Total Ads</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeAds}</p>
                      <p className="text-xs text-gray-500">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Impressions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Clicks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <BarChart className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.averageCTR.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">Avg CTR</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Total Spent</p>
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
                  placeholder="Search advertisements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {adTypes.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={placementFilter} onValueChange={setPlacementFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Placement" />
                </SelectTrigger>
                <SelectContent>
                  {placements.map(option => (
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
            </div>

            {/* Advertisements List */}
            <div className="space-y-4">
              {filteredAds.map((ad, index) => (
                <Card key={ad.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Ad Preview */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-2xl">{getTypeIcon(ad.type)}</span>
                        )}
                      </div>

                      {/* Ad Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{ad.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{ad.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(ad.status)}>
                                {ad.status}
                              </Badge>
                              <Badge className={getPriorityColor(ad.priority)}>
                                {ad.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                          <span>Type: {ad.type}</span>
                          <span>Placement: {ad.placement.replace('_', ' ')}</span>
                          <span>Target: {ad.targetAudience}</span>
                          <span>Advertiser: {ad.advertiser}</span>
                        </div>

                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{ad.impressions.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Impressions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{ad.clicks.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Clicks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{ad.ctr.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">CTR</div>
                          </div>
                          {ad.budget && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">₹{(ad.spent || 0).toLocaleString()}</div>
                              <div className="text-xs text-gray-500">Spent / ₹{ad.budget.toLocaleString()}</div>
                            </div>
                          )}
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-600">{ad.startDate}</div>
                            <div className="text-xs text-gray-500">Start Date</div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-3 border-t">
                          <div className="text-xs text-gray-500">
                            Last updated: {ad.lastUpdated}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(ad)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(ad.id)}
                            >
                              {ad.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAd(ad.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAds.length === 0 && (
              <div className="text-center py-12">
                <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No advertisements found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}

        {/* Partner Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Partner Ad Requests</h2>
              <Badge variant="secondary">
                {partnerAdRequests.filter(r => r.status === 'pending').length} Pending
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{partnerAdRequests.filter(r => r.status === 'pending').length}</div>
                  <div className="text-sm text-blue-600">Pending Requests</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{partnerAdRequests.filter(r => r.status === 'approved').length}</div>
                  <div className="text-sm text-green-600">Approved</div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{partnerAdRequests.filter(r => r.status === 'rejected').length}</div>
                  <div className="text-sm text-red-600">Rejected</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {partnerAdRequests.map((request, index) => (
                <Card key={request.id} className={`animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{request.adTitle}</h3>
                          <Badge className={
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{request.adDescription}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-500">Partner:</span>
                            <p className="font-semibold">{request.partnerName}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Budget:</span>
                            <p className="font-semibold">₹{request.budget.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Duration:</span>
                            <p className="font-semibold">{request.duration}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Category:</span>
                            <p className="font-semibold capitalize">{request.businessCategory.replace('-', ' ')}</p>
                          </div>
                        </div>
                        {request.additionalNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-500">Additional Notes:</span>
                            <p className="text-sm text-gray-700 mt-1">{request.additionalNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        <p>Submitted: {request.submittedAt}</p>
                        {request.reviewedAt && (
                          <p>Reviewed: {request.reviewedAt} by {request.reviewedBy}</p>
                        )}
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectRequest(request.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      )}

                      {request.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => createAdFromRequest(request)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Ad
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Smart Bin Ads Tab */}
        {activeTab === 'smart-bins' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Smart Bin Advertisements</h2>
              <Button onClick={() => {
                setNewAd({...newAd, placement: 'smart_bin'});
                setShowAddDialog(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Launch Bin Ad
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{advertisements.filter(ad => ad.placement === 'smart_bin').length}</div>
                  <div className="text-sm text-purple-600">Total Bin Ads</div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{advertisements.filter(ad => ad.placement === 'smart_bin' && ad.status === 'active').length}</div>
                  <div className="text-sm text-green-600">Active</div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{advertisements.filter(ad => ad.placement === 'smart_bin').reduce((sum, ad) => sum + ad.impressions, 0).toLocaleString()}</div>
                  <div className="text-sm text-blue-600">Total Views</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">₹{advertisements.filter(ad => ad.placement === 'smart_bin').reduce((sum, ad) => sum + (ad.spent || 0), 0).toLocaleString()}</div>
                  <div className="text-sm text-orange-600">Revenue</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {advertisements.filter(ad => ad.placement === 'smart_bin').map((ad, index) => (
                <Card key={ad.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {ad.imageUrl ? (
                          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Tv className="w-8 h-8 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{ad.title}</h3>
                            <p className="text-sm text-gray-600">{ad.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(ad.status)}>
                              {ad.status}
                            </Badge>
                            <Badge className="bg-purple-100 text-purple-800">
                              Smart Bin
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-blue-600">{ad.impressions.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Views</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-green-600">{ad.clicks.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Interactions</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-purple-600">{ad.ctr.toFixed(1)}%</div>
                            <div className="text-xs text-gray-500">CTR</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-orange-600">₹{(ad.spent || 0).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Spent</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t">
                          <div className="text-xs text-gray-500">
                            Advertiser: {ad.advertiser} • Updated: {ad.lastUpdated}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(ad)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNewAd({...ad});
                                setShowAddDialog(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(ad.id)}
                            >
                              {ad.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {advertisements.filter(ad => ad.placement === 'smart_bin').length === 0 && (
                <div className="text-center py-12">
                  <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No smart bin ads created yet</p>
                  <p className="text-sm text-gray-400">Create your first smart bin advertisement</p>
                  <Button className="mt-4" onClick={() => {
                    setNewAd({...newAd, placement: 'smart_bin'});
                    setShowAddDialog(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Launch First Bin Ad
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ad Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Advertisement Details - {selectedAd?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAd && (
            <div className="space-y-6">
              {/* Ad Overview */}
              <div className="flex gap-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  {selectedAd.imageUrl ? (
                    <img src={selectedAd.imageUrl} alt={selectedAd.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-4xl">{getTypeIcon(selectedAd.type)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedAd.title}</h3>
                  <p className="text-gray-600 mt-1">{selectedAd.description}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge className={getStatusColor(selectedAd.status)}>
                      {selectedAd.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedAd.priority)}>
                      {selectedAd.priority} priority
                    </Badge>
                    <Badge variant="outline">
                      {selectedAd.type}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedAd.impressions.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Impressions</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedAd.clicks.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Clicks</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedAd.ctr.toFixed(2)}%</div>
                  <div className="text-xs text-gray-600">Click-Through Rate</div>
                </div>
                {selectedAd.budget && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">₹{(selectedAd.spent || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Spent / ₹{selectedAd.budget.toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Campaign Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Campaign Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{selectedAd.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Placement:</span>
                      <span className="font-medium">{selectedAd.placement.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Audience:</span>
                      <span className="font-medium">{selectedAd.targetAudience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Advertiser:</span>
                      <span className="font-medium">{selectedAd.advertiser}</span>
                    </div>
                    {selectedAd.linkUrl && (
                      <div className="flex justify-between">
                        <span>Link URL:</span>
                        <a href={selectedAd.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                          {selectedAd.linkUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Schedule & Budget</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-medium">{selectedAd.startDate}</span>
                    </div>
                    {selectedAd.endDate && (
                      <div className="flex justify-between">
                        <span>End Date:</span>
                        <span className="font-medium">{selectedAd.endDate}</span>
                      </div>
                    )}
                    {selectedAd.budget && (
                      <>
                        <div className="flex justify-between">
                          <span>Budget:</span>
                          <span className="font-medium">₹{selectedAd.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span className="font-medium">₹{(selectedAd.budget - (selectedAd.spent || 0)).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">{selectedAd.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-medium">{selectedAd.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedAd) {
                  console.log('Editing ad:', selectedAd.id);
                  setNewAd({
                    ...selectedAd,
                  });
                  setShowDetailsDialog(false);
                  setShowAddDialog(true);
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Ad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Ad Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {newAd.id ? (
                <>
                  <Edit className="w-5 h-5" />
                  Edit Advertisement
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create New Advertisement
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Design a new advertisement campaign
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adTitle">Advertisement Title</Label>
                <Input 
                  id="adTitle" 
                  placeholder="Enter ad title"
                  value={newAd.title || ''}
                  onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="advertiser">Advertiser</Label>
                <Input 
                  id="advertiser" 
                  placeholder="Company/Organization name"
                  value={newAd.advertiser || ''}
                  onChange={(e) => setNewAd({...newAd, advertiser: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe your advertisement..."
                value={newAd.description || ''}
                onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="type">Ad Type</Label>
                <Select 
                  value={newAd.type} 
                  onValueChange={(value) => setNewAd({...newAd, type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="popup">Popup</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="placement">Placement</Label>
                <Select 
                  value={newAd.placement} 
                  onValueChange={(value) => setNewAd({...newAd, placement: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home_top">Home Top</SelectItem>
                    <SelectItem value="home_bottom">Home Bottom</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="scanner">Scanner</SelectItem>
                    <SelectItem value="profile">Profile</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select 
                  value={newAd.targetAudience} 
                  onValueChange={(value) => setNewAd({...newAd, targetAudience: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="consumers">Consumers</SelectItem>
                    <SelectItem value="partners">Partners</SelectItem>
                    <SelectItem value="collectors">Collectors</SelectItem>
                    <SelectItem value="premium">Premium Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newAd.priority} 
                  onValueChange={(value) => setNewAd({...newAd, priority: value as any})}
                >
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
            
            {/* Media Upload Section */}
            <div>
              <Label>Media Upload</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <FileImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">Upload Image</p>
                    <p className="text-xs text-gray-500 mb-3">JPG, PNG, GIF, WebP (Max 5MB)</p>

                    {uploadPreview.image ? (
                      <div className="relative">
                        <img
                          src={uploadPreview.image}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFile('image')}
                          className="w-full"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('image', file);
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Choose Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">Upload Video</p>
                    <p className="text-xs text-gray-500 mb-3">MP4, WebM, MOV (Max 50MB)</p>

                    {uploadPreview.video ? (
                      <div className="relative">
                        <video
                          src={uploadPreview.video}
                          className="w-full h-24 object-cover rounded mb-2"
                          controls
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFile('video')}
                          className="w-full"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload('video', file);
                          }}
                          className="hidden"
                          id="video-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('video-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Choose Video
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Upload high-quality media for better engagement. Images work great for banner ads, while videos are perfect for video ad types.
              </p>
            </div>

            <div>
              <Label htmlFor="linkUrl">Link URL (Optional)</Label>
              <Input
                id="linkUrl"
                placeholder="https://example.com"
                value={newAd.linkUrl || ''}
                onChange={(e) => setNewAd({...newAd, linkUrl: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date"
                  value={newAd.startDate || ''}
                  onChange={(e) => setNewAd({...newAd, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input 
                  id="endDate" 
                  type="date"
                  value={newAd.endDate || ''}
                  onChange={(e) => setNewAd({...newAd, endDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget (Optional)</Label>
                <Input 
                  id="budget" 
                  type="number" 
                  placeholder="10000"
                  value={newAd.budget || ''}
                  onChange={(e) => setNewAd({...newAd, budget: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAd}
              disabled={!newAd.title || !newAd.description}
            >
              {newAd.id ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Advertisement
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Advertisement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              Reject Partner Ad Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequestForRejection && (
                <>
                  Rejecting ad request "{selectedRequestForRejection.adTitle}" from {selectedRequestForRejection.partnerName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a detailed reason for rejecting this ad request. This will be sent to the partner."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> The partner will receive this rejection reason in their notification center.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setSelectedRequestForRejection(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRejection}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
