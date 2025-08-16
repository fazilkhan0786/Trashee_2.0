import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, X, Star, Zap, Gift, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumPopupProps {
  userType: 'consumer' | 'partner';
}

export default function PremiumPopup({ userType }: PremiumPopupProps) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if user has seen the popup during this session
    const sessionKey = `premium-popup-session-${userType}`;
    const hasSeenThisSession = sessionStorage.getItem(sessionKey);

    if (!hasSeenThisSession) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userType]);

  const handleUpgrade = () => {
    // Mark as shown for this session
    sessionStorage.setItem(`premium-popup-session-${userType}`, 'true');
    setShowPopup(false);
    navigate(`/${userType}/purchase-premium`);
  };

  const handleClose = () => {
    // Mark as shown for this session
    sessionStorage.setItem(`premium-popup-session-${userType}`, 'true');
    setShowPopup(false);
  };

  const consumerContent = {
    title: '🎉 Unlock Premium Benefits!',
    subtitle: 'Earn 5x more points and get exclusive rewards',
    benefits: [
      { icon: Zap, text: '5x Points on every scan' },
      { icon: Gift, text: 'Exclusive premium coupons' },
      { icon: Star, text: 'Priority customer support' }
    ],
    price: 'Starting at ₹199/month',
    buttonText: 'Upgrade to Premium'
  };

  const partnerContent = {
    title: '🚀 Grow Your Business!',
    subtitle: 'Advanced tools to scale your business',
    benefits: [
      { icon: TrendingUp, text: 'Advanced analytics dashboard' },
      { icon: Star, text: 'Priority ad placement' },
      { icon: Gift, text: 'Enhanced visibility' }
    ],
    price: 'Starting at ₹599/month',
    buttonText: 'Upgrade Business'
  };

  const content = userType === 'consumer' ? consumerContent : partnerContent;

  return (
    <Dialog open={showPopup} onOpenChange={setShowPopup}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Crown className={`w-6 h-6 ${userType === 'consumer' ? 'text-yellow-600' : 'text-purple-600'}`} />
              <DialogTitle className="text-lg font-bold">{content.title}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hero Section */}
          <div className={`p-4 rounded-lg bg-gradient-to-r ${
            userType === 'consumer' 
              ? 'from-yellow-500 to-orange-500' 
              : 'from-purple-500 to-blue-500'
          } text-white text-center`}>
            <Crown className="w-12 h-12 mx-auto mb-2 text-white" />
            <p className="text-sm font-medium">{content.subtitle}</p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  userType === 'consumer' ? 'bg-yellow-100' : 'bg-purple-100'
                }`}>
                  <benefit.icon className={`w-4 h-4 ${
                    userType === 'consumer' ? 'text-yellow-600' : 'text-purple-600'
                  }`} />
                </div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">{content.price}</p>
            <Button 
              onClick={handleUpgrade}
              className={`w-full ${
                userType === 'consumer'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
              } text-white font-semibold`}
            >
              <Crown className="w-4 h-4 mr-2" />
              {content.buttonText}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 text-xs"
            >
              Maybe later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
