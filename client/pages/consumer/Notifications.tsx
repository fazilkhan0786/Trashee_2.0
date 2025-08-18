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
        return <Gift className="w-5 h-5 text-green-600" />;
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
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
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
            <h1 className="text-xl font-bold">Notifications</h1>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading notifications...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}
        
        {/* Action Buttons */}
        {!loading && !error && notifications.length > 0 && (
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={markAllAsRead}
                    className="flex-1"
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllNotifications}
                  className="flex-1"
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
          <div className="space-y-3">
            {notifications.map((notification, index) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-md border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.is_read ? 'bg-blue-50 border-blue-200' : ''
              } animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.type === 'broadcast' ? 'bg-blue-100' :
                    notification.type === 'alert' ? 'bg-orange-100' :
                    notification.type === 'coupon' ? 'bg-green-100' :
                    notification.type === 'reward' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-sm line-clamp-1 ${
                        !notification.is_read ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-2">
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotificationHandler(notification.id);
                          }}
                          className="p-1 h-auto opacity-60 hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>From: {notification.sender}</span>
                        <span>•</span>
                        <span>{new Date(notification.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            notification.priority === 'high' ? 'border-red-200 text-red-600' :
                            notification.priority === 'medium' ? 'border-yellow-200 text-yellow-600' :
                            'border-green-200 text-green-600'
                          }`}
                        >
                          {notification.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                    
                    {notification.action_label && (
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90"
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
              <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                  <p className="text-gray-600 mb-4">
                    You're all caught up! We'll notify you when there's something new.
                  </p>
                  <Button onClick={() => navigate('/consumer/home')}>
                    Back to Home
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Notification Settings */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BellRing className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-800">Notification Settings</h3>
                <p className="text-sm text-purple-600">Customize your notification preferences</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/consumer/profile')}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
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
