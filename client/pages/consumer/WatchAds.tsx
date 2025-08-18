import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause, Clock, Coins, Eye, Gift, CheckCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAdvertisements, recordAdView, canWatchMoreAds, Advertisement } from '@/lib/advertisementsService';
import { supabase } from '@/lib/supabase';

// Using the Advertisement interface from advertisementsService
export default function ConsumerWatchAds() {
  const navigate = useNavigate();
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchedAds, setWatchedAds] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [availableAds, setAvailableAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const maxAdsPerDay = 5; // Consumer limit
  const pointsPerAd = 5;

  // Load advertisements from Supabase
  useEffect(() => {
    async function loadAdvertisements() {
      try {
        setLoading(true);
        setError(null);
        
        const { success, data, error } = await getAdvertisements();
        
        if (!success || error) {
          console.error('Error fetching advertisements:', error);
          setError('Failed to load advertisements. Please try again');
          return;
        }
        
        setAvailableAds(data || []);
      } catch (err) {
        console.error('Unexpected error loading advertisements:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadAdvertisements();
  }, []);

  // Check user's ad watching status
  useEffect(() => {
    async function checkAdStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { success, canWatch, adsWatched, adsRemaining } = await canWatchMoreAds(user.id);
        if (success) {
          setWatchedAds(adsWatched);
          setEarnedPoints(adsWatched * pointsPerAd);
        }
      } catch (err) {
        console.error('Error checking ad status:', err);
      }
    }
    
    checkAdStatus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentAd && progress < 100) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + (100 / currentAd.duration);
          if (newProgress >= 100) {
            setIsPlaying(false);
            setIsCompleted(true);
            return 100;
          }
          return newProgress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentAd, progress]);

  const startWatchingAd = (ad: Advertisement) => {
    setCurrentAd(ad);
    setProgress(0);
    setIsCompleted(false);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const completeAd = async () => {
    if (isCompleted && currentAd) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert('You must be logged in to earn points');
          return;
        }

        const { success, error } = await recordAdView(currentAd.id, user.id);
        if (success) {
          setWatchedAds(prev => prev + 1);
          setEarnedPoints(prev => prev + currentAd.points);
          setCurrentAd(null);
          setProgress(0);
          setIsCompleted(false);
        } else {
          console.error('Error recording ad view:', error);
          alert('Failed to record ad view. Please try again.');
        }
      } catch (err) {
        console.error('Unexpected error completing ad:', err);
        alert('An unexpected error occurred. Please try again.');
      }
    }
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
            <h1 className="text-xl font-bold">Watch Ads to Earn</h1>
            <p className="text-sm text-gray-500">Earn {pointsPerAd} points per ad</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading advertisements...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Daily Progress */}
        {!loading && !error && (
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ads Watched:</span>
              <Badge variant="secondary">{watchedAds} / {maxAdsPerDay}</Badge>
            </div>
            
            <Progress value={(watchedAds / maxAdsPerDay) * 100} className="h-3" />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-green-600" />
                  <span className="text-xl font-bold text-green-800">{earnedPoints}</span>
                </div>
                <p className="text-sm text-green-600">Points Earned</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Gift className="w-4 h-4 text-blue-600" />
                  <span className="text-xl font-bold text-blue-800">{maxAdsPerDay - watchedAds}</span>
                </div>
                <p className="text-sm text-blue-600">Ads Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Ad Player */}
        {currentAd && (
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-red-600" />
                Now Playing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Player Simulation */}
              <div className="relative bg-gray-900 rounded-lg aspect-video overflow-hidden">
                <img 
                  src={currentAd.thumbnail}
                  alt={currentAd.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Button
                    onClick={togglePlayPause}
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white/90 hover:bg-white text-black"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8 ml-1" />
                    )}
                  </Button>
                </div>
                
                {/* Progress overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 text-white text-sm mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{Math.round((progress / 100) * currentAd.duration)}s / {currentAd.duration}s</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>

              {/* Ad Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">{currentAd.title}</h3>
                  <p className="text-sm text-gray-600">{currentAd.description}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">By: {currentAd.advertiser}</span>
                    <Badge variant="outline">{currentAd.category}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <Coins className="w-4 h-4" />
                    <span className="font-medium">+{currentAd.points} points</span>
                  </div>
                </div>
              </div>

              {/* Complete Button */}
              {isCompleted && (
                <Button 
                  onClick={completeAd}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Claim {currentAd.points} Points
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Available Ads */}
        {!loading && !error && !currentAd && (maxAdsPerDay - watchedAds) > 0 && (
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            <CardHeader className="pb-3">
              <CardTitle>Available Ads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableAds.map((ad) => (
                  <div key={ad.id} className="flex items-center gap-4 p-3 border rounded-lg hover:shadow-md transition-shadow">
                    <img 
                      src={ad.thumbnail}
                      alt={ad.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{ad.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{ad.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>By {ad.advertiser}</span>
                        <span>•</span>
                        <span>{ad.duration}s</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 text-green-600">
                          <Coins className="w-3 h-3" />
                          <span>+{ad.points}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => startWatchingAd(ad)}
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Limit Reached */}
        {(maxAdsPerDay - watchedAds) <= 0 && !currentAd && (
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Daily Limit Reached!</h3>
              <p className="text-gray-600 mb-4">
                You've watched {maxAdsPerDay} ads today and earned {earnedPoints} points.
              </p>
              <p className="text-sm text-gray-500">
                Come back tomorrow for more earning opportunities!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Consumer Benefits */}
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-800">Consumer Plan</h3>
                <p className="text-sm text-blue-600">Watch up to {maxAdsPerDay} ads daily to earn points</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
