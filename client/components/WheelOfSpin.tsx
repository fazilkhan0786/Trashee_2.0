import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Gift, RotateCcw, Star, Coins, Trophy, Zap } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  type: 'coins' | 'coupon' | 'badge' | 'multiplier';
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface WheelOfSpinProps {
  className?: string;
}

const prizes: Prize[] = [
  { id: '1', name: '50 Coins', type: 'coins', value: 50, icon: Coins, color: 'bg-yellow-500', rarity: 'common' },
  { id: '2', name: '10% Off Coupon', type: 'coupon', value: '10% OFF', icon: Gift, color: 'bg-green-500', rarity: 'common' },
  { id: '3', name: '100 Coins', type: 'coins', value: 100, icon: Coins, color: 'bg-blue-500', rarity: 'common' },
  { id: '4', name: '2x Points', type: 'multiplier', value: '2x', icon: Zap, color: 'bg-purple-500', rarity: 'rare' },
  { id: '5', name: '25% Off Coupon', type: 'coupon', value: '25% OFF', icon: Gift, color: 'bg-orange-500', rarity: 'rare' },
  { id: '6', name: '200 Coins', type: 'coins', value: 200, icon: Coins, color: 'bg-red-500', rarity: 'rare' },
  { id: '7', name: 'Eco Warrior Badge', type: 'badge', value: 'Badge', icon: Trophy, color: 'bg-indigo-500', rarity: 'epic' },
  { id: '8', name: '500 Coins', type: 'coins', value: 500, icon: Coins, color: 'bg-pink-500', rarity: 'legendary' }
];

export default function WheelOfSpin({ className = '' }: WheelOfSpinProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [rotation, setRotation] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const [spinsLeft, setSpinsLeft] = useState(3);

  const segmentAngle = 360 / prizes.length;

  const spinWheel = () => {
    if (!canSpin || isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    
    // Generate random rotation (multiple full spins + random segment)
    const minSpins = 5;
    const maxSpins = 8;
    const spins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
    const randomAngle = Math.floor(Math.random() * 360);
    const finalRotation = rotation + (spins * 360) + randomAngle;
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      // Calculate which prize was selected
      const normalizedAngle = (360 - (finalRotation % 360)) % 360;
      const selectedIndex = Math.floor(normalizedAngle / segmentAngle) % prizes.length;
      const selectedPrize = prizes[selectedIndex];
      
      setCurrentPrize(selectedPrize);
      setIsSpinning(false);
      setShowResult(true);
      setSpinsLeft(prev => prev - 1);
      
      // Reset spins after 24 hours (in a real app, this would be server-side)
      if (spinsLeft - 1 <= 0) {
        setTimeout(() => {
          setSpinsLeft(3);
        }, 24 * 60 * 60 * 1000); // 24 hours
      }
    }, 3000);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setCurrentPrize(null);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={className}>
      <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">Wheel of Fortune</h3>
            </div>
            
            {/* Wheel Container */}
            <div className="relative mx-auto w-64 h-64">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
              </div>
              
              {/* Wheel */}
              <div 
                className="w-64 h-64 rounded-full border-8 border-gray-300 relative overflow-hidden transition-transform duration-3000 ease-out"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(${prizes.map((prize, index) => {
                    const start = (index * segmentAngle);
                    const end = ((index + 1) * segmentAngle);
                    return `${prize.color} ${start}deg ${end}deg`;
                  }).join(', ')})`
                }}
              >
                {/* Prize Labels */}
                {prizes.map((prize, index) => {
                  const angle = (index * segmentAngle) + (segmentAngle / 2);
                  const radius = 80;
                  const x = Math.cos((angle - 90) * Math.PI / 180) * radius + 128;
                  const y = Math.sin((angle - 90) * Math.PI / 180) * radius + 128;
                  
                  return (
                    <div
                      key={prize.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold text-center"
                      style={{
                        left: x,
                        top: y,
                        transform: `translate(-50%, -50%) rotate(${angle}deg)`
                      }}
                    >
                      <prize.icon className="w-4 h-4 mx-auto mb-1" />
                      <div style={{ transform: `rotate(${-angle}deg)` }}>
                        {prize.name.length > 8 ? prize.name.substring(0, 8) + '...' : prize.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Spin Button */}
            <div className="space-y-2">
              <Button 
                onClick={spinWheel}
                disabled={!canSpin || isSpinning || spinsLeft <= 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3"
              >
                <RotateCcw className={`w-5 h-5 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning ? 'Spinning...' : spinsLeft > 0 ? `Spin Now (${spinsLeft} left)` : 'No spins left'}
              </Button>
              
              {spinsLeft <= 0 && (
                <p className="text-sm text-gray-500">
                  Free spins reset in 24 hours
                </p>
              )}
              
              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < spinsLeft ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">🎉 Congratulations!</DialogTitle>
          </DialogHeader>
          
          {currentPrize && (
            <div className="text-center space-y-4">
              <div className={`w-20 h-20 ${currentPrize.color} rounded-full flex items-center justify-center mx-auto`}>
                <currentPrize.icon className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  You won {currentPrize.name}!
                </h3>
                <Badge className={getRarityColor(currentPrize.rarity)}>
                  {currentPrize.rarity.toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-sm text-gray-600">
                {currentPrize.type === 'coins' && "Coins have been added to your wallet!"}
                {currentPrize.type === 'coupon' && "Coupon has been added to your collection!"}
                {currentPrize.type === 'badge' && "Badge has been added to your profile!"}
                {currentPrize.type === 'multiplier' && "Multiplier is active for your next scan!"}
              </div>
              
              <Button 
                onClick={handleCloseResult}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Awesome!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
