import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
  Search,
  ChevronRight,
  HelpCircle // HelpCircle is imported here
} from 'lucide-react';
// --- ADD RECHARTS IMPORTS ---
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  LineChart as RechartsLineChart,
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

// --- Interface for our new stats object ---
interface DashboardStats {
  totalUsers: number;
  totalPartners: number;
  totalBins: number;
  couponsIssued: number;
  dailyScans: number;
  userDistribution: { type: string; count: number }[];
  scanActivity: { day: string; count: number }[];
}

// --- Colors for the Pie Chart ---
const PIE_COLORS: { [key: string]: string } = {
  consumer: '#3b82f6', // blue
  partner: '#10b981', // green
  collector: '#f59e0b', // amber
  admin: '#ef4444', // red
  default: '#8884d8' // default purple
};

// Enhanced Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string; 
  trend?: { value: number; label: string } 
}) => (
  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="bg-white rounded-full p-3 shadow-md">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <Badge variant="outline" className={`${trend.value >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} border-0`}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </Badge>
        )}
      </div>
      <div className="mt-5">
        <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
    </CardContent>
  </Card>
);

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

  // --- State for dashboard data ---
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [previousStats, setPreviousStats] = useState<DashboardStats | null>(null);
  
  const [error, setError] = useState<string | null>(null);

  const notifications = [
    
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleNotificationClick = (notification: any) => {
    // ... (rest of your function)
  };

  // Load user data and dashboard data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 1. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }
        
        // 2. Fetch profile and stats in parallel
        const [profileRes, statsRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.rpc('get_admin_dashboard_stats')
        ]);
        
        // Process admin profile
        const { data: profile, error: profileError } = profileRes;
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error loading admin profile:', profileError);
          setUserData({
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Admin',
            email: user.email || '',
            level: 'Admin',
            profilePicture: user.user_metadata?.avatar_url || '/placeholder.svg'
          });
        } else if (profile) {
          setUserData({
            name: profile.name || profile.full_name || user.email?.split('@')[0] || 'Admin',
            email: user.email || '',
            level: profile.user_type || 'Admin',
            profilePicture: profile.avatar_url || user.user_metadata?.avatar_url || '/placeholder.svg'
          });
        }

        // Process dashboard stats
        const { data: statsData, error: statsError } = statsRes;
        if (statsError) {
          throw new Error(`Failed to fetch dashboard stats: ${statsError.message}`);
        }
        
        // For demo purposes, generate previous stats with 10% less values
        const generatePreviousStats = (current: DashboardStats): DashboardStats => ({
          totalUsers: Math.max(1, Math.round(current.totalUsers * 0.9)),
          totalPartners: Math.max(1, Math.round(current.totalPartners * 0.9)),
          totalBins: Math.max(1, Math.round(current.totalBins * 0.9)),
          couponsIssued: Math.max(1, Math.round(current.couponsIssued * 0.9)),
          dailyScans: Math.max(1, Math.round(current.dailyScans * 0.9)),
          userDistribution: current.userDistribution.map(d => ({
            type: d.type,
            count: Math.max(1, Math.round(d.count * 0.9))
          })),
          scanActivity: current.scanActivity.map(day => ({
            day: day.day,
            count: Math.max(1, Math.round(day.count * 0.9))
          }))
        });
        
        setDashboardStats(statsData);
        setPreviousStats(generatePreviousStats(statsData));

      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
          <div className="mt-8 flex justify-center space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Error Loading Dashboard</h1>
            </div>
            <p className="text-gray-600 mb-6">We encountered an error while loading your dashboard data.</p>
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate trends
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, label: '' };
    const diff = ((current - previous) / previous) * 100;
    return { 
      value: Math.round(diff), 
      label: diff >= 0 ? 'increase' : 'decrease' 
    };
  };

  const trends = {
    users: calculateTrend(dashboardStats?.totalUsers || 0, previousStats?.totalUsers || 0),
    partners: calculateTrend(dashboardStats?.totalPartners || 0, previousStats?.totalPartners || 0),
    bins: calculateTrend(dashboardStats?.totalBins || 0, previousStats?.totalBins || 0),
    coupons: calculateTrend(dashboardStats?.couponsIssued || 0, previousStats?.couponsIssued || 0),
    scans: calculateTrend(dashboardStats?.dailyScans || 0, previousStats?.dailyScans || 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm opacity-80">Welcome back, {userData.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Enhanced Notifications */}
            <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Notifications</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p>No new notifications</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            notification.unread 
                              ? 'bg-blue-50 border-l-4 border-blue-500' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex justify-between">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-gray-500">{notification.time}</p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Enhanced Profile */}
            <Button
              variant="ghost"
              className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full"
              onClick={() => navigate('/admin/profile')}
            >
              <Avatar className="w-10 h-10 border-2 border-white/50">
                <AvatarImage src={userData.profilePicture} alt={userData.name} />
                <AvatarFallback className="bg-blue-600 text-white">{userData.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={dashboardStats?.totalUsers || 0}
            icon={Users}
            color="text-blue-600"
            trend={trends.users}
          />
          
          <StatCard
            title="Partners"
            value={dashboardStats?.totalPartners || 0}
            icon={Users}
            color="text-purple-600"
            trend={trends.partners}
          />
          
          <StatCard
            title="Smart Bins"
            value={dashboardStats?.totalBins || 0}
            icon={Trash2}
            color="text-green-600"
            trend={trends.bins}
          />
          
          <StatCard
            title="Coupons Issued"
            value={dashboardStats?.couponsIssued || 0}
            icon={Gift}
            color="text-yellow-600"
            trend={trends.coupons}
          />
          
          <StatCard
            title="Daily Scans"
            value={dashboardStats?.dailyScans || 0}
            icon={QrCode}
            color="text-orange-600"
            trend={trends.scans}
          />
        </div>

        {/* Enhanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LineChart className="w-5 h-5 text-blue-600" />
                  Scanning Activity (Last 7 Days)
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-sm">
                  Last 7 Days
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardStats?.scanActivity}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#888888" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#e0e0e0' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#e0e0e0' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                      labelStyle={{ fontWeight: 'bold' }}
                      formatter={(value: number) => [value, 'Scans']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorScans)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'white', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="w-5 h-5 text-indigo-600" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={dashboardStats?.userDistribution.map(d => ({ name: d.type, value: d.count }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      labelLine={false}
                      label={({ name, percent }) => 
                        percent > 5 && `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {dashboardStats?.userDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={PIE_COLORS[entry.type.toLowerCase()] || PIE_COLORS.default} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      formatter={(value, entry) => (
                          <span className="text-sm font-medium">{value}</span>
                      )}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Management Center */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-indigo-600" />
              Management Center
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { icon: Gift, label: 'Coupon Management', path: '/admin/coupon-management' },
                { icon: UserPlus, label: 'Assign Collectors', path: '/admin/assign-collectors' },
                { icon: BarChart3, label: 'Ad Management', path: '/admin/ads' },
                { icon: Gift, label: 'Rewards', path: '/admin/rewards' },
                { icon: Users, label: 'Registrations', path: '/admin/registrations' },
                { icon: Trash2, label: 'Bin Management', path: '/admin/bins' },
                { icon: MessageSquare, label: 'Complaints', path: '/admin/complaints' },
                { icon: Users, label: 'User Management', path: '/admin/users' }
              ].map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 border-2 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 bg-white"
                  onClick={() => navigate(item.path)}
                >
                  <item.icon className="w-6 h-6 text-indigo-600" />
                  <span className="text-xs font-medium text-center">{item.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- FOOTER SECTION REMOVED --- */}
      
    </div>
  );
}

// --- TRAILING IMPORT REMOVED ---