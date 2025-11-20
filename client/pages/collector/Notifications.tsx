import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, BellRing, Trash2, CheckCheck, Gift, AlertCircle, Megaphone, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllNotifications, Notification } from '@/lib/notificationsService';
import { supabase } from '@/lib/supabase';

// Using the Notification interface from notificationsService
export default function CollectorNotifications() {
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

  const timeAgo = (iso?: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20 transition-colors rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <BellRing className="w-6 h-6" />
              Notifications
            </h1>
            <p className="text-blue-100 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-white border-white/30 hover:bg-white/10">
              <CheckCheck className="w-4 h-4 mr-2" /> Mark all
            </Button>
            <Button variant="ghost" size="sm" onClick={() => clearAllNotifications()} className="text-white hover:bg-white/10">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-blue-700 font-medium">Loading notifications...</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-500" />
              <div>
                <p className="font-medium">{error}</p>
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions card */}
        {!loading && !error && notifications.length > 0 && (
          <Card className="rounded-3xl shadow-lg border-0 bg-white">
            <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="flex-1">
                <p className="text-sm text-gray-600">Quick actions</p>
                <h3 className="font-semibold text-lg text-gray-800">Manage notifications</h3>
              </div>
              <div className="flex gap-3">
                {unreadCount > 0 && (
                  <Button onClick={markAllAsRead} variant="outline" className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4" /> Mark all read
                  </Button>
                )}
                <Button onClick={clearAllNotifications} variant="ghost" className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Clear all
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications list */}
        {!loading && !error && (
          <>
            {notifications.length === 0 ? (
              <Card className="rounded-3xl shadow-md border-0">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Bell className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Notifications</h3>
                  <p className="text-gray-600 mb-4">You're all caught up — we'll notify you when there's something new.</p>
                  <Button onClick={() => navigate('/collector/home')}>Back to Home</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <Card
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`cursor-pointer rounded-2xl shadow-sm overflow-hidden transition transform hover:shadow-lg ${
                      !notification.is_read ? 'bg-blue-50 ring-1 ring-blue-100' : 'bg-white'
                    } ${getPriorityColor(notification.priority)}`}
                    style={{ borderLeftWidth: '4px', animationDelay: `${index * 50}ms` }}
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
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className={`font-semibold text-sm truncate ${!notification.is_read ? 'text-blue-900' : 'text-gray-900'}`}>
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 truncate">{notification.message}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <div className="text-xs text-gray-500">{timeAgo(notification.created_at)}</div>

                              <div className="flex items-center gap-2">
                                {!notification.is_read && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs">NEW</span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); deleteNotificationHandler(notification.id); }}
                                  className="p-1 h-auto opacity-60 hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{notification.sender}</span>
                              <span>•</span>
                              <span className="capitalize">{notification.type}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${notification.priority === 'high' ? 'border-red-200 text-red-600' : notification.priority === 'medium' ? 'border-yellow-200 text-yellow-600' : 'border-green-200 text-green-600'}`}>
                                {notification.priority}
                              </Badge>
                            </div>
                          </div>

                          {notification.action_label && (
                            <div className="mt-3">
                              <Button size="sm" onClick={(e) => { e.stopPropagation(); handleNotificationClick(notification); }} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                                {notification.action_label}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Notification Settings */}
        <Card className="rounded-3xl shadow-lg border-0 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
              <BellRing className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-800">Notification Settings</h3>
              <p className="text-sm text-purple-600">Customize when and how you'd like to receive updates</p>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={() => navigate('/collector/profile')} className="border-purple-200 text-purple-600 hover:bg-purple-50">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}