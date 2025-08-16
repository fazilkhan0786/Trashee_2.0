import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  QrCode,
  Trash2,
  Gift,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  UserPlus,
  Settings,
  MoreVertical,
  Bell,
  Search
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    level: 'Admin',
    profilePicture: '/placeholder.svg'
  });
  const [error, setError] = useState(null);

  const notifications = [
    
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
    // Here you would typically mark as read and handle the action
    switch(notification.type) {
      case 'sponsor_request':
        navigate('/admin/ads');
        break;
      case 'complaint':
        navigate('/admin/complaints');
        break;
      case 'partner_approval':
        navigate('/admin/registrations');
        break;
      default:
        break;
    }
    setShowNotifications(false);
  };

  const stats = {
    totalUsers: 0,
    totalPartners: 0,
    totalBins: 0,
    totalComplaints: 0,
    couponsIssued: 0,
    dailyScans: 0,
    weeklyScans: 0
  };

  const leaderboard = {
    topConsumers: [
      
    ],
    topPartners: [
      
    ]
  };

  const recentActivity = [
    
  ];

  const alertsData = [
    
  ];

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
          console.error('Error loading admin profile:', error);
          // Set basic user data from auth if profile fetch fails
          setUserData({
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
            email: user.email || '',
            level: 'Admin',
            profilePicture: user.user_metadata?.avatar_url || '/placeholder.svg'
          });
        } else {
          // Set user data from profile
          setUserData({
            name: profile.name || profile.full_name || user.email?.split('@')[0] || 'Admin',
            email: user.email || '',
            level: profile.user_type || 'Admin',
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
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6 animate-in slide-in-from-top duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {userData.name}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/assign-collectors')}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Assign Collector
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin/coupon-management')}
                className="gap-2"
              >
                <Gift className="w-4 h-4" />
                Coupon Management
              </Button>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                System Online
              </Badge>
              <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>

            {/* Notifications */}
            <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[70vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications ({unreadCount} unread)
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto space-y-3 py-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                        notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`text-sm font-medium ${
                              notification.unread ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <Badge variant={
                              notification.type === 'sponsor_request' ? 'default' :
                              notification.type === 'complaint' ? 'destructive' :
                              notification.type === 'partner_approval' ? 'secondary' :
                              'outline'
                            } className="text-xs">
                              {notification.type === 'sponsor_request' ? 'Ad' :
                               notification.type === 'complaint' ? 'Urgent' :
                               notification.type === 'partner_approval' ? 'Approval' :
                               'Info'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      console.log('Mark all as read');
                      setShowNotifications(false);
                    }}
                  >
                    Mark All as Read
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Profile */}
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => navigate('/admin/profile')}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={userData.profilePicture} alt={userData.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600">{userData.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Alert Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alertsData.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.urgency === 'high' ? 'border-l-red-500 bg-red-50' :
              alert.urgency === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
              'border-l-green-500 bg-green-50'
            } animate-in fade-in-50 slide-in-from-bottom-4 duration-700`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    alert.urgency === 'high' ? 'bg-red-100' :
                    alert.urgency === 'medium' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    {alert.urgency === 'high' ? (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    ) : alert.urgency === 'medium' ? (
                      <Activity className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{alert.title}</h3>
                    <p className="text-xs text-gray-600">{alert.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalPartners}</p>
                  <p className="text-xs text-gray-600">Partners</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalBins}</p>
                  <p className="text-xs text-gray-600">Smart Bins</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalComplaints}</p>
                  <p className="text-xs text-gray-600">Complaints</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-400">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.couponsIssued}</p>
                  <p className="text-xs text-gray-600">Coupons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.dailyScans.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Daily Scans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.weeklyScans.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Weekly Scans</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                Scanning Activity (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Interactive Chart</p>
                  <p className="text-sm">Daily scanning trends and patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <PieChart className="w-12 h-12 mx-auto mb-2" />
                  <p>User Types</p>
                  <p className="text-sm">Consumers vs Partners vs Collectors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Top Consumers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.topConsumers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.scans} scans</p>
                      </div>
                    </div>
                    <Badge variant="outline">{user.points} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                Top Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.topPartners.map((partner, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-sm text-gray-500">{partner.coupons} coupons</p>
                      </div>
                    </div>
                    <Badge variant="outline">{partner.points} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Quick Access */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Management Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/admin/coupon-management')}
              >
                <Gift className="w-6 h-6" />
                <span className="text-sm">Coupon Management</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/admin/assign-collectors')}
              >
                <UserPlus className="w-6 h-6" />
                <span className="text-sm">Assign Collectors</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/admin/ads')}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">Ad Management</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/admin/rewards')}
              >
                <Gift className="w-6 h-6" />
                <span className="text-sm">Rewards</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/admin/registrations')}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Registrations</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/admin/bins')}
              >
                <Trash2 className="w-6 h-6" />
                <span className="text-sm">Bin Management</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/admin/complaints')}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm">Complaints</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/admin/users')}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">User Management</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center`}>
                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}