import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, BellRing, Trash2, CheckCheck, Gift, AlertCircle, Megaphone, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllNotifications, Notification } from '@/lib/notificationsService';
import { supabase } from '@/lib/supabase';

// Using the Notification interface from notificationsService
export default function ConsumerNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from Supabase
  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }
        
        const { success, data, error } = await getUserNotifications(user.id);
        
        if (!success || error) {
          console.error('Error fetching notifications:', error);
          setError('Failed to load notifications. Please try again');
          return;
        }
        
        setNotifications(data || []);
      } catch (err) {
        console.error('Unexpected error loading notifications:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadNotifications();
  }, [navigate]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    try {
      const { success, error } = await markNotificationAsRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
      } else {
        console.error('Error marking notification as read:', error);
      }
    } catch (err) {
      console.error('Unexpected error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { success, error } = await markAllNotificationsAsRead(user.id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, is_read: true }))
        );
      } else {
        console.error('Error marking all notifications as read:', error);
      }
    } catch (err) {
      console.error('Unexpected error marking all notifications as read:', err);
    }
  };

  const deleteNotificationHandler = async (id: string) => {
    try {
      const { success, error } = await deleteNotification(id);
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      } else {
        console.error('Error deleting notification:', error);
      }
    } catch (err) {
      console.error('Unexpected error deleting notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { success, error } = await deleteAllNotifications(user.id);
      if (success) {
        setNotifications([]);
      } else {
        console.error('Error clearing all notifications:', error);
      }
    } catch (err) {
      console.error('Unexpected error clearing all notifications:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'broadcast':
        return <Megaphone className="w-5 h-5 text-blue-600" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'coupon':
        return <Gift className="w-5 h-5 text-emerald-600" />;
      case 'reward':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'system':
        return <Bell className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-rose-500';
      case 'medium':
        return 'border-l-amber-500';
      case 'low':
        return 'border-l-emerald-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'broadcast':
        return 'bg-blue-50 border-blue-200';
      case 'alert':
        return 'bg-orange-50 border-orange-200';
      case 'coupon':
        return 'bg-emerald-50 border-emerald-200';
      case 'reward':
        return 'bg-yellow-50 border-yellow-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white pb-20">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-green-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-xl">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <BellRing className="w-6 h-6" />
                </div>
                Notifications
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-white/20 text-white border-0 animate-pulse">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto p-4 space-y-6">
        {/* Loading and Error States */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
            <p className="text-emerald-700 font-medium">Loading notifications...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl">
            <p className="font-medium mb-3">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-rose-700 border-rose-200 hover:bg-rose-50"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}
        
        {/* Action Buttons */}
        {!loading && !error && notifications.length > 0 && (
          <Card className="border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all"
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllNotifications}
                  className="h-12 border-rose-200 text-rose-700 hover:bg-rose-50 transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.is_read ? 'bg-emerald-50/50 border-emerald-200' : ''
              } ${getNotificationTypeColor(notification.type)} border rounded-2xl overflow-hidden animate-in fade-in-50 slide-in-from-bottom-4`}
              onClick={() => handleNotificationClick(notification)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    notification.type === 'broadcast' ? 'bg-blue-100' :
                    notification.type === 'alert' ? 'bg-orange-100' :
                    notification.type === 'coupon' ? 'bg-emerald-100' :
                    notification.type === 'reward' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className={`font-bold text-lg line-clamp-1 ${
                        !notification.is_read ? 'text-emerald-900' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-3 ml-4">
                        {!notification.is_read && (
                          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotificationHandler(notification.id);
                          }}
                          className="p-2 h-auto opacity-60 hover:opacity-100 hover:bg-rose-50 rounded-full"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 line-clamp-2 mb-4 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {notification.sender}
                        </span>
                        <span>•</span>
                        <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            notification.priority === 'high' ? 'border-rose-200 text-rose-700 bg-rose-50' :
                            notification.priority === 'medium' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                            'border-emerald-200 text-emerald-700 bg-emerald-50'
                          }`}
                        >
                          {notification.priority}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs capitalize ${
                            notification.type === 'coupon' ? 'bg-emerald-100 text-emerald-700' :
                            notification.type === 'reward' ? 'bg-yellow-100 text-yellow-700' :
                            notification.type === 'broadcast' ? 'bg-blue-100 text-blue-700' :
                            notification.type === 'alert' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                    
                    {notification.action_label && (
                      <div className="mt-4">
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                        >
                          {notification.action_label}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
            
            {notifications.length === 0 && (
              <Card className="border-emerald-100 shadow-lg rounded-2xl overflow-hidden animate-in fade-in-50 slide-in-from-bottom-4">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">No Notifications</h3>
                  <p className="text-emerald-600 mb-6 max-w-md mx-auto">
                    You're all caught up! We'll notify you when there's something new.
                  </p>
                  <Button 
                    onClick={() => navigate('/consumer/home')}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                  >
                    Back to Home
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Notification Settings */}
        <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BellRing className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">Notification Settings</h3>
                <p className="text-purple-100">Customize your notification preferences</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/consumer/profile')}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}