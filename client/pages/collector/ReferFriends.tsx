import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Users, Gift, Copy, Share, Mail, MessageSquare, Trophy, Coins, Target, Calendar, CheckCircle, UserPlus, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Referral {
  id: string;
  friendName: string;
  friendEmail: string;
  status: 'pending' | 'joined' | 'active' | 'completed';
  referredAt: string;
  joinedAt?: string;
  pointsEarned: number;
  milestones: {
    registration: boolean;
    firstCollection: boolean;
    weeklyTarget: boolean;
    monthlyTarget: boolean;
  };
}

export default function CollectorReferFriends() {
  const navigate = useNavigate();
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);

  const [referrals, setReferrals] = useState<Referral[]>([
    
  ]);

  const referralCode = 'COLLECTOR2024XYZ';
  const referralLink = `https://trashee.app/join?ref=${referralCode}`;

  const rewardTiers = [
    { milestone: 'Friend Registers', points: 100, description: 'When your friend signs up as a collector' },
    { milestone: 'First Collection', points: 200, description: 'When they complete their first collection task' },
    { milestone: 'Weekly Target', points: 150, description: 'When they meet weekly collection goals' },
    { milestone: 'Monthly Achievement', points: 250, description: 'When they complete monthly targets' }
  ];

  const userStats = {
    totalReferrals: referrals.length,
    successfulReferrals: referrals.filter(r => r.status === 'completed' || r.status === 'active').length,
    totalPointsEarned: referrals.reduce((sum, r) => sum + r.pointsEarned, 0),
    pendingInvites: referrals.filter(r => r.status === 'pending').length,
    thisMonthReferrals: 2,
    rank: 'Silver Referrer'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'joined': return 'bg-cyan-100 text-cyan-800';
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendInvite = () => {
    if (!friendName || !friendEmail) return;

    const newReferral: Referral = {
      id: `REF-${String(referrals.length + 1).padStart(3, '0')}`,
      friendName,
      friendEmail,
      status: 'pending',
      referredAt: new Date().toISOString().split('T')[0],
      pointsEarned: 0,
      milestones: {
        registration: false,
        firstCollection: false,
        weeklyTarget: false,
        monthlyTarget: false
      }
    };

    setReferrals([...referrals, newReferral]);
    setShowInviteDialog(false);
    setFriendName('');
    setFriendEmail('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Trashee as a Collector',
          text: 'Join me as a waste collector and earn while making a difference!',
          url: referralLink,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-2 text-white hover:bg-white/20 transition-colors rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Users className="w-6 h-6" />
                Refer Collector Friends
              </h1>
              <p className="text-blue-100 mt-1">Invite friends to join and earn rewards together</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4 text-center">
              <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">{userStats.totalReferrals}</p>
              <p className="text-xs text-gray-600">Total Referred</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">{userStats.successfulReferrals}</p>
              <p className="text-xs text-gray-600">Successful</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4 text-center">
              <Coins className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">{userStats.totalPointsEarned}</p>
              <p className="text-xs text-gray-600">Points Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4 text-center">
              <Target className="w-10 h-10 text-orange-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">{userStats.pendingInvites}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4 text-center">
              <Calendar className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">{userStats.thisMonthReferrals}</p>
              <p className="text-xs text-gray-600">This Month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <CardContent className="p-4 text-center">
              <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-xl font-bold">{userStats.rank}</p>
              <p className="text-xs text-gray-600">Current Rank</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Referral Code Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border border-blue-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Your Referral Code</h2>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl font-mono font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
                  {referralCode}
                </div>
                <p className="text-sm opacity-90 mt-2">Share this code with collector friends</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white/20 rounded-full transition-all"
                  onClick={handleCopyCode}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white/20 rounded-full transition-all"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white/20 rounded-full transition-all"
                  onClick={handleShare}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Invite Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow cursor-pointer animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                <CardContent className="p-6 text-center">
                  <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Send Email Invite</h3>
                  <p className="text-sm text-gray-600">Directly invite friends via email</p>
                </CardContent>
              </Card>
            </DialogTrigger>
          </Dialog>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow cursor-pointer animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Share on WhatsApp</h3>
              <p className="text-sm text-gray-600">Send invitation via WhatsApp</p>
            </CardContent>
          </Card>

          <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
            <DialogTrigger asChild>
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow cursor-pointer animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
                <CardContent className="p-6 text-center">
                  <QrCode className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">QR Code</h3>
                  <p className="text-sm text-gray-600">Show QR code for quick signup</p>
                </CardContent>
              </Card>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Enhanced Reward Tiers */}
        <Card className="border border-gray-100 rounded-3xl shadow-md animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Gift className="w-5 h-5 text-blue-600" />
              Referral Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              {rewardTiers.map((tier, index) => (
                <div key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-all rounded-lg">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 shadow-md">
                    <Coins className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{tier.milestone}</h4>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                    +{tier.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Referrals List */}
        <Card className="border border-gray-100 rounded-3xl shadow-md animate-in fade-in-50 slide-in-from-bottom-4 duration-1100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <CardTitle className="text-gray-800">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-all rounded-lg border-b">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{referral.friendName}</h4>
                      <p className="text-sm text-gray-600">{referral.friendEmail}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={`px-3 py-1 rounded-full text-sm ${getStatusColor(referral.status)}`}>
                          {referral.status}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Referred: {referral.referredAt}
                        </span>
                        {referral.joinedAt && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                            Joined: {referral.joinedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold text-green-600">
                      +{referral.pointsEarned} pts
                    </div>
                    
                    {/* Enhanced Milestone Progress */}
                    <div className="flex gap-1 mt-2">
                      {Object.entries(referral.milestones).map(([key, completed], index) => (
                        <div
                          key={key}
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                            completed 
                              ? 'bg-green-500 scale-110' 
                              : 'bg-gray-200 scale-90 hover:scale-100 cursor-pointer'
                          }`}
                          title={key}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {referrals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <Users className="w-20 h-20 text-gray-300 mx-auto mb-6 animate-bounce" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Referrals Yet</h3>
                <p className="text-gray-500 text-lg">Start inviting collector friends to earn rewards</p>
                <Button 
                  onClick={() => setShowInviteDialog(true)}
                  className="mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full py-3 px-6 shadow-md hover:shadow-lg transition-all"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Send Your First Invite
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Email Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl border border-blue-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-800">
              <Mail className="w-5 h-5" />
              Send Email Invitation
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Invite a friend to join as a waste collector
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="friendName" className="text-sm font-medium text-gray-700">
                Friend's Name
              </Label>
              <Input
                id="friendName"
                placeholder="Enter friend's name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <Label htmlFor="friendEmail" className="text-sm font-medium text-gray-700">
                Friend's Email
              </Label>
              <Input
                id="friendEmail"
                type="email"
                placeholder="Enter friend's email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Invitation Preview</h4>
              <div className="bg-white p-4 rounded-lg border border-blue-100">
                <p className="text-sm mb-2">
                  Subject: Invitation to Join Trashee as a Waste Collector
                </p>
                <div className="prose text-sm">
                  <p>Hello {friendName || 'there'},</p>
                  <p>Join me as a waste collector on Trashee! We're making a difference in our community while earning rewards.</p>
                  <p>Use my referral code: <strong className="text-blue-600">{referralCode}</strong></p>
                  <p>Sign up now: {referralLink}</p>
                  <p>Looking forward to collecting with you!</p>
                  <p>Best regards,<br/>{/* In a real app, this would be the user's name */}</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between p-4 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="text-gray-600 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvite}
              disabled={!friendName || !friendEmail}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl border border-purple-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-800">
              <QrCode className="w-5 h-5" />
              QR Code Invitation
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Let friends scan this QR code to join with your referral
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-6 p-4">
            <div className="w-64 h-64 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center border border-dashed border-gray-200">
              <QrCode className="w-32 h-32 text-gray-400 animate-pulse" />
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Your Referral Code</h4>
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                {referralCode}
              </div>
              <p className="text-sm text-gray-600 mt-2">Scan this QR code to join with your referral</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-800 mb-2">How to use:</h4>
              <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1">
                <li>Open camera app on your friend's phone</li>
                <li>Point camera at this QR code</li>
                <li>Tap the link that appears</li>
                <li>Sign up using the referral code</li>
              </ol>
            </div>
          </div>
          
          <DialogFooter className="flex justify-center p-4 border-t border-gray-100">
            <Button 
              onClick={() => setShowQRDialog(false)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}