import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bell, BellRing, Trash2, CheckCheck, Gift, AlertCircle, Megaphone, Star, Store, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'broadcast' | 'alert' | 'coupon' | 'business' | 'system' | 'sales';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  sender: string;
}

export default function PartnerNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([
    
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
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
      case 'business':
        return <Store className="w-5 h-5 text-purple-600" />;
      case 'sales':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
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
            <h1 className="text-xl font-bold">Partner Notifications</h1>
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
        {/* Action Buttons */}
        {notifications.length > 0 && (
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
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-md border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.isRead ? 'bg-blue-50 border-blue-200' : ''
              } animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notification.type === 'broadcast' ? 'bg-blue-100' :
                    notification.type === 'alert' ? 'bg-orange-100' :
                    notification.type === 'coupon' ? 'bg-green-100' :
                    notification.type === 'business' ? 'bg-purple-100' :
                    notification.type === 'sales' ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-semibold text-sm line-clamp-1 ${
                        !notification.isRead ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 ml-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
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
                        <span>{notification.timestamp}</span>
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
                    
                    {notification.actionLabel && (
                      <div className="mt-3">
                        <Button 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification);
                          }}
                        >
                          {notification.actionLabel}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
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
              <Button onClick={() => navigate('/partner/home')}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Partner Benefits */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BellRing className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-800">Partner Notification Settings</h3>
                <p className="text-sm text-purple-600">Get alerts for sales, coupon approvals, and business opportunities</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/partner/profile')}
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
