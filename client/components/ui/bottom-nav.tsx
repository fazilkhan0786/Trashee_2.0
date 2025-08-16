import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  QrCode, 
  MapPin, 
  Gift, 
  User,
  Trash2,
  MessageSquare,
  Plus,
  CreditCard
} from 'lucide-react';

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
}

interface BottomNavProps {
  userType: 'consumer' | 'partner' | 'collector' | 'admin';
}

const navItems: Record<string, NavItem[]> = {
  consumer: [
    { icon: Home, label: 'Home', path: '/consumer/home' },
    { icon: QrCode, label: 'Scanner', path: '/consumer/scanner' },
    { icon: MapPin, label: 'Map', path: '/consumer/map' },
    { icon: Gift, label: 'Coupons', path: '/consumer/coupons' },
    { icon: User, label: 'Profile', path: '/consumer/profile' }
  ],
  partner: [
    { icon: Home, label: 'Home', path: '/partner/home' },
    { icon: QrCode, label: 'Scanner', path: '/partner/scanner' },
    { icon: MapPin, label: 'Map', path: '/partner/map' },
    { icon: Plus, label: 'Add Coupon', path: '/partner/add-coupon' },
    { icon: User, label: 'Profile', path: '/partner/profile' }
  ],
  collector: [
    { icon: Home, label: 'Home', path: '/collector/home' },
    { icon: QrCode, label: 'Scanner', path: '/collector/scanner' },
    { icon: MapPin, label: 'Map', path: '/collector/map' },
    { icon: Trash2, label: 'Collect', path: '/collector/collect-trash' },
    { icon: User, label: 'Profile', path: '/collector/profile' }
  ],
  admin: [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Gift, label: 'Coupons', path: '/admin/coupon-management' },
    { icon: MapPin, label: 'Bins', path: '/admin/bins' },
    { icon: MessageSquare, label: 'Complaints', path: '/admin/complaints' },
    { icon: User, label: 'Profile', path: '/admin/profile' }
  ]
};

export default function BottomNav({ userType }: BottomNavProps) {
  const location = useLocation();
  const items = navItems[userType] || [];

  const handleNavClick = (path: string) => {
    try {
      // Check if we're already on this path to prevent unnecessary navigation
      if (location.pathname === path) {
        return;
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-around">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-0 flex-1 hover:scale-105 active:scale-95",
                isActive
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-600 hover:text-primary hover:bg-primary/10"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-1", isActive ? "text-white" : "")} />
              <span className={cn(
                "text-xs font-medium truncate",
                isActive ? "text-white" : ""
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
