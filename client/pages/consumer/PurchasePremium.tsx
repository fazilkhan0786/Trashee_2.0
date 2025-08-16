import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Crown, Check, Star, Zap, Shield, Gift, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { safeNavigateBack } from '@/lib/navigation';

export default function ConsumerPurchasePremium() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const plans = [
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: 199,
      period: 'month',
      popular: false,
      features: [
        '3x Points on all scans',
        'Exclusive premium coupons',
        'Priority customer support',
        'Advanced scan history',
        'Premium badge on profile'
      ]
    },
    {
      id: 'yearly',
      name: 'Premium Yearly',
      price: 1999,
      period: 'year',
      popular: true,
      savings: 'Save ₹390',
      features: [
        '5x Points on all scans',
        'All premium coupons access',
        'Priority customer support',
        'Advanced analytics',
        'Premium badge on profile',
        'Exclusive events access',
        'Early access to new features'
      ]
    }
  ];

  const handlePurchase = (planId: string) => {
    setSelectedPlan(planId);
    setShowConfirmModal(true);
  };

  const confirmPurchase = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan) {
      console.log('Purchasing plan:', plan);
      alert(`🎉 Successfully upgraded to ${plan.name}! Welcome to Premium!`);
      setShowConfirmModal(false);
      navigate('/consumer/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => safeNavigateBack(navigate, '/consumer/home')}
            className="p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Upgrade to Premium</h1>
              <p className="text-yellow-100 text-sm">Unlock exclusive benefits & earn more points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Overview */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-200" />
              <h2 className="text-2xl font-bold mb-2">Why Go Premium?</h2>
              <p className="text-yellow-100">Maximize your rewards and enjoy exclusive benefits</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-200" />
                <p className="text-sm font-medium">5x More Points</p>
              </div>
              <div className="text-center">
                <Gift className="w-8 h-8 mx-auto mb-2 text-yellow-200" />
                <p className="text-sm font-medium">Exclusive Coupons</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-yellow-200" />
                <p className="text-sm font-medium">Priority Support</p>
              </div>
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-200" />
                <p className="text-sm font-medium">Early Access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <div className="p-4 space-y-4">
        <h3 className="text-xl font-bold text-center text-gray-800">Choose Your Plan</h3>
        
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl animate-in fade-in-50 slide-in-from-bottom-4 duration-700 ${plan.popular ? 'border-2 border-yellow-500 scale-105' : 'hover:scale-102'}`}>
            {plan.popular && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-yellow-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-800">{plan.name}</CardTitle>
                  {plan.savings && (
                    <Badge variant="destructive" className="mt-1">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-600">₹{plan.price}</div>
                  <div className="text-sm text-gray-500">per {plan.period}</div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => handlePurchase(plan.id)}
                className={`w-full ${plan.popular 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                } text-white font-semibold py-3`}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Testimonials */}
      <div className="p-4">
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader>
            <CardTitle className="text-center">What Premium Users Say</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">R</span>
                </div>
                <div>
                  <p className="font-medium text-green-800">Rahul S.</p>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-green-700">"Premium is amazing! I earn 5x more points and got exclusive coupons worth ₹2000+"</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Priya M.</p>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-blue-700">"The priority support is incredible. My issues get resolved within minutes!"</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-yellow-800">Confirm Upgrade</DialogTitle>
                <DialogDescription className="mt-2">
                  {selectedPlan && (
                    <span>
                      You're about to upgrade to {plans.find(p => p.id === selectedPlan)?.name} for ₹{plans.find(p => p.id === selectedPlan)?.price}.
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button 
              onClick={confirmPurchase}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Confirm Purchase
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
