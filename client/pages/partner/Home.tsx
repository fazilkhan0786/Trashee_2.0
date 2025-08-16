import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PremiumPopup from '@/components/PremiumPopup';
import AdminAdsDisplay from '@/components/AdminAdsDisplay';
import {
  Coins,
  QrCode,
  MapPin,
  Gift,
  Play,
  Users,
  Wallet,
  Bell,
  User,
  Calendar,
  TrendingUp,
  ExternalLink,
  Store,
  Plus,
  Eye,
  Star,
  Target,
  X,
  Megaphone,
  Send,
  Upload,
  DollarSign,
  Crown
} from 'lucide-react';

export default function PartnerHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    level: 'Partner',
    points: 0,
    profilePicture: '/placeholder.svg'
  });

  const rewardPoints = userData.points;
  const weeklyScans = 12;
  const adViews = 340;
  const lastScan = {
    binId: 'BIN-005',
    timestamp: '2024-01-15 16:45',
    location: 'Downtown Mall, Level 1'
  };

  const scanHistory = [
    
  ];

  const ads = [
    
  ];

  const quickActions = [
    { icon: QrCode, label: 'QR Scanner', href: '/partner/scanner', color: 'bg-green-500' },
    { icon: MapPin, label: 'Map & Shop', href: '/partner/map', color: 'bg-blue-500' },
    { icon: Gift, label: 'Coupon Store', href: '/partner/coupons', color: 'bg-purple-500' },
    { icon: Crown, label: 'Purchase Premium', href: '/partner/purchase-premium', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
    { icon: Plus, label: 'Add Coupon', href: '/partner/add-coupon', color: 'bg-orange-500' },
    { icon: Play, label: 'Watch Ads', href: '/partner/ads', color: 'bg-red-500' },
    { icon: Users, label: 'Refer Friends', href: '/partner/refer', color: 'bg-pink-500' },
    { icon: Wallet, label: 'My Wallet', href: '/partner/wallet', color: 'bg-indigo-500' },
    { icon: Bell, label: 'Notifications', href: '/partner/notifications', color: 'bg-yellow-500' },
    { icon: User, label: 'Profile', href: '/partner/profile', color: 'bg-gray-500' }
  ];

  const [showSponsorDialog, setShowSponsorDialog] = useState(false);
  const [sponsorFormData, setSponsorFormData] = useState({
    adTitle: '',
    adDescription: '',
    budget: '',
    duration: '',
    targetAudience: '',
    businessCategory: '',
    additionalNotes: ''
  });

  const handleSponsorFormChange = (field: string, value: string) => {
    try {
      setSponsorFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } catch (error) {
      console.error('Form update error:', error);
    }
  };

  const handleSponsorSubmit = () => {
    try {
      if (!sponsorFormData.adTitle || !sponsorFormData.adDescription) {
        alert('Please fill in the required fields (Title and Description)');
        return;
      }

      console.log('Sponsor ad request submitted:', sponsorFormData);
      alert('🎯 Your sponsor ad request has been submitted to admin for review! You will receive a notification once it\'s approved.');
      setShowSponsorDialog(false);
      setSponsorFormData({
        adTitle: '',
        adDescription: '',
        budget: '',
        duration: '',
        targetAudience: '',
        businessCategory: '',
        additionalNotes: ''
      });
    } catch (error) {
      console.error('Submit error:', error);
      alert('Error submitting request. Please try again.');
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }
        
        // Get user profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading partner profile:', error);
          // Set basic user data from auth if profile fetch fails
          setUserData({
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Partner',
            email: user.email || '',
            level: 'Partner',
            points: 0,
            profilePicture: user.user_metadata?.avatar_url || '/placeholder.svg'
          });
        } else {
          // Set user data from profile
          setUserData({
            name: profile.name || profile.full_name || user.email?.split('@')[0] || 'Partner',
            email: user.email || '',
            level: profile.user_type || 'Partner',
            points: profile.points || 0,
            profilePicture: profile.avatar_url || user.user_metadata?.avatar_url || '/placeholder.svg'
          });
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Partner Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PremiumPopup userType="partner" />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 animate-in slide-in-from-top duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to="/partner/profile" className="relative group">
              <Avatar className="w-12 h-12 border-2 border-white hover:border-green-200 transition-colors cursor-pointer">
                <AvatarImage src={userData.profilePicture} alt="Profile" />
                <AvatarFallback>MP</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-xl font-bold">{userData.name}</h1>
              <p className="text-green-100 text-sm">{userData.level} • Green Electronics Store</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-yellow-300" />
              <span className="text-2xl font-bold">{rewardPoints.toLocaleString()}</span>
            </div>
            <p className="text-green-100 text-sm">Reward Points</p>
          </div>
        </div>
      </div>

      {/* Admin-Controlled Ad Section */}
      <AdminAdsDisplay userType="partners" placement="home_top" />

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-800">{weeklyScans}</span>
              </div>
              <p className="text-sm text-blue-600">Weekly Scans</p>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-800">{adViews}</span>
              </div>
              <p className="text-sm text-purple-600">Ad Views</p>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-800">4.8</span>
              </div>
              <p className="text-sm text-yellow-600">Shop Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Sponsor Your Ad Feature */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sponsor Your Ad</h3>
                  <p className="text-sm text-gray-600">Get your business displayed on smart trash bins across the city</p>
                </div>
              </div>
              <Dialog open={showSponsorDialog} onOpenChange={setShowSponsorDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Send className="w-4 h-4 mr-2" />
                    Request Sponsorship
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-purple-600" />
                      Sponsor Ad Request
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="adTitle">Ad Title *</Label>
                      <Input
                        id="adTitle"
                        placeholder="Enter your ad title"
                        value={sponsorFormData.adTitle}
                        onChange={(e) => handleSponsorFormChange('adTitle', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="adDescription">Ad Description *</Label>
                      <Textarea
                        id="adDescription"
                        placeholder="Describe your ad content and message"
                        value={sponsorFormData.adDescription}
                        onChange={(e) => handleSponsorFormChange('adDescription', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget">Budget (₹)</Label>
                        <Input
                          id="budget"
                          type="number"
                          placeholder="5000"
                          value={sponsorFormData.budget}
                          onChange={(e) => handleSponsorFormChange('budget', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Select onValueChange={(value) => handleSponsorFormChange('duration', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-week">1 Week</SelectItem>
                            <SelectItem value="2-weeks">2 Weeks</SelectItem>
                            <SelectItem value="1-month">1 Month</SelectItem>
                            <SelectItem value="3-months">3 Months</SelectItem>
                            <SelectItem value="6-months">6 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="businessCategory">Business Category</Label>
                      <Select onValueChange={(value) => handleSponsorFormChange('businessCategory', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                          <SelectItem value="fashion">Fashion & Clothing</SelectItem>
                          <SelectItem value="health-beauty">Health & Beauty</SelectItem>
                          <SelectItem value="home-garden">Home & Garden</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="targetAudience">Target Audience</Label>
                      <Input
                        id="targetAudience"
                        placeholder="e.g., Young professionals, Families, Students"
                        value={sponsorFormData.targetAudience}
                        onChange={(e) => handleSponsorFormChange('targetAudience', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="additionalNotes">Additional Notes</Label>
                      <Textarea
                        id="additionalNotes"
                        placeholder="Any special requirements or additional information"
                        value={sponsorFormData.additionalNotes}
                        onChange={(e) => handleSponsorFormChange('additionalNotes', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-xs text-blue-800">
                          <p className="font-medium">Pricing Information:</p>
                          <p>• Standard bins: ₹500/week per bin</p>
                          <p>• Premium locations: ₹800/week per bin</p>
                          <p>• Bulk discounts available for 10+ bins</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSponsorSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <Send className="w-4 h-4 mr-2" />
                        Submit Request
                      </Button>
                      <Button variant="outline" onClick={() => setShowSponsorDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>High visibility locations</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>Targeted audience reach</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Boost your business</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Scan Info */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="w-5 h-5 text-green-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Last Scanned Bin</p>
                <p className="text-sm text-green-600">{lastScan.binId}</p>
                <p className="text-xs text-gray-500">{lastScan.timestamp}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                +15 Points
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xl font-bold text-blue-800">185</span>
                </div>
                <p className="text-sm text-blue-600">Total Scans</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Store className="w-4 h-4 text-purple-600" />
                  <span className="text-xl font-bold text-purple-800">8</span>
                </div>
                <p className="text-sm text-purple-600">Active Coupons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan History */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Scan History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scanHistory.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{scan.id}</p>
                      <p className="text-sm text-gray-500">{scan.date} at {scan.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    +{scan.points}
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/partner/scan-history')}
            >
              View All History
            </Button>
          </CardContent>
        </Card>

        {/* Admin Ads Section - Scrollable Carousel */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              Partner Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ads.map((ad) => (
                <Link key={ad.id} to={ad.link}>
                  <div className="border rounded-lg p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:border-primary/20">
                    <div className="flex items-center gap-3">
                      {ad.type === 'image' || ad.type === 'video' ? (
                        <div className="relative">
                          <img 
                            src={ad.image} 
                            alt={ad.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          {ad.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                              <Play className="w-6 h-6 text-white" fill="white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                          <ExternalLink className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{ad.title}</h3>
                          <Badge variant={ad.priority === 'high' ? 'destructive' : ad.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                            {ad.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{ad.description}</p>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Features Access */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Partner Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <div className="flex flex-col items-center p-3 border rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-primary/20">
                    <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center mb-2 transition-transform hover:scale-110 ${action.label === 'Purchase Premium' ? 'shadow-lg' : ''}`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs font-medium text-center line-clamp-2 ${action.label === 'Purchase Premium' ? 'text-yellow-600 font-bold' : ''}`}>
                      {action.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
