import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Star, Gift, Coins, Trophy, Zap, Clock, Target, Sparkles, RotateCcw, Crown, Users, ShoppingBag, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WheelSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  icon: string;
  type: 'points' | 'discount' | 'coupon' | 'freebie';
}

interface SpinResult {
  segment: WheelSegment;
  message: string;
  claimed: boolean;
}

export default function ConsumerWheelOfLuck() {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(3);
  const [lastSpinTime, setLastSpinTime] = useState<Date | null>(null);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState<number>(0);

  const wheelSegments: WheelSegment[] = [
    { id: '1', label: 'Points', value: 50, color: '#22c55e', icon: 'coins', type: 'points' },
    { id: '2', label: 'Discount', value: 15, color: '#3b82f6', icon: 'percentage', type: 'discount' },
    { id: '3', label: 'Points', value: 100, color: '#f59e0b', icon: 'coins', type: 'points' },
    { id: '4', label: 'Coupon', value: 1, color: '#ef4444', icon: 'gift', type: 'coupon' },
    { id: '5', label: 'Points', value: 25, color: '#8b5cf6', icon: 'coins', type: 'points' },
    { id: '6', label: 'Freebie', value: 1, color: '#ec4899', icon: 'shopping', type: 'freebie' },
    { id: '7', label: 'Points', value: 200, color: '#06b6d4', icon: 'coins', type: 'points' },
    { id: '8', label: 'Try Again', value: 0, color: '#6b7280', icon: 'rotate', type: 'points' }
  ];

  const recentWinners = [
    { name: 'Sarah M.', prize: '200 Points', time: '1 min ago', avatar: '👩' },
    { name: 'John D.', prize: '20% Discount', time: '3 min ago', avatar: '👨' },
    { name: 'Lisa K.', prize: 'Free Coffee', time: '6 min ago', avatar: '👩‍🦰' },
    { name: 'Alex R.', prize: '150 Points', time: '10 min ago', avatar: '👦' }
  ];

  const dailyQuests = [
    { task: 'Scan 3 QR codes', reward: '1 Free Spin', progress: 2, target: 3, completed: false },
    { task: 'Redeem 1 coupon', reward: '2 Free Spins', progress: 0, target: 1, completed: false },
    { task: 'Refer a friend', reward: '5 Free Spins', progress: 0, target: 1, completed: false }
  ];

  const userStats = {
    totalSpins: 89,
    totalWinnings: 4250,
    biggestWin: 500,
    currentStreak: 7,
    todaySpins: 2
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastSpinTime) {
        const timeDiff = Date.now() - lastSpinTime.getTime();
        const cooldownTime = 6 * 60 * 60 * 1000; // 6 hours for consumers
        const remaining = Math.max(0, cooldownTime - timeDiff);
        setTimeUntilNextSpin(remaining);
        
        if (remaining === 0 && spinsLeft === 0) {
          setSpinsLeft(3);
          setLastSpinTime(null);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastSpinTime, spinsLeft]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const spinWheel = () => {
    if (isSpinning || spinsLeft === 0) return;

    setIsSpinning(true);
    setSpinsLeft(prev => prev - 1);
    setLastSpinTime(new Date());

    // Random rotation between 1440 and 2160 degrees (4-6 full rotations)
    const randomRotation = Math.random() * 720 + 1440;
    const finalRotation = rotation + randomRotation;
    
    setRotation(finalRotation);

    // Calculate which segment was landed on
    const segmentAngle = 360 / wheelSegments.length;
    const normalizedRotation = finalRotation % 360;
    const segmentIndex = Math.floor((360 - normalizedRotation + segmentAngle / 2) / segmentAngle) % wheelSegments.length;
    const wonSegment = wheelSegments[segmentIndex];

    setTimeout(() => {
      setIsSpinning(false);
      
      let message = '';
      switch (wonSegment.type) {
        case 'points':
          message = wonSegment.value > 0 
            ? `Awesome! You won ${wonSegment.value} points! 🎉`
            : 'Better luck next time! Keep spinning for more chances! 🍀';
          break;
        case 'discount':
          message = `Amazing! You won ${wonSegment.value}% discount on your next purchase! 💸`;
          break;
        case 'coupon':
          message = 'Fantastic! You won a premium coupon! Check your wallet! 🎫';
          break;
        case 'freebie':
          message = 'Incredible! You won a free item from our partner stores! 🆓';
          break;
      }

      setSpinResult({
        segment: wonSegment,
        message,
        claimed: false
      });
      setShowResultDialog(true);
    }, 3000);
  };

  const claimPrize = () => {
    if (!spinResult) return;
    
    console.log('Claiming prize:', spinResult.segment);
    setSpinResult(prev => prev ? { ...prev, claimed: true } : null);
    setShowResultDialog(false);
  };

  const getIconForSegment = (iconType: string) => {
    switch (iconType) {
      case 'coins': return <Coins className="w-4 h-4" />;
      case 'gift': return <Gift className="w-4 h-4" />;
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      case 'percentage': return <Percent className="w-4 h-4" />;
      case 'rotate': return <RotateCcw className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 animate-in slide-in-from-top duration-500">
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
              <Sparkles className="w-6 h-6" />
              Wheel of Luck
            </h1>
            <p className="text-sm opacity-90">Spin for amazing rewards!</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{userStats.totalSpins}</div>
              <div className="text-xs text-gray-500">Total Spins</div>
            </CardContent>
          </Card>
          
          <Card className="text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{userStats.totalWinnings}</div>
              <div className="text-xs text-gray-500">Points Won</div>
            </CardContent>
          </Card>
          
          <Card className="text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{userStats.biggestWin}</div>
              <div className="text-xs text-gray-500">Biggest Win</div>
            </CardContent>
          </Card>
          
          <Card className="text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{userStats.currentStreak}</div>
              <div className="text-xs text-gray-500">Win Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Wheel Container */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
          <CardContent className="p-6">
            <div className="relative w-80 h-80 mx-auto">
              {/* Wheel */}
              <div 
                className={`w-full h-full rounded-full border-8 border-white shadow-2xl transition-transform duration-3000 ease-out ${
                  isSpinning ? 'animate-spin' : ''
                }`}
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(${wheelSegments.map((segment, index) => 
                    `${segment.color} ${index * (360 / wheelSegments.length)}deg ${(index + 1) * (360 / wheelSegments.length)}deg`
                  ).join(', ')})`
                }}
              >
                {/* Wheel Segments with Text */}
                {wheelSegments.map((segment, index) => {
                  const angle = (360 / wheelSegments.length) * index;
                  const textAngle = angle + (360 / wheelSegments.length) / 2;
                  return (
                    <div
                      key={segment.id}
                      className="absolute w-full h-full flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        transform: `rotate(${textAngle}deg)`,
                        transformOrigin: 'center'
                      }}
                    >
                      <div 
                        className="flex flex-col items-center"
                        style={{ transform: 'translateY(-30px)' }}
                      >
                        {getIconForSegment(segment.icon)}
                        <span className="text-xs mt-1">{segment.label}</span>
                        {segment.value > 0 && (
                          <span className="text-xs">{segment.value}{segment.type === 'discount' ? '%' : ''}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full border-4 border-green-600 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10">
                <Sparkles className="w-8 h-8 text-green-600" />
              </div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-600 transform -translate-x-1/2 -translate-y-2 z-20" />
            </div>
            
            {/* Spin Info */}
            <div className="text-center mt-6 space-y-4">
              <div className="flex justify-center items-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Zap className="w-4 h-4 mr-2" />
                  {spinsLeft} Spins Left
                </Badge>
                
                {timeUntilNextSpin > 0 && spinsLeft === 0 && (
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Next in {formatTime(timeUntilNextSpin)}
                  </Badge>
                )}
              </div>
              
              <Button 
                onClick={spinWheel}
                disabled={isSpinning || spinsLeft === 0}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-bold"
                size="lg"
              >
                {isSpinning ? (
                  <>
                    <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                    Spinning...
                  </>
                ) : spinsLeft === 0 ? (
                  <>
                    <Clock className="w-5 h-5 mr-2" />
                    Wait for Refill
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Spin Now!
                  </>
                )}
              </Button>
              
              <p className="text-sm text-gray-600">
                Free spins refill every 6 hours. Complete quests for bonus spins!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Daily Quests */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Daily Quests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyQuests.map((quest, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{quest.task}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{quest.progress}/{quest.target}</span>
                  </div>
                </div>
                <Badge className={quest.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {quest.reward}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Winners */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Recent Winners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentWinners.map((winner, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">{winner.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{winner.name}</p>
                    <p className="text-xs text-gray-500">{winner.time}</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  {winner.prize}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Premium Upgrade Prompt */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-1200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-800">Want More Spins?</h3>
                <p className="text-sm text-purple-600">Premium members get unlimited spins + exclusive rewards!</p>
              </div>
              <Button 
                onClick={() => navigate('/consumer/purchase-premium')}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              {spinResult?.segment.value === 0 ? 'Keep Trying!' : 'Congratulations!'}
            </DialogTitle>
            <DialogDescription className="text-base mt-4">
              {spinResult?.message}
            </DialogDescription>
          </DialogHeader>
          
          {spinResult && (
            <div className="my-6">
              <div 
                className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: spinResult.segment.color }}
              >
                {getIconForSegment(spinResult.segment.icon)}
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold">{spinResult.segment.label}</h3>
                {spinResult.segment.value > 0 && (
                  <p className="text-2xl font-bold text-green-600">
                    {spinResult.segment.type === 'discount' && '+'}
                    {spinResult.segment.value}
                    {spinResult.segment.type === 'discount' ? '% Discount' : 
                     spinResult.segment.type === 'points' ? ' Points' : 
                     spinResult.segment.type === 'coupon' ? ' Coupon' : ' Free Item'}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="justify-center">
            {spinResult?.segment.value === 0 ? (
              <Button 
                onClick={() => setShowResultDialog(false)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8"
              >
                Try Again Later
              </Button>
            ) : (
              <Button 
                onClick={claimPrize}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8"
              >
                <Gift className="w-4 h-4 mr-2" />
                Claim Reward
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
