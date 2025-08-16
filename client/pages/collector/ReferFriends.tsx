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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'joined': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Refer Collector Friends
            </h1>
            <p className="text-sm opacity-90">Invite friends to join and earn rewards together</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.totalReferrals}</p>
                  <p className="text-xs text-gray-500">Total Referred</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.successfulReferrals}</p>
                  <p className="text-xs text-gray-500">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.totalPointsEarned}</p>
                  <p className="text-xs text-gray-500">Points Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.pendingInvites}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.thisMonthReferrals}</p>
                  <p className="text-xs text-gray-500">This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{userStats.rank}</p>
                  <p className="text-xs text-gray-500">Current Rank</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Card */}
        <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-bold">Your Referral Code</h2>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-3xl font-mono font-bold tracking-wider">{referralCode}</div>
                <p className="text-sm opacity-90 mt-2">Share this code with collector friends</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-green-600"
                  onClick={handleCopyCode}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-green-600"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-green-600"
                  onClick={handleShare}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invite Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                <CardContent className="p-6 text-center">
                  <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Send Email Invite</h3>
                  <p className="text-sm text-gray-600">Directly invite friends via email</p>
                </CardContent>
              </Card>
            </DialogTrigger>
          </Dialog>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Share on WhatsApp</h3>
              <p className="text-sm text-gray-600">Send invitation via WhatsApp</p>
            </CardContent>
          </Card>

          <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
                <CardContent className="p-6 text-center">
                  <QrCode className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">QR Code</h3>
                  <p className="text-sm text-gray-600">Show QR code for quick signup</p>
                </CardContent>
              </Card>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Reward Tiers */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Referral Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewardTiers.map((tier, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Coins className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{tier.milestone}</h4>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    +{tier.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1100">
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{referral.friendName}</h4>
                      <p className="text-sm text-gray-600">{referral.friendEmail}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(referral.status)}>
                          {referral.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Referred: {referral.referredAt}
                        </span>
                        {referral.joinedAt && (
                          <span className="text-xs text-gray-500">
                            Joined: {referral.joinedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      +{referral.pointsEarned} pts
                    </div>
                    
                    {/* Milestone Progress */}
                    <div className="flex gap-1 mt-2">
                      {Object.entries(referral.milestones).map(([key, completed], index) => (
                        <div
                          key={key}
                          className={`w-3 h-3 rounded-full ${
                            completed ? 'bg-green-500' : 'bg-gray-200'
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
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No referrals yet</p>
                <p className="text-sm text-gray-400">Start inviting collector friends to earn rewards</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Email Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Send Email Invitation
            </DialogTitle>
            <DialogDescription>
              Invite a friend to join as a waste collector
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="friendName">Friend's Name</Label>
              <Input
                id="friendName"
                placeholder="Enter friend's name"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="friendEmail">Friend's Email</Label>
              <Input
                id="friendEmail"
                type="email"
                placeholder="Enter friend's email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Invitation Preview</h4>
              <p className="text-sm text-blue-700">
                "Join me as a waste collector on Trashee! Use my referral code <strong>{referralCode}</strong> to get started and we both earn bonus points!"
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendInvite}
              disabled={!friendName || !friendEmail}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Invitation
            </DialogTitle>
            <DialogDescription>
              Let friends scan this QR code to join with your referral
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">QR Code</p>
                <p className="text-xs text-gray-400">{referralCode}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>Instructions:</strong> Ask your friend to scan this QR code with their phone camera to automatically join with your referral code.
              </p>
            </div>
          </div>
          
          <DialogFooter className="justify-center">
            <Button onClick={() => setShowQRDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
