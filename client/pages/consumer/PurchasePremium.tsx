import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Crown, Check, Star, Zap, Shield, Gift, Users, Sparkles, Trophy, Target, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { safeNavigateBack } from '@/lib/navigation';
import { supabase } from '@/lib/supabase';

// Create a service for handling premium purchases
class PremiumService {
  static async createOrder(plan: any) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Simulate order creation (in production, this would be a server call)
      return {
        order_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        key_id: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
        user_id: user.id
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async verifyPayment(orderId: string, paymentId: string, signature: string) {
    try {
      // Verify payment signature (simplified for demo)
      // In production, this should be done on server-side
      const isValid = true; // Simplified check
      
      if (isValid) {
        return { success: true };
      } else {
        throw new Error('Invalid payment signature');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  static async saveTransaction(plan: any, paymentData: any) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Save transaction to database
      const { data, error } = await supabase
        .from('transaction_history')
        .insert({
          user_id: user.id,
          type: 'premium_purchase',
          description: `${plan.name} subscription - ${plan.period}ly`,
          amount: plan.price,
          status: 'completed',
          reference_id: paymentData.paymentId,
          metadata: {
            plan_id: plan.id,
            plan_name: plan.name,
            billing_period: plan.period,
            features: plan.features,
            purchase_type: 'consumer_premium',
            razorpay_order_id: paymentData.orderId,
            razorpay_payment_id: paymentData.paymentId,
            razorpay_signature: paymentData.signature
          },
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  static async updatePremiumStatus(plan: any) {
    try {
      // Get current user
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
  }
}

export default function ConsumerPurchasePremium() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('Razorpay script loaded');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
        '3x Points on all scans',
        'Exclusive premium coupons',
        'Priority customer support',
        'Advanced scan history',
        'Premium badge on profile'
      ]
    }
  ];

  const handlePurchase = (planId: string) => {
    setSelectedPlan(planId);
    setShowConfirmModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) throw new Error('Invalid plan');

      // Step 1: Create order
      const orderData = await PremiumService.createOrder(plan);

      // Step 2: Open Razorpay Checkout
      const options = {
        key: orderData.key_id,
        amount: plan.price * 100,
        currency: 'INR',
        name: 'Your App Name',
        description: `Upgrade to ${plan.name}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            // Step 3: Verify payment
            const verifyResult = await PremiumService.verifyPayment(
              orderData.order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verifyResult.success) {
              // Step 4: Save transaction
              await PremiumService.saveTransaction(plan, {
                orderId: orderData.order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });

              // Step 5: Update user premium status
              await PremiumService.updatePremiumStatus(plan);

              // Success: Show success message
              alert(`🎉 Successfully upgraded to ${plan.name}! Welcome to Premium!`);
              setShowConfirmModal(false);
              setLoading(false);
              navigate('/consumer/home');
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            alert('❌ Payment processing failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: 'John Doe',
          email: 'john@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed');
            setLoading(false);
          },
        },
      };

      const rzp: any = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('❌ Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => safeNavigateBack(navigate, '/consumer/home')}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Crown className="w-7 h-7 text-emerald-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Upgrade to Premium</h1>
                <p className="text-emerald-100 text-sm mt-1">Unlock exclusive benefits & maximize your rewards</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Overview */}
      <div className="relative max-w-5xl mx-auto px-4 py-6">
        <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0 shadow-2xl overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full"></div>
          
          <CardContent className="relative p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Rocket className="w-10 h-10 text-emerald-200" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Why Go Premium?</h2>
              <p className="text-emerald-100 text-lg">Supercharge your recycling journey with exclusive benefits</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Zap className="w-8 h-8 text-emerald-200" />
                </div>
                <p className="text-sm font-medium text-emerald-50">3x More Points</p>
                <p className="text-xs text-emerald-200 mt-1">On every scan</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Gift className="w-8 h-8 text-emerald-200" />
                </div>
                <p className="text-sm font-medium text-emerald-50">Extra Scans</p>
                <p className="text-xs text-emerald-200 mt-1">More earning chances</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Target className="w-8 h-8 text-emerald-200" />
                </div>
                <p className="text-sm font-medium text-emerald-50">More Ads</p>
                <p className="text-xs text-emerald-200 mt-1">Extra points from ads</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform backdrop-blur-sm">
                  <Trophy className="w-8 h-8 text-emerald-200" />
                </div>
                <p className="text-sm font-medium text-emerald-50">AI Features</p>
                <p className="text-xs text-emerald-200 mt-1">Early access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Plans */}
      <div className="relative max-w-5xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h3>
          <p className="text-gray-600">Select the plan that works best for you</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative overflow-hidden transition-all hover:shadow-2xl ${
              plan.popular 
                ? 'border-2 border-emerald-500 scale-105 shadow-xl' 
                : 'border-emerald-200 hover:scale-102 shadow-lg'
            }`}>
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4" fill="currentColor" />
                    <span className="text-sm font-semibold">Most Popular</span>
                  </div>
                </div>
              )}
              
              <CardHeader className={`pb-4 ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">{plan.name}</CardTitle>
                    {plan.savings && (
                      <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-0">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-emerald-600">₹{plan.price}</div>
                    <div className="text-sm text-gray-500">per {plan.period}</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={() => handlePurchase(plan.id)}
                  className={`w-full h-12 text-base font-semibold transition-all ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg' 
                      : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-md'
                  } text-white`}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  {plan.popular ? 'Get Premium' : 'Upgrade Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-white rounded-2xl border-0 shadow-2xl max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center">
                <Crown className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-emerald-800">Confirm Upgrade</DialogTitle>
                <DialogDescription className="mt-3 text-gray-600">
                  {selectedPlan && (
                    <span className="text-lg">
                      You're about to upgrade to <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong> for 
                      <span className="text-emerald-600 font-bold"> ₹{plans.find(p => p.id === selectedPlan)?.price}</span>.
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium">{plans.find(p => p.id === selectedPlan)?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Billing:</span>
              <span className="font-medium">₹{plans.find(p => p.id === selectedPlan)?.price} per {plans.find(p => p.id === selectedPlan)?.period}</span>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-col gap-3 mt-4">
            <Button 
              onClick={confirmPurchase}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-base disabled:opacity-50"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Confirm Purchase
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
              disabled={loading}
              className="w-full h-11 text-gray-700 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}