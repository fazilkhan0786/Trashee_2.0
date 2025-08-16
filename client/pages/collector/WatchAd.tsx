import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Play, Pause, RotateCcw, Gift, Coins, Clock, Target, BarChart, Trophy, Video, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  duration: number;
  pointsReward: number;
  category: 'fuel' | 'equipment' | 'insurance' | 'training' | 'general';
  advertiser: string;
  thumbnailUrl: string;
  available: boolean;
  cooldownTime?: number;
}

export default function CollectorWatchAd() {
  const navigate = useNavigate();
  const [watchedAds, setWatchedAds] = useState<string[]>([]);
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const [showAdPlayer, setShowAdPlayer] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  const [advertisements] = useState<Advertisement[]>([
    
  ]);

  const userStats = {
    totalAdsWatched: 0,
    totalPointsEarned: 0,
    todayAdsWatched: 0,
    todayPointsEarned: 0,
    streak: 0,
    averageDaily: 0
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fuel': return '⛽';
      case 'equipment': return '🛡️';
      case 'insurance': return '🏥';
      case 'training': return '📚';
      case 'general': return '📱';
      default: return '📺';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fuel': return 'bg-orange-100 text-orange-800';
      case 'equipment': return 'bg-blue-100 text-blue-800';
      case 'insurance': return 'bg-green-100 text-green-800';
      case 'training': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleWatchAd = (ad: Advertisement) => {
    setCurrentAd(ad);
    setShowAdPlayer(true);
    setAdProgress(0);
    setIsPlaying(true);
  };

  const handleAdComplete = () => {
    if (!currentAd) return;

    setWatchedAds(prev => [...prev, currentAd.id]);
    setEarnedPoints(currentAd.pointsReward);
    setShowAdPlayer(false);
    setShowRewardDialog(true);
    setIsPlaying(false);
    setAdProgress(0);
  };

  // Simulate ad progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentAd && showAdPlayer) {
      interval = setInterval(() => {
        setAdProgress(prev => {
          const newProgress = prev + (100 / currentAd.duration);
          if (newProgress >= 100) {
            handleAdComplete();
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentAd, showAdPlayer]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 animate-in slide-in-from-top duration-500">
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
              <Video className="w-6 h-6" />
              Watch Ads & Earn
            </h1>
            <p className="text-sm opacity-90">Earn points by watching targeted advertisements</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Video className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.totalAdsWatched}</p>
                  <p className="text-xs text-gray-500">Total Watched</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
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

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.todayAdsWatched}</p>
                  <p className="text-xs text-gray-500">Today Watched</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.todayPointsEarned}</p>
                  <p className="text-xs text-gray-500">Today Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.streak}</p>
                  <p className="text-xs text-gray-500">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.averageDaily}</p>
                  <p className="text-xs text-gray-500">Daily Average</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Challenge */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-800">Daily Challenge</h3>
                <p className="text-sm text-purple-600">Watch 3 more ads to complete today's challenge</p>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '67%' }} />
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                2/3 Complete
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Available Advertisements */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Available Advertisements</h2>
          
          {advertisements.map((ad, index) => (
            <Card key={ad.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100} ${!ad.available ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 relative">
                    <img 
                      src={ad.thumbnailUrl} 
                      alt={ad.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <Badge 
                      className={`absolute top-2 left-2 text-xs ${getCategoryColor(ad.category)}`}
                    >
                      {getCategoryIcon(ad.category)} {ad.category}
                    </Badge>
                  </div>

                  {/* Ad Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{ad.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                        <p className="text-xs text-gray-500 mt-2">by {ad.advertiser}</p>
                      </div>
                      
                      <div className="text-right">
                        <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                          <Coins className="w-3 h-3 mr-1" />
                          +{ad.pointsReward} points
                        </Badge>
                        <div className="text-xs text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {ad.duration}s
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="text-xs text-gray-500">
                        Category: {ad.category} | Duration: {ad.duration} seconds
                      </div>
                      
                      {ad.available ? (
                        <Button
                          onClick={() => handleWatchAd(ad)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Watch Ad
                        </Button>
                      ) : (
                        <div className="text-center">
                          <Badge variant="outline" className="text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            Cooldown Active
                          </Badge>
                          <div className="text-xs text-gray-400 mt-1">
                            Available in 2h 30m
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1200">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Video className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-2">Watch Ads</h4>
                <p className="text-sm text-gray-600">Choose from targeted advertisements relevant to collectors</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold mb-2">Earn Points</h4>
                <p className="text-sm text-gray-600">Get rewarded with points for each ad you watch completely</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-2">Redeem Rewards</h4>
                <p className="text-sm text-gray-600">Use your points to get discounts on equipment and services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Player Dialog */}
      <Dialog open={showAdPlayer} onOpenChange={setShowAdPlayer}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              {currentAd?.title}
            </DialogTitle>
            <DialogDescription>
              Watch the complete ad to earn {currentAd?.pointsReward} points
            </DialogDescription>
          </DialogHeader>
          
          {currentAd && (
            <div className="space-y-4">
              {/* Video Player Simulation */}
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
                <div className="text-white text-center">
                  <Video className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-semibold">{currentAd.title}</p>
                  <p className="text-sm opacity-75">{currentAd.description}</p>
                </div>
                
                {/* Progress Bar */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div 
                      className="bg-white h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${adProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2 text-white text-xs">
                    <span>{Math.floor((adProgress / 100) * currentAd.duration)}s</span>
                    <span>{currentAd.duration}s</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={adProgress >= 100}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>

              {/* Ad Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Points to Earn:</p>
                    <p className="text-sm text-gray-600">by {currentAd.advertiser}</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Coins className="w-4 h-4 mr-1" />
                    +{currentAd.pointsReward} points
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdPlayer(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reward Dialog */}
      <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl">
              <Gift className="w-6 h-6 text-yellow-500" />
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-base mt-4">
              You've successfully watched the advertisement and earned points!
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-6">
            <div className="w-24 h-24 bg-yellow-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <Coins className="w-12 h-12 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              +{earnedPoints} Points
            </div>
            <p className="text-sm text-gray-600">
              Points have been added to your wallet
            </p>
          </div>
          
          <DialogFooter className="justify-center">
            <Button 
              onClick={() => setShowRewardDialog(false)}
              className="bg-yellow-500 hover:bg-yellow-600 px-8"
            >
              <Zap className="w-4 h-4 mr-2" />
              Awesome!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
