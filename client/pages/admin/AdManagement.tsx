import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ArrowLeft, Gift, Plus, Search, Filter, Activity, Eye, Edit, Trash2,
  CheckCircle, AlertCircle, Clock, Store, Users, Coins, Check, X, Monitor,
  Megaphone, Loader2, Play, Pause, UserCheck, Target, Video, Image, Upload, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// --- 1. UPDATED INTERFACE ---
// Matches your new 'advertisements' table
interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  duration: number; // Changed
  points: number;   // Changed
  advertiser: string;
  category: string | null;
  thumbnail: string | null;
  video_url: string | null;
  is_active: boolean | null; // Changed
  max_views_per_day: number | null;
  target_audience: string[] | null;
  created_at: string;
  updated_at: string;
}

// --- PartnerAdRequest interface is unchanged ---
interface PartnerAdRequest {
  a_id: string; 
  id: string; 
  ad_title: string;
  ad_description: string | null;
  budget: number;
  duration_days: number;
  target_audience: string | null;
  business_category: string | null;
  ad_media_url: string;
  additional_notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  }
}

type ProfileMap = {
  [key: string]: { full_name: string; email: string }
}

export default function AdminAdManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- 2. UPDATED FILTERS ---
  const [statusFilter, setStatusFilter] = useState('all'); // Only status filter remains
  
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequestForRejection, setSelectedRequestForRejection] = useState<PartnerAdRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // --- 3. UPDATED TABS ---
  const [activeTab, setActiveTab] = useState<'ads' | 'requests'>('ads'); // 'smart-bins' removed
  
  // --- 4. UPDATED NEW_AD STATE ---
  const [newAd, setNewAd] = useState<Partial<Advertisement>>({
    is_active: true,
    points: 100,
    duration: 30,
    advertiser: 'Internal',
    target_audience: ['all'],
    max_views_per_day: 1000,
    category: 'food' // <-- ADDED THIS
  });

  const [uploadedFiles, setUploadedFiles] = useState<{
    image?: File;
    video?: File;
  }>({});
  const [uploadPreview, setUploadPreview] = useState<{
    image?: string;
    video?: string;
  }>({});

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [partnerAdRequests, setPartnerAdRequests] = useState<PartnerAdRequest[]>([]);

  // --- DATA FETCHING (Modified) ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Advertisements (from new table)
      const { data: adsData, error: adsError } = await supabase
        .from('advertisements') // This table name is from your schema
        .select('*');
      
      if (adsError) throw new Error(`Failed to fetch ads: ${adsError.message}`);
      setAdvertisements(adsData || []);

      // 2. Fetch Partner Requests (NO JOIN)
      const { data: requestsData, error: requestsError } = await supabase
        .from('sponsored_ad_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw new Error(`Failed to fetch requests: ${requestsError.message}`);
      
      // 3. Fetch Profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email');
      
      if (profilesError) throw new Error(`Failed to fetch profiles: ${profilesError.message}`);

      // 4. Create a "map" for profiles for fast lookup
      const profileMap: ProfileMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = { full_name: profile.full_name || 'N/A', email: profile.email || 'N/A' };
        return acc;
      }, {} as ProfileMap);

      // 5. Manually "join" the data in JavaScript
      const joinedRequests = (requestsData || []).map(request => ({
        ...request,
        profiles: profileMap[request.id] || { full_name: 'Unknown Partner', email: 'N/A' } // Attach profile info
      }));

      setPartnerAdRequests(joinedRequests);

    } catch (error: any) {
      console.error("Error loading data:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 5. UPDATED FILTERS ---
  const filteredAds = React.useMemo(() => {
    try {
      return advertisements.filter(ad => {
        if (!ad) return false;

        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch = !searchLower ||
          (ad.title && ad.title.toLowerCase().includes(searchLower)) ||
          (ad.description && ad.description.toLowerCase().includes(searchLower)) ||
          (ad.advertiser && ad.advertiser.toLowerCase().includes(searchLower));

        const matchesStatus = statusFilter === 'all' ||
          (statusFilter === 'active' && ad.is_active === true) ||
          (statusFilter === 'inactive' && ad.is_active === false);

        return matchesSearch && matchesStatus;
      });
    } catch (error) {
      console.error('Filter error:', error);
      return advertisements;
    }
  }, [advertisements, searchQuery, statusFilter]);

  // --- 6. UPDATED HELPERS ---
  const getStatusColor = (isActive: boolean | null) => {
    if (isActive === true) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 ring-1 ring-inset ring-green-200/60 dark:ring-green-900/30';
    if (isActive === false) return 'bg-gray-100 text-gray-800 dark:bg-gray-400/20 dark:text-gray-300 ring-1 ring-inset ring-gray-200/60 dark:ring-gray-800/50';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 ring-1 ring-inset ring-red-200/60 dark:ring-red-900/30';
  };
  
  const getTypeIcon = (ad: Advertisement) => {
    if (ad.video_url) return '🎥';
    if (ad.thumbnail) return '🖼️';
    return '📢';
  };

  const handleViewDetails = (ad: Advertisement) => {
    setSelectedAd(ad);
    setShowDetailsDialog(true);
  };

  // --- 7. UPDATED HANDLER ---
  const handleToggleStatus = async (adId: string) => {
    const ad = advertisements.find(a => a.id === adId);
    if (!ad) return;
    const newStatus = !ad.is_active; // Toggle boolean
    const { error } = await supabase
      .from('advertisements')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', adId);
    if (error) alert(`Failed to update status: ${error.message}`);
    else fetchData();
  };

  const handleDeleteAd = async (adId: string) => {
    if (confirm('Are you sure you want to delete this advertisement? This action cannot be undone.')) {
      const { error } = await supabase.from('advertisements').delete().eq('id', adId);
      if (error) alert(`Failed to delete ad: ${error.message}`);
      else {
        alert('Advertisement deleted successfully!');
        fetchData();
      }
    }
  };

  // --- RPC Handlers are unchanged, they just call the SQL function ---
  const handleApproveRequest = async (requestId: string) => {
    const { error } = await supabase.rpc('approve_ad_request', {
      request_id: requestId
    });
    if (error) alert(`Failed to approve request: ${error.message}`);
    else {
      alert('✅ Partner ad request approved! A new ad has been created.');
      fetchData();
    }
  };

  const handleRejectRequest = (request: PartnerAdRequest) => {
    setSelectedRequestForRejection(request);
    setShowRejectDialog(true);
  };

  const handleConfirmRejection = async () => {
    if (selectedRequestForRejection) {
      const { error } = await supabase.rpc('reject_ad_request', {
        request_id: selectedRequestForRejection.a_id, 
        reason: rejectionReason || 'No specific reason provided'
      });
      if (error) alert(`Failed to reject request: ${error.message}`);
      else alert(`❌ Partner ad request rejected and notification sent.`);
      setShowRejectDialog(false);
      setSelectedRequestForRejection(null);
      setRejectionReason('');
      fetchData();
    }
  };

  // --- File upload logic is unchanged ---
  const handleFileUpload = (type: 'image' | 'video', file: File) => {
    // ... (file upload logic is the same)
  };
  const handleRemoveFile = (type: 'image' | 'video') => {
    // ... (file remove logic is the same)
  };

  // --- 8. CRITICALLY UPDATED HANDLER ---
  const handleAddAd = async () => {
    if (!newAd.title || !newAd.description) {
      alert("Title and Description are required.");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      let thumbnailUrl: string | undefined = newAd.thumbnail;
      let videoUrl: string | undefined = newAd.video_url;
      
      // File uploads (unchanged, but storage bucket is now 'sponsored_ads')
      if (uploadedFiles.image) {
        const file = uploadedFiles.image;
        const filePath = `admin-uploads/${user.id}/${file.name}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('sponsored_ads').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('sponsored_ads').getPublicUrl(filePath);
        thumbnailUrl = urlData.publicUrl;
      }
      if (uploadedFiles.video) {
        const file = uploadedFiles.video;
        const filePath = `admin-uploads/${user.id}/${file.name}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage.from('sponsored_ads').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('sponsored_ads').getPublicUrl(filePath);
        videoUrl = urlData.publicUrl;
      }
      
      // This is the new data object for your 'advertisements' table
      const adData = {
        title: newAd.title,
        description: newAd.description,
        duration: newAd.duration,
        points: newAd.points,
        advertiser: newAd.advertiser || 'Internal',
        category: newAd.category, // <-- ADDED THIS
        thumbnail: thumbnailUrl,
        video_url: videoUrl,
        is_active: newAd.is_active,
        max_views_per_day: newAd.max_views_per_day || 1000,
        target_audience: newAd.target_audience,
        updated_at: new Date().toISOString()
        // All other fields (placement, status, type, etc.) are removed
      };
      
      if (newAd.id) {
        // Update existing ad
        const { error } = await supabase.from('advertisements').update(adData).eq('id', newAd.id);
        if (error) throw error;
        alert("Advertisement updated successfully!");
      } else {
        // Create new ad
        // ==================================
        // HERE IS THE FIRST FIX
        // Removed the extra underscore
        // ==================================
        const { error } = await supabase.from('advertisements').insert(adData);
        if (error) throw error;
        alert("Advertisement created successfully!");
      }
      
      setShowAddDialog(false);
      setNewAd({ points: 100, duration: 30, is_active: true, advertiser: 'Internal', target_audience: ['all'], max_views_per_day: 1000, category: 'food' });
      Object.values(uploadPreview).forEach(url => { if (url) URL.revokeObjectURL(url); });
      setUploadedFiles({});
      setUploadPreview({});
      fetchData(); 
    } catch (error: any) {
      console.error("Error creating/updating ad:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- 9. UPDATED STATS ---
  const stats = {
    totalAds: advertisements.length,
    activeAds: advertisements.filter(ad => ad.is_active).length,
    // ==================================
    // HERE IS THE SECOND FIX
    // Changed '=.sum' to '=> sum'
    // ==================================
    totalPointsAwarded: advertisements.reduce((sum, ad) => sum + ad.points, 0),
    avgDuration: advertisements.reduce((sum, ad) => sum + ad.duration, 0) / (advertisements.length || 1),
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/60 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 animate-in slide-in-from-top duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Advertisement Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create ads & manage partner requests</p>
              </div>
            </div>
            <div className="flex gap-2">
              {/* 'Smart Bin Ads' button removed */}
              <Button onClick={() => {
                setNewAd({ points: 100, duration: 30, is_active: true, advertiser: 'Internal', target_audience: ['all'], max_views_per_day: 1000, category: 'food' });
                setShowAddDialog(true);
              }} className="rounded-lg shadow-sm hover:shadow-md transition-all bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Ad
              </Button>
            </div>
          </div>

          {/* --- 10. UPDATED TABS --- */}
          <div className="flex border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
            <button
              onClick={() => setActiveTab('ads')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'ads'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-300'
              }`}
            >
              <Monitor className="w-4 h-4 inline mr-2" />
              Advertisements ({advertisements.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
            >
              <Megaphone className="w-4 h-4 inline mr-2" />
              Partner Requests ({partnerAdRequests.filter(r => r.status === 'pending').length})
            </button>
            {/* 'Smart Bin Ads' tab removed */}
          </div>
        </div>
      </div>

      {loading && (
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center">
          <div className="text-center">
            <div className="relative mx-auto mb-6 h-14 w-14">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 animate-ping opacity-20" />
              <div className="animate-spin rounded-full h-14 w-14 border-2 border-emerald-500 border-t-transparent mx-auto"></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">Loading Ad Management...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Content based on active tab */}
          {activeTab === 'ads' && (
            <>
              {/* --- 11. UPDATED STATS CARDS --- */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-950 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
                      <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center ring-1 ring-inset ring-blue-200/60 dark:ring-blue-900/30">
                                  <Monitor className="w-5 h-5" />
                              </div>
                              <div>
                                  <p className="text-2xl font-bold">{stats.totalAds}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Ads</p>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
                  <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-950 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-100">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-teal-500" />
                      <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center ring-1 ring-inset ring-green-200/60 dark:ring-green-900/30">
                                  <CheckCircle className="w-5 h-5" />
                              </div>
                              <div>
                                  <p className="text-2xl font-bold">{stats.activeAds}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Active Ads</p>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
                  <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-950 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-200">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                      <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center ring-1 ring-inset ring-orange-200/60 dark:ring-orange-900/30">
                                  <Coins className="w-5 h-5" />
                              </div>
                              <div>
                                  <p className="text-2xl font-bold">{stats.totalPointsAwarded.toLocaleString()}</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Points Awarded</p>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
                  <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-950 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-300">
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                      <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center ring-1 ring-inset ring-purple-200/60 dark:ring-purple-900/30">
                                  <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                  <p className="text-2xl font-bold">{stats.avgDuration.toFixed(1)}s</p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">Avg. Duration</p>
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              </div>

              {/* --- 12. UPDATED FILTERS --- */}
              <Card className="border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Search advertisements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-lg"
                            />
                        </div>

                        {/* 'Type' and 'Placement' filters removed */}

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-32 rounded-lg">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
              </Card>

              {/* --- 13. UPDATED AD LIST --- */}
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 pt-4">
                Advertisements <span className="text-gray-500 dark:text-gray-400">({filteredAds.length})</span>
              </h2>
              <div className="space-y-3">
                {filteredAds.map((ad, index) => (
                    <Card
                      key={ad.id}
                      className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100} border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur`}
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
                      <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-gray-200/60 dark:ring-gray-700/60 flex-shrink-0">
                                  {ad.thumbnail ? (
                                      <img src={ad.thumbnail} alt={ad.title} className="w-full h-full object-cover" />
                                  ) : (
                                      <span className="text-2xl text-gray-400 dark:text-gray-500 flex items-center justify-center h-full">{getTypeIcon(ad)}</span>
                                  )}
                              </div>

                              <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                      <h3 className="font-semibold truncate">{ad.title}</h3>
                                      <Badge className={`${getStatusColor(ad.is_active)} rounded-full px-2 py-0.5`}>
                                          {ad.is_active ? 'Active' : 'Inactive'}
                                      </Badge>
                                      {/* 'Priority', 'Type', 'Placement' badges removed */}
                                  </div>

                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{ad.description}</p>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                      <span className="flex items-center gap-1">
                                          <UserCheck className="w-3 h-3" />
                                          Advertiser: {ad.advertiser}
                                      </span>
                                      <span className="flex items-center gap-1">
                                          <Target className="w-3 h-3" />
                                          {ad.target_audience?.join(', ') || 'All'}
                                      </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                                      <span>Points: <span className="font-medium text-emerald-600">{ad.points.toLocaleString()}</span></span>
                                      <span>Duration: <span className="font-medium">{ad.duration}s</span></span>
                                      <span>Max Views/Day: <span className="font-medium">{ad.max_views_per_day?.toLocaleString()}</span></span>
                                  </div>
                              </div>
                              
                              <div className="flex flex-col gap-2 shrink-0">
                                  <Button variant="outline" size="icon" className="rounded-lg" onClick={() => handleViewDetails(ad)} aria-label="View Details">
                                      <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="icon" className="rounded-lg" onClick={() => {
                                      setSelectedAd(ad);
                                      setNewAd({...ad, target_audience: ad.target_audience || ['all']});
                                      setShowAddDialog(true);
                                  }} aria-label="Edit Ad">
                                      <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="icon" className="rounded-lg" onClick={() => handleToggleStatus(ad.id)} aria-label={ad.is_active ? 'Pause Ad' : 'Play Ad'}>
                                      {ad.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  </Button>
                                  <Button variant="destructive" size="icon" className="rounded-lg" onClick={() => handleDeleteAd(ad.id)} aria-label="Delete Ad">
                                      <Trash2 className="w-4 h-4" />
                                  </Button>
                              </div>
                          </div>
                      </CardContent>
                    </Card>
                ))}
              </div>

              {filteredAds.length === 0 && (
                <Card className="text-center py-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
                    <CardContent>
                        <Monitor className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 mb-2">No advertisements found</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters, or create a new ad.</p>
                    </CardContent>
                </Card>
              )}
            </>
          )}

          {/* --- Partner Requests Tab (Unchanged) --- */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Pending Partner Ad Requests <span className="text-gray-500 dark:text-gray-400">({partnerAdRequests.filter(r => r.status === 'pending').length})</span>
              </h2>
              <div className="space-y-3">
                {partnerAdRequests.filter(r => r.status === 'pending').map((request, index) => (
                  <Card
                    key={request.a_id}
                    className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100} border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur`}
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold truncate">{request.ad_title}</h3>
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 ring-1 ring-inset ring-yellow-200/60 dark:ring-yellow-900/30 rounded-full px-2 py-0.5">
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{request.ad_description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Partner:</span>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">{request.profiles?.full_name || 'N/A'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{request.profiles?.email || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Budget:</span>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">₹{request.budget.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Duration:</span>
                              <p className="font-semibold text-gray-800 dark:text-gray-200">{request.duration_days} days</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">Category:</span>
                              <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{request.business_category}</p>
                            </div>
                          </div>
                          {request.additional_notes && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                              <span className="font-medium text-gray-500 dark:text-gray-400">Additional Notes:</span>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{request.additional_notes}</p>
                            </div>
                          )}
                        </div>
                        <a href={request.ad_media_url} target="_blank" rel="noopener noreferrer" className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-gray-200/60 dark:ring-gray-700/60">
                          {request.ad_media_url.includes('mp4') || request.ad_media_url.includes('mov') ? (
                            <Video className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          ) : (
                            <img src={request.ad_media_url} alt="Ad Media" className="w-full h-full object-cover" />
                          )}
                        </a>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <p>Submitted: {new Date(request.created_at).toLocaleString()}</p>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleRejectRequest(request)} className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-200 dark:border-red-900/50">
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => handleApproveRequest(request.a_id)} className="rounded-lg bg-emerald-600 hover:bg-emerald-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        )}
                        
                        {/* ... (approved/rejected badges) ... */}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {partnerAdRequests.filter(r => r.status === 'pending').length === 0 && (
                  <Card className="text-center py-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
                      <CardContent>
                          <Megaphone className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 mb-2">No pending partner ad requests</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">All caught up!</p>
                      </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
        </div>
      )}


      {/* --- 14. UPDATED DETAILS DIALOG --- */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Monitor className="w-5 h-5 text-emerald-600" />
              Advertisement Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedAd && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-inset ring-gray-200/60 dark:ring-gray-700/60">
                  {selectedAd.thumbnail ? (
                    <img src={selectedAd.thumbnail} alt={selectedAd.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-gray-400 dark:text-gray-500">{getTypeIcon(selectedAd)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{selectedAd.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedAd.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className={`${getStatusColor(selectedAd.is_active)} rounded-full px-2 py-0.5`}>
                      {selectedAd.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Campaign Details</h4>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Points per View:</span>
                      <span className="font-medium text-emerald-600">{selectedAd.points.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{selectedAd.duration} seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Views/Day:</span>
                      <span className="font-medium">{selectedAd.max_views_per_day?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target Audience:</span>
                      <span className="font-medium">{selectedAd.target_audience?.join(', ') || 'All'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Advertiser:</span>
                      <span className="font-medium">{selectedAd.advertiser}</span>
                    </div>
                    {selectedAd.video_url && (
                      <div className="flex justify-between">
                        <span>Video URL:</span>
                        <a href={selectedAd.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium dark:text-blue-400 truncate max-w-[150px]">
                          View Video
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Metadata</h4>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex justify-between">
                      <span>Ad ID:</span>
                      <span className="font-medium font-mono text-xs">{selectedAd.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="font-medium">{selectedAd.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">{new Date(selectedAd.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-medium">{new Date(selectedAd.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedAd) {
                  setNewAd({
                    ...selectedAd,
                    target_audience: selectedAd.target_audience || ['all']
                  });
                  setShowDetailsDialog(false);
                  setShowAddDialog(true);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Ad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- 15. UPDATED ADD/EDIT DIALOG --- */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setNewAd({ points: 100, duration: 30, is_active: true, advertiser: 'Internal', target_audience: ['all'], max_views_per_day: 1000, category: 'food' });
          Object.values(uploadPreview).forEach(url => { if (url) URL.revokeObjectURL(url); });
          setUploadedFiles({});
          setUploadPreview({});
        } else {
          setShowAddDialog(true);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
              {newAd.id ? ( <Edit className="w-5 h-5 text-emerald-600" /> ) : ( <Plus className="w-5 h-5 text-emerald-600" /> )}
              {newAd.id ? "Edit Advertisement" : "Create New Advertisement"}
            </DialogTitle>
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
                  className="rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="advertiser">Advertiser</Label>
                <Input 
                  id="advertiser" 
                  placeholder="Company/Organization name"
                  value={newAd.advertiser || ''}
                  onChange={(e) => setNewAd({...newAd, advertiser: e.target.value})}
                  className="rounded-lg"
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
                className="resize-none rounded-lg"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="points">Points per View</Label>
                <div className="relative">
                  <Input 
                    id="points" 
                    type="number" 
                    placeholder="100"
                    value={newAd.points || ''}
                    onChange={(e) => setNewAd({...newAd, points: Number(e.target.value)})}
                    className="pl-8 rounded-lg"
                  />
                  <Coins className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                </div>
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <div className="relative">
                  <Input 
                    id="duration" 
                    type="number" 
                    placeholder="30"
                    value={newAd.duration || ''}
                    onChange={(e) => setNewAd({...newAd, duration: Number(e.target.value)})}
                    className="pl-8 rounded-lg"
                  />
                  <Clock className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
                </div>
              </div>
              <div>
                <Label htmlFor="maxViews">Max Views / Day</Label>
                <Input 
                  id="maxViews" 
                  type="number" 
                  placeholder="1000"
                  value={newAd.max_views_per_day || ''}
                  onChange={(e) => setNewAd({...newAd, max_views_per_day: Number(e.target.value)})}
                  className="rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select 
                  value={newAd.target_audience ? newAd.target_audience[0] : 'all'} 
                  onValueChange={(value) => setNewAd({...newAd, target_audience: [value] as any})}
                >
                  <SelectTrigger className="rounded-lg">
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
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newAd.is_active ? 'active' : 'inactive'} 
                  onValueChange={(value) => setNewAd({...newAd, is_active: value === 'active'})}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Business Category</Label>
                <Select 
                  value={newAd.category || 'food'}
                  onValueChange={(value) => setNewAd({...newAd, category: value})}
                >
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    {/* Add more categories as needed */}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Media Upload Section (unchanged) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <div>
                <Label htmlFor="imageUpload" className="mb-2 block text-gray-700 dark:text-gray-200">Ad Image (Thumbnail)</Label>
                <div className="flex items-center gap-2">
                   <Input
                     id="imageUpload"
                     type="file"
                     accept="image/*"
                     onChange={(e) => {
                       if (e.target.files && e.target.files[0]) {
                         handleFileUpload('image', e.target.files[0]);
                       }
                     }}
                     className="flex-1 rounded-lg"
                   />
                   {(uploadPreview.image || newAd.thumbnail) && (
                     <Button variant="outline" size="icon" onClick={() => handleRemoveFile('image')} className="rounded-lg">
                       <X className="w-4 h-4" />
                     </Button>
                   )}
                 </div>
                 {(uploadPreview.image || newAd.thumbnail) && (
                   <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                     <img src={uploadPreview.image || newAd.thumbnail!} alt="Image Preview" className="w-full h-full object-cover" />
                     <Badge variant="secondary" className="absolute top-1 left-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">Image</Badge>
                   </div>
                 )}
              </div>
              <div>
                <Label htmlFor="videoUpload" className="mb-2 block text-gray-700 dark:text-gray-200">Ad Video (Optional)</Label>
                 <div className="flex items-center gap-2">
                   <Input
                     id="videoUpload"
                     type="file"
                     accept="video/*"
                     onChange={(e) => {
                       if (e.target.files && e.target.files[0]) {
                         handleFileUpload('video', e.target.files[0]);
                       }
                     }}
                     className="flex-1 rounded-lg"
                   />
                   {(uploadPreview.video || newAd.video_url) && (
                     <Button variant="outline" size="icon" onClick={() => handleRemoveFile('video')} className="rounded-lg">
                       <X className="w-4 h-4" />
                     </Button>
                   )}
                 </div>
                 {(uploadPreview.video || newAd.video_url) && (
                   <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                     <video src={uploadPreview.video || newAd.video_url!} controls className="w-full h-full object-cover"></video>
                     {/* ================================== */}
                     {/* HERE IS THE THIRD FIX */}
                     {/* Closed the unclosed className string */}
                     {/* ================================== */}
                     <Badge variant="secondary" className="absolute top-1 left-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm">Video</Badge>
                   </div>
                 )}
              </div>
            </div>
            
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setNewAd({ points: 100, duration: 30, is_active: true, advertiser: 'Internal', target_audience: ['all'], max_views_per_day: 1000, category: 'food' });
              Object.values(uploadPreview).forEach(url => { if (url) URL.revokeObjectURL(url); });
              setUploadedFiles({});
              setUploadPreview({});
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAd}
              disabled={!newAd.title || !newAd.description || loading}
              className="bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
                newAd.id ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />
              )}
              {loading ? "Saving..." : (newAd.id ? "Update Advertisement" : "Create Advertisement")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog (unchanged) */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              Reject Partner Ad Request
            </DialogTitle>
            <DialogDescription>
              {selectedRequestForRejection && (
                <>
                  Rejecting ad request "<span className="font-semibold">{selectedRequestForRejection.ad_title}</span>" from <span className="font-semibold">{selectedRequestForRejection.profiles?.full_name || 'N/A'}</span>
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
                className="mt-2 resize-none rounded-lg"
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-900 rounded-lg p-3">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Note:</strong> The partner will receive this rejection reason in their notification center.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
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
              className="rounded-lg"
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