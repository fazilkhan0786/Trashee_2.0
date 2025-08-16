import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Bell, CheckCircle, AlertTriangle, Info, Star, Truck, Users, Gift, MapPin, Calendar, Settings, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'route' | 'system' | 'reward' | 'social' | 'urgent' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  data?: any;
}

export default function CollectorNotifications() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([
    
  ]);

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'route', label: 'Route Updates' },
    { value: 'reward', label: 'Rewards' },
    { value: 'social', label: 'Social' },
    { value: 'system', label: 'System' },
    { value: 'promotion', label: 'Promotions' }
  ];

  const readStatus = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread Only' },
    { value: 'read', label: 'Read Only' }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || filterType === '' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || filterRead === '' ||
                       (filterRead === 'unread' && !notification.read) ||
                       (filterRead === 'read' && notification.read);
    return matchesType && matchesRead;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'route': return <MapPin className="w-5 h-5 text-blue-600" />;
      case 'reward': return <Gift className="w-5 h-5 text-green-600" />;
      case 'social': return <Users className="w-5 h-5 text-purple-600" />;
      case 'system': return <Info className="w-5 h-5 text-gray-600" />;
      case 'promotion': return <Star className="w-5 h-5 text-yellow-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'route': return 'bg-blue-100 text-blue-800';
      case 'reward': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'promotion': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notification => 
      ({ ...notification, read: true })
    ));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const stats = {
    totalNotifications: notifications.length,
    unreadCount: notifications.filter(n => !n.read).length,
    urgentCount: notifications.filter(n => n.priority === 'urgent' && !n.read).length,
    todayCount: notifications.filter(n => n.timestamp.startsWith('2024-01-20')).length
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notifications
              {stats.unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {stats.unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-sm opacity-90">Stay updated with important information</p>
          </div>
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white">
                <Settings className="w-5 h-5" />
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalNotifications}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unreadCount}</p>
                  <p className="text-xs text-gray-500">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.urgentCount}</p>
                  <p className="text-xs text-gray-500">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.todayCount}</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {stats.unreadCount > 0 && (
          <Card className="bg-blue-50 border-blue-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800">You have {stats.unreadCount} unread notifications</h3>
                  <p className="text-sm text-blue-600">Stay updated with the latest information</p>
                </div>
                <Button
                  onClick={handleMarkAllAsRead}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark All as Read
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterRead} onValueChange={setFilterRead}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {readStatus.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification, index) => (
            <Card 
              key={notification.id} 
              className={`transition-all duration-300 hover:shadow-lg animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100} ${
                !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Priority Indicator */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(notification.priority)}`} />
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(notification.type)}
                    </div>
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTypeColor(notification.type)} variant="outline">
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              NEW
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            onClick={() => navigate(notification.actionUrl!)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {notification.actionText || 'View'}
                          </Button>
                        )}
                        
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark as Read
                          </Button>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No notifications found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>

      {/* Notification Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Notification Settings
            </DialogTitle>
            <DialogDescription>
              Customize your notification preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Notification Types</h4>
              
              <div className="space-y-2">
                {[
                  { type: 'urgent', label: 'Urgent Alerts', description: 'Emergency collections and high priority tasks' },
                  { type: 'route', label: 'Route Updates', description: 'New routes and route changes' },
                  { type: 'reward', label: 'Rewards & Achievements', description: 'Points earned and milestones reached' },
                  { type: 'social', label: 'Social Activity', description: 'Referral updates and team activities' },
                  { type: 'system', label: 'System Updates', description: 'App updates and maintenance notices' },
                  { type: 'promotion', label: 'Promotions', description: 'Special offers and bonus opportunities' }
                ].map((item) => (
                  <div key={item.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium text-sm">{item.label}</h5>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Delivery Method</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Push Notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Email Notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">SMS Notifications</span>
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettingsDialog(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
