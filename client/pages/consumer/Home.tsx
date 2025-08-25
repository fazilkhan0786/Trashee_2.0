import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import PremiumPopup from '@/components/PremiumPopup';
import AdminAdsDisplay from '@/components/AdminAdsDisplay';
import {
  Coins, QrCode, MapPin, Gift, Play, Users,
  Wallet, Bell, User, Crown
} from 'lucide-react';

import { Wheel } from 'react-custom-roulette';

export default function ConsumerHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<any>({
    name: '',
    level: 'Level 1',
    points: 0,
    profilePicture: '/placeholder.svg'
  });

  const [weeklyScans, setWeeklyScans] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  // Wheel states
  const [userId, setUserId] = useState<string | null>(null);
  const [spinAllowed, setSpinAllowed] = useState(false);
  const [lastSpin, setLastSpin] = useState<Date | null>(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  // ✅ Only points + better luck segments
  const segments = [
    { option: '5 Points', points: 5 },
    { option: 'Better Luck Next Time', points: 0 },
    { option: '10 Points', points: 10 },
    { option: 'Better Luck Next Time', points: 0 },
    { option: '20 Points', points: 20 },
    { option: 'Better Luck Next Time', points: 0 },
    { option: '50 Points', points: 50 },
    { option: 'Better Luck Next Time', points: 0 },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUserId(user.id);

        // ✅ Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // ✅ Get points + last spin
        const { data: pointsRow } = await supabase
          .from('user_points')
          .select('points,last_spin_at')
          .eq('user_id', user.id)
          .single();

        // ✅ Get scans summary
        const { data: scansRow } = await supabase
          .from('user_scans_summary')
          .select('weekly_scans,total_scans')
          .eq('user_id', user.id)
          .single();

        // ✅ Get recent scan history (limit 4)
        const { data: scansHistory } = await supabase
          .from('scan_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4);

        // ✅ Get featured offers (limit 4)
        const { data: offersData } = await supabase
          .from('featured_offers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);

        setUserData({
          name: profile?.name || user.user_metadata?.name || 'User',
          level: profile?.level || 'Level 1',
          points: pointsRow?.points || 0,
          profilePicture: profile?.avatar_url || '/placeholder.svg'
        });

        setWeeklyScans(scansRow?.weekly_scans || 0);
        setTotalScans(scansRow?.total_scans || 0);
        setScanHistory(scansHistory || []);
        setOffers(offersData || []);

        // Spin availability check
        if (pointsRow?.last_spin_at) {
          const last = new Date(pointsRow.last_spin_at);
          setLastSpin(last);

          const now = new Date();
          const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
          setSpinAllowed(diffHours >= 24);
        } else {
          setSpinAllowed(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  const handleSpin = async () => {
    if (!spinAllowed || !userId) return;

    const randomPrize = Math.floor(Math.random() * segments.length);
    setPrizeNumber(randomPrize);
    setMustSpin(true);
  };

  const handleStopSpinning = async () => {
    const prize = segments[prizeNumber];
    setResult(prize.option);

    if (userId) {
      if (prize.points > 0) {
        // ✅ add points to user_points table
        await supabase.rpc('increment_user_points', {
          user_id_input: userId,
          points_to_add: prize.points,
        });
        setUserData((prev: any) => ({
          ...prev,
          points: prev.points + prize.points
        }));
      }

      // update last_spin_at
      await supabase
        .from('user_points')
        .update({ last_spin_at: new Date().toISOString() })
        .eq('user_id', userId);
    }

    setSpinAllowed(false);
  };

  const quickActions = [
    { icon: QrCode, label: 'QR Scanner', href: '/consumer/scanner', color: 'bg-green-500' },
    { icon: MapPin, label: 'Bin Map', href: '/consumer/map', color: 'bg-blue-500' },
    { icon: Gift, label: 'Coupon Store', href: '/consumer/coupons', color: 'bg-purple-500' },
    { icon: Crown, label: 'Purchase Premium', href: '/consumer/purchase-premium', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
    { icon: Play, label: 'Watch Ads', href: '/consumer/ads', color: 'bg-red-500' },
    { icon: Users, label: 'Refer Friends', href: '/consumer/refer', color: 'bg-orange-500' },
    { icon: Wallet, label: 'My Wallet', href: '/consumer/wallet', color: 'bg-indigo-500' },
    { icon: Bell, label: 'Notifications', href: '/consumer/notifications', color: 'bg-pink-500' },
    { icon: User, label: 'Profile', href: '/consumer/profile', color: 'bg-gray-500' },
    // 🚫 no Wheel of Luck here
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PremiumPopup userType="consumer" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white">
              <AvatarImage src={userData.profilePicture} />
              <AvatarFallback>{userData.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">Hello, {loading ? '...' : userData.name}!</h1>
              <p className="text-green-100 text-sm">Consumer • {userData.level}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-5 h-5 text-yellow-300" />
              <span className="text-2xl font-bold">{userData.points.toLocaleString()}</span>
            </div>
            <p className="text-green-100 text-sm">Reward Points</p>
          </div>
        </div>
      </div>

      <AdminAdsDisplay userType="consumers" placement="home_top" />

      <div className="p-4 space-y-6">

        {/* Scans Summary */}
        <Card>
          <CardHeader><CardTitle>Scans Summary</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl font-bold">{weeklyScans}</span>
              <p className="text-sm text-blue-600">This Week</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl font-bold">{totalScans}</span>
              <p className="text-sm text-purple-600">Total Scans</p>
            </div>
          </CardContent>
        </Card>

        {/* Wheel of Luck */}
        <Card>
          <CardHeader><CardTitle>Wheel of Luck</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={segments}
              onStopSpinning={handleStopSpinning}
              backgroundColors={['#f94144','#90be6d','#f3722c','#577590']}
              textColors={['#fff']}
              outerBorderWidth={6}
              radiusLineWidth={2}
              fontSize={14}
            />

            <Button
              onClick={handleSpin}
              className="mt-6"
              disabled={!spinAllowed}
            >
              {spinAllowed ? 'Spin Now' : 'Come Back Tomorrow'}
            </Button>

            {result && (
              <p className="mt-4 text-lg font-medium">
                You got: <span className="font-bold">{result}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Scan History */}
        <Card>
          <CardHeader><CardTitle>Scan History</CardTitle></CardHeader>
          <CardContent>
            {scanHistory.map((scan, i) => (
              <div key={i} className="flex justify-between p-2 border rounded mb-2">
                <div>
                  <p className="font-medium">{scan.bin_id}</p>
                  <p className="text-xs text-gray-500">{new Date(scan.created_at).toLocaleString()}</p>
                </div>
                <Badge>+{scan.points}</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/consumer/scan-history')}>
              View All
            </Button>
          </CardContent>
        </Card>

        {/* Featured Offers */}
        <Card>
          <CardHeader><CardTitle>Featured Offers</CardTitle></CardHeader>
          <CardContent>
            {offers.map((offer) => (
              <Link key={offer.id} to={offer.link}>
                <div className="border rounded-lg p-3 flex gap-3 hover:shadow-md">
                  {offer.image && (
                    <img src={offer.image} alt={offer.title} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div>
                    <h3 className="font-medium">{offer.title}</h3>
                    <p className="text-sm text-gray-500">{offer.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>All Features</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {quickActions.map((a, i) => (
              <Link key={i} to={a.href}>
                <div className="flex flex-col items-center p-4 border rounded-lg hover:shadow-lg">
                  <div className={`w-12 h-12 ${a.color} rounded-full flex items-center justify-center mb-2`}>
                    <a.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">{a.label}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
