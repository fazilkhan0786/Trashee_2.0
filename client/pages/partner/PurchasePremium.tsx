import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Crown, Check, Star, TrendingUp, Shield, BarChart, Users, Megaphone, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { safeNavigateBack } from '@/lib/navigation';
import { supabase } from '@/lib/supabase';

export default function PartnerPurchasePremium() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'business',
      name: 'Business Premium',
      price: 599,
      period: 'month',
      popular: false,
      features: [
        'Advanced analytics dashboard',
        'Priority ad placement',
        'Customer insights & demographics',
        'Enhanced coupon visibility',
        'Business performance reports'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Premium',
      price: 4999,
      period: 'year',
      popular: true,
      savings: 'Save ₹2188',
      features: [
        'All Business Premium features',
        'Custom branding options',
        'Dedicated account manager',
        'API access for integrations',
        'White-label solutions',
        'Advanced targeting options',
        'Priority technical support',
        'Custom analytics reports'
      ]
    }
  ];

  const handlePurchase = (planId: string) => {
    setSelectedPlan(planId);
    setShowConfirmModal(true);
  };

  // Save transaction to transaction_history table
  const saveTransaction = async (plan: any) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create transaction record
      const { data, error } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          type: 'premium_purchase', // You may need to add this to your enum constraint
          description: `${plan.name} subscription - ${plan.period}ly`,
          amount: plan.price,
          status: 'completed',
          reference_id: `premium_${plan.id}_${Date.now()}`,
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            billing_period: plan.period,
            features: plan.features,
            purchase_type: 'partner_premium'
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  };

  // Update user profile to mark as premium
  const updateUserPremiumStatus = async (plan: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate premium expiry date
      const expiryDate = new Date();
      if (plan.period === 'month') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (plan.period === 'year') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          premium_plan: plan.id,
          premium_until: expiryDate.toISOString(),
          premium_purchased_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating premium status:', error);
      throw error;
    }
  };

  const confirmPurchase = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) throw new Error('Invalid plan');

      // Save transaction to database
      await saveTransaction(plan);

      // Update user premium status
      await updateUserPremiumStatus(plan);

      console.log('Purchasing plan:', plan);
      alert(`🎉 Successfully upgraded to ${plan.name}! Your business is now Premium!`);
      setShowConfirmModal(false);
      navigate('/partner/home');
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('❌ Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => safeNavigateBack(navigate, '/partner/home')}
            className="p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Business Premium</h1>
              <p className="text-purple-100 text-sm">Scale your business with advanced tools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Overview */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Crown className="w-16 h-16 mx-auto mb-4 text-purple-200" />
              <h2 className="text-2xl font-bold mb-2">Why Business Premium?</h2>
              <p className="text-purple-100">Unlock powerful business tools and insights</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <BarChart className="w-8 h-8 mx-auto mb-2 text-purple-200" />
                <p className="text-sm font-medium">Advanced Analytics</p>
              </div>
              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-purple-200" />
                <p className="text-sm font-medium">Targeted Marketing</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-purple-200" />
                <p className="text-sm font-medium">Priority Support</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-200" />
                <p className="text-sm font-medium">Business Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <div className="p-4 space-y-4">
        <h3 className="text-xl font-bold text-center text-gray-800">Choose Your Business Plan</h3>
        
        {plans.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl animate-in fade-in-50 slide-in-from-bottom-4 duration-700 ${plan.popular ? 'border-2 border-purple-500 scale-105' : 'hover:scale-102'}`}>
            {plan.popular && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-purple-500 text-white">
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
                  <div className="text-3xl font-bold text-purple-600">₹{plan.price}</div>
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
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                } text-white font-semibold py-3`}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Business
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Business Benefits */}
      <div className="p-4">
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader>
            <CardTitle className="text-center">Grow Your Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <BarChart className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium text-purple-800">Advanced Analytics</h4>
                  <p className="text-sm text-purple-600">Track customer behavior, peak hours, and revenue insights</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Megaphone className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-blue-800">Premium Marketing</h4>
                  <p className="text-sm text-blue-600">Featured placement in app, targeted campaigns, and priority visibility</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium text-green-800">Customer Insights</h4>
                  <p className="text-sm text-green-600">Understand your customers better with detailed demographics and preferences</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Stories */}
      <div className="p-4">
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader>
            <CardTitle className="text-center">Success Stories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
                <div>
                  <p className="font-medium text-purple-800">TechStore Plus</p>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-purple-700">"Premium analytics helped us identify peak customer hours and increase sales by 40%!"</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Green Cafe</p>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-blue-700">"The targeted marketing features brought us 200+ new customers in just one month!"</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-purple-800">Confirm Business Upgrade</DialogTitle>
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
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Confirm Upgrade
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
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