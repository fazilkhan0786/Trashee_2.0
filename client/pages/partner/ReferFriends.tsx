import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Share, Users, Coins, Gift, MessageCircle, Send, CheckCircle, TrendingUp, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PartnerReferFriends() {
  const navigate = useNavigate();
  const [referralCode] = useState('TRASHEE2024MP');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Mock data for partner referral stats
  const referralStats = {
    totalInvites: 0,
    successfulSignups: 0,
    pointsEarned: 0, // 5 points per 10 signups (partially completed)
    pendingPoints: 0, // Points for remaining signups to reach next reward
    level: 'Broonze Partner Referrer'
  };

  const recentReferrals = [
    
  ];

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral code');
    }
  };

  const shareViaWhatsApp = () => {
    const message = `🌟 Join Trashee earn rewards! Join me on Trashee - the smart waste management platform.\n\n✅ Earn points for every scan\n✅ Create coupons for customers\n✅ Build your green reputation\n\nUse my partner referral code: ${referralCode}\n\nDownload now and start earning!`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const shareViaTelegram = () => {
    const message = `Join Trashee! Earn rewards while going green. Use code: ${referralCode}`;
    const url = `https://t.me/share/url?url=&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Join Trashee ';
    const body = `Hi!\n\nI've been partnering with Trashee and it's been amazing for my business!\n\nTrashee helps businesses:\n• Earn rewards for eco-friendly practices\n• Create attractive coupons for customers\n• Build a green brand reputation\n• Connect with environmentally conscious customers\n\nUse my partner referral code: ${referralCode}\n\nYou'll get bonus points when you sign up, and I'll earn points too when you complete your first activities.\n\nLet's build a greener business community together! 🌱\n\nDownload Trashee now!`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url);
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
          <div>
            <h1 className="text-xl font-bold">Partner Referrals</h1>
            <p className="text-sm text-gray-500">Invite businesses and earn enhanced rewards</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Partner Benefits Banner */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-800">Partner Advantage</h3>
                <p className="text-sm text-purple-600">Earn 10 points for partner referrals, 5 points for consumer referrals</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                Enhanced
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code Card */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Your Partner Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="bg-white rounded-lg p-4 mb-4 border-2 border-dashed border-green-300">
                <p className="text-2xl font-bold text-green-700 tracking-wider">{referralCode}</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Share this code with other businesses and individual users
              </p>
              <Button 
                onClick={copyReferralCode}
                className={`${copySuccess ? 'bg-green-600' : 'bg-primary'} hover:bg-primary/90`}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Stats */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Partner Referral Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-800">{referralStats.totalInvites}</span>
                </div>
                <p className="text-sm text-blue-600">Total Invites</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-800">{referralStats.successfulSignups}</span>
                </div>
                <p className="text-sm text-green-600">Successful Signups</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <span className="text-xl font-bold text-yellow-800">{referralStats.pointsEarned}</span>
                </div>
                <p className="text-sm text-yellow-600">Points Earned</p>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {referralStats.level}
                </Badge>
                <p className="text-xs text-yellow-600 mt-1">
                  {referralStats.pendingPoints} points to next tier
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Options */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Share className="w-5 h-5 text-purple-600" />
              Share with Businesses & Friends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={shareViaWhatsApp}
                variant="outline"
                className="h-16 flex-col gap-2 hover:bg-green-50 hover:border-green-200"
              >
                <MessageCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm">WhatsApp</span>
              </Button>
              
              <Button 
                onClick={shareViaTelegram}
                variant="outline"
                className="h-16 flex-col gap-2 hover:bg-blue-50 hover:border-blue-200"
              >
                <Send className="w-6 h-6 text-blue-600" />
                <span className="text-sm">Telegram</span>
              </Button>
              
              <Button 
                onClick={shareViaEmail}
                variant="outline"
                className="h-16 flex-col gap-2 hover:bg-gray-50 hover:border-gray-300"
              >
                <Send className="w-6 h-6 text-gray-600" />
                <span className="text-sm">Email</span>
              </Button>
              
              <Button 
                variant="outline"
                className="h-16 flex-col gap-2 hover:bg-purple-50 hover:border-purple-200"
              >
                <Share className="w-6 h-6 text-purple-600" />
                <span className="text-sm">More</span>
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                💡 <strong>Partner Tip:</strong> Business referrals earn double points!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
          <CardHeader className="pb-3">
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReferrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      referral.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {referral.type === 'Partner' ? (
                        <Store className="w-5 h-5 text-green-600" />
                      ) : (
                        <Users className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{referral.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {referral.type}
                        </Badge>
                        <span className="text-sm text-gray-500">{referral.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                      {referral.status}
                    </Badge>
                    {referral.points > 0 && (
                      <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                        <Coins className="w-3 h-3" />
                        <span>+{referral.points}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Gift className="w-5 h-5" />
              Partner Referral Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-green-700">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <p>Share your unique partner referral code with businesses and individuals</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <p>They sign up using your code and start their green journey</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <p>Earn 10 points for partner signups, 5 points for consumer signups</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
