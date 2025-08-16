import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Share, Users, Coins, Gift, MessageCircle, Send, CheckCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConsumerReferFriends() {
  const navigate = useNavigate();
  const [referralCode] = useState('TRASHEE2024JD');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Mock data for referral stats
  const referralStats = {
    totalInvites: 0,
    successfulSignups: 0,
    pointsEarned: 0, // 5 points per 10 signups (partially completed)
    pendingPoints: 0, // Points for remaining signups to reach next reward
    level: 'Bronze Referrer'
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
    const message = `Hey! Join me on Trashee - the smart waste management app where you earn points for being eco-friendly! 🌱♻️\n\nUse my referral code: ${referralCode}\n\nDownload now and start earning rewards for every scan!`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const shareViaTelegram = () => {
    const message = `Join me on Trashee - earn points for eco-friendly actions! Use code: ${referralCode}`;
    const url = `https://t.me/share/url?url=&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'Join Trashee and Earn Rewards!';
    const body = `Hi!\n\nI've been using Trashee - an amazing app where you earn points for scanning trash bins and being eco-friendly!\n\nUse my referral code: ${referralCode}\n\nYou'll get bonus points when you sign up, and I'll earn points too when you complete your first 10 scans.\n\nLet's make the world greener together! 🌱\n\nDownload Trashee now!`;
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
            <h1 className="text-xl font-bold">Refer Friends</h1>
            <p className="text-sm text-gray-500">Earn 5 points per 10 successful signups</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Referral Code Card */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="bg-white rounded-lg p-4 mb-4 border-2 border-dashed border-green-300">
                <p className="text-2xl font-bold text-green-700 tracking-wider">{referralCode}</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Share this unique code with friends and family
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
              Referral Statistics
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
                  {referralStats.pendingPoints} points to next reward
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
              Share with Friends
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
                💡 <strong>Tip:</strong> Personal messages get better response rates!
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
                      {referral.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Users className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{referral.name}</p>
                      <p className="text-sm text-gray-500">{referral.date}</p>
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
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Gift className="w-5 h-5" />
              How Referrals Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-purple-700">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">1</span>
              </div>
              <p>Share your unique referral code with friends and family</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">2</span>
              </div>
              <p>They sign up using your code and start scanning bins</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">3</span>
              </div>
              <p>You earn 5 points for every 10 successful signups using your code</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
