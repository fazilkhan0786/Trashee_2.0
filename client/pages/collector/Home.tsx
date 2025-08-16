import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Truck,
  CheckCircle,
  Target,
  Zap,
  X
} from 'lucide-react';

export default function CollectorHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    level: 'Collector',
    points: 0,
    profilePicture: '/placeholder.svg'
  });

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
          console.error('Error loading collector profile:', error);
          // Set basic user data from auth if profile fetch fails
          setUserData({
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Collector',
            email: user.email || '',
            level: 'Collector',
            points: 0,
            profilePicture: user.user_metadata?.avatar_url || '/placeholder.svg'
          });
        } else {
          // Set user data from profile
          setUserData({
            name: profile.name || profile.full_name || user.email?.split('@')[0] || 'Collector',
            email: user.email || '',
            level: profile.user_type || 'Collector',
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
          <p className="text-gray-600">Loading Collector Dashboard...</p>
        </div>
      </div>
    );
  }

  const rewardPoints = userData.points;
  const weeklyScans = 15;
  const weeklyCollections = 8;
  const lastScan = {
    binId: 'BIN-123',
    timestamp: '2024-01-15 11:20 AM'
  };

  const scanHistory = [
   
  ];

  const ads = [
   
  ];

  const quickActions = [
    { icon: QrCode, label: 'QR Scanner', href: '/collector/scanner', color: 'bg-green-500' },
    { icon: MapPin, label: 'Map & Routes', href: '/collector/map', color: 'bg-blue-500' },
    { icon: Gift, label: 'Coupon Store', href: '/collector/coupons', color: 'bg-purple-500' },
    { icon: Truck, label: 'Collect Trash', href: '/collector/collect-trash', color: 'bg-orange-500' },
    { icon: Play, label: 'Watch Ads', href: '/collector/ads', color: 'bg-red-500' },
    { icon: Users, label: 'Refer Friends', href: '/collector/refer', color: 'bg-pink-500' },
    { icon: Wallet, label: 'My Wallet', href: '/collector/wallet', color: 'bg-indigo-500' },
    { icon: Bell, label: 'Notifications', href: '/collector/notifications', color: 'bg-yellow-500' },
    { icon: User, label: 'Profile', href: '/collector/profile', color: 'bg-gray-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Admin-Controlled Ad Section */}
      <AdminAdsDisplay
        userType="collectors"
        placement="home_top"
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 animate-in slide-in-from-top duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to="/collector/profile" className="relative group">
              <Avatar className="w-12 h-12 border-2 border-white hover:border-green-200 transition-colors cursor-pointer">
                <AvatarImage src={userData.profilePicture} alt="Profile" />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Hello, {userData.name}!</h1>
              <p className="text-green-100 text-sm">Collector • Route Manager</p>
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
                <Truck className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-orange-800">{weeklyCollections}</span>
              </div>
              <p className="text-sm text-orange-600">Collections</p>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-800">98%</span>
              </div>
              <p className="text-sm text-green-600">Efficiency</p>
            </CardContent>
          </Card>
        </div>

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
                  <span className="text-xl font-bold text-blue-800">0</span>
                </div>
                <p className="text-sm text-blue-600">Total Scans</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                  <span className="text-xl font-bold text-orange-800">0</span>
                </div>
                <p className="text-sm text-orange-600">Collections</p>
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
              onClick={() => {
                try {
                  navigate('/collector/scan-history');
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.href = '/collector/scan-history';
                }
              }}
            >
              View All History
            </Button>
          </CardContent>
        </Card>

        {/* Admin Ads Section - Scrollable Carousel */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Collector Updates
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
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
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
            <CardTitle className="text-lg">Collector Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <div className="flex flex-col items-center p-3 border rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-primary/20">
                    <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center mb-2 transition-transform hover:scale-110`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-center line-clamp-2">{action.label}</span>
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
