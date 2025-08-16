import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PremiumPopup from '@/components/PremiumPopup';
import AdminAdsDisplay from '@/components/AdminAdsDisplay';
import WheelOfSpin from '@/components/WheelOfSpin';
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
  X,
  Crown
} from 'lucide-react';

export default function ConsumerHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    level: 'Level 1',
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
          navigate('/login');
          return;
        }
        
        // Get user profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        // Handle case where profiles table might not exist yet
        if (error) {
          console.error('Error fetching profile:', error);
          // Still set user data from auth metadata if available
          if (error.code !== 'PGRST116') {
            setUserData(prev => ({
              ...prev,
              name: user.user_metadata?.name || 'User',
              points: 0
            }));
            return;
          }
        }
        
        // Update user data with user information
        setUserData(prev => ({
          ...prev,
          name: profile?.name || user.user_metadata?.name || 'User',
          points: profile?.points || 0,
          profilePicture: profile?.avatar_url || user.user_metadata?.avatar_url || '/placeholder.svg'
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
        // Set default values in case of error
        setUserData(prev => ({
          ...prev,
          name: 'User',
          points: 0
        }));
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [navigate]);

  const safeNavigate = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = path;
    }
  };
  const rewardPoints = userData.points || 1250;
  const weeklyScans = 0;
  const lastScan = {
    
  };

  const scanHistory = [
    
  ];

  const ads = [
    
  ];

  const quickActions = [
    { icon: QrCode, label: 'QR Scanner', href: '/consumer/scanner', color: 'bg-green-500' },
    { icon: MapPin, label: 'Bin Map', href: '/consumer/map', color: 'bg-blue-500' },
    { icon: Gift, label: 'Coupon Store', href: '/consumer/coupons', color: 'bg-purple-500' },
    { icon: Crown, label: 'Purchase Premium', href: '/consumer/purchase-premium', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
    { icon: Play, label: 'Watch Ads', href: '/consumer/ads', color: 'bg-red-500' },
    { icon: Users, label: 'Refer Friends', href: '/consumer/refer', color: 'bg-orange-500' },
    { icon: Wallet, label: 'My Wallet', href: '/consumer/wallet', color: 'bg-indigo-500' },
    { icon: Bell, label: 'Notifications', href: '/consumer/notifications', color: 'bg-pink-500' },
    { icon: User, label: 'Profile', href: '/consumer/profile', color: 'bg-gray-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PremiumPopup userType="consumer" />
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 animate-in slide-in-from-top duration-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to="/consumer/profile" className="relative group">
              <Avatar className="w-12 h-12 border-2 border-white hover:border-green-200 transition-colors cursor-pointer">
                <AvatarImage src={userData.profilePicture} alt="Profile" />
                <AvatarFallback>{userData.name ? userData.name.charAt(0) : 'U'}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Hello, {loading ? '...' : userData.name}!</h1>
              <p className="text-green-100 text-sm">Consumer • {userData.level}</p>
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
      <AdminAdsDisplay userType="consumers" placement="home_top" />

      <div className="p-4 space-y-6">
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
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-800">{weeklyScans}</span>
                </div>
                <p className="text-sm text-blue-600">This Week</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-800">0</span>
                </div>
                <p className="text-sm text-purple-600">Total Scans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wheel of Spin */}
        <WheelOfSpin />

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
              onClick={() => safeNavigate('/consumer/scan-history')}
            >
              View All History
            </Button>
          </CardContent>
        </Card>

        {/* Ads Section */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Featured Offers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ads.map((ad) => (
                <Link key={ad.id} to={ad.link}>
                  <div className="border rounded-lg p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 hover:border-primary/20">
                    <div className="flex items-center gap-3">
                      {ad.type === 'image' ? (
                        <img 
                          src={ad.image} 
                          alt={ad.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                          <ExternalLink className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{ad.title}</h3>
                        {ad.description && (
                          <p className="text-sm text-gray-500">{ad.description}</p>
                        )}
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">All Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 hover:border-primary/20">
                    <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-2 transition-transform hover:scale-110 ${action.label === 'Purchase Premium' ? 'shadow-lg' : ''}`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-medium text-center ${action.label === 'Purchase Premium' ? 'text-yellow-600 font-bold' : ''}`}>
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
