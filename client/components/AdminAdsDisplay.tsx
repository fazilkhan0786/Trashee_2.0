import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminAdvertisement, getActiveAds, trackAdClick, trackAdImpression } from '@/lib/adsService';
import { ExternalLink, X, Crown, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminAdsDisplayProps {
  userType: 'consumers' | 'partners' | 'collectors';
  placement: 'home_top' | 'home_bottom' | 'dashboard' | 'global';
  className?: string;
}

export default function AdminAdsDisplay({ userType, placement, className = '' }: AdminAdsDisplayProps) {
  const navigate = useNavigate();
  const [ads, setAds] = useState<AdminAdvertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [dismissedAds, setDismissedAds] = useState<string[]>([]);

  useEffect(() => {
    const activeAds = getActiveAds(userType, placement);
    const nonDismissedAds = activeAds.filter(ad => !dismissedAds.includes(ad.id));
    setAds(nonDismissedAds);
    
    // Track impressions for all visible ads
    nonDismissedAds.forEach(ad => trackAdImpression(ad.id));
  }, [userType, placement, dismissedAds]);

  useEffect(() => {
    // Rotate ads every 10 seconds if there are multiple ads
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const handleAdClick = (ad: AdminAdvertisement) => {
    trackAdClick(ad.id);
    if (ad.linkUrl) {
      if (ad.linkUrl.startsWith('http')) {
        window.open(ad.linkUrl, '_blank');
      } else {
        navigate(ad.linkUrl);
      }
    }
  };

  const handleDismissAd = (adId: string) => {
    setDismissedAds(prev => [...prev, adId]);
  };

  const getAdGradient = (userType: string, priority: string) => {
    if (priority === 'high') {
      switch (userType) {
        case 'consumers': return 'from-green-500 to-emerald-600';
        case 'partners': return 'from-purple-500 to-indigo-600';
        case 'collectors': return 'from-blue-500 to-cyan-600';
        default: return 'from-gray-500 to-gray-600';
      }
    } else {
      switch (userType) {
        case 'consumers': return 'from-green-400 to-emerald-500';
        case 'partners': return 'from-purple-400 to-indigo-500';
        case 'collectors': return 'from-blue-400 to-cyan-500';
        default: return 'from-gray-400 to-gray-500';
      }
    }
  };

  const getAdIcon = (userType: string) => {
    switch (userType) {
      case 'consumers': return Crown;
      case 'partners': return TrendingUp;
      case 'collectors': return Zap;
      default: return Crown;
    }
  };

  if (ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentAdIndex];
  const AdIcon = getAdIcon(userType);

  return (
    <div className={`bg-white border-b border-gray-100 animate-in slide-in-from-top duration-700 delay-300 ${className}`}>
      <div className="p-4">
        <div className={`bg-gradient-to-r ${getAdGradient(userType, currentAd.priority)} rounded-lg p-4 text-white relative overflow-hidden`}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-white/20 text-white">
                {currentAd.advertiser}
              </Badge>
              <button 
                onClick={() => handleDismissAd(currentAd.id)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-start gap-3">
              <AdIcon className="w-6 h-6 text-white/90 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">{currentAd.title}</h3>
                <p className="text-sm text-white/90 mb-3 line-clamp-2">
                  {currentAd.description}
                </p>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {currentAd.linkUrl && (
                    <Button 
                      size="sm" 
                      className="bg-white text-gray-800 hover:bg-white/90"
                      onClick={() => handleAdClick(currentAd)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Learn More
                    </Button>
                  )}
                  
                  {currentAd.endDate && (
                    <span className="text-xs text-white/80">
                      Valid till {new Date(currentAd.endDate).toLocaleDateString()}
                    </span>
                  )}
                  
                  {currentAd.priority === 'high' && (
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      Priority
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
          
          {/* Ad rotation indicator */}
          {ads.length > 1 && (
            <div className="absolute bottom-2 right-2 flex gap-1">
              {ads.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentAdIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
