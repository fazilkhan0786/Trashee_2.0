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
  // REMOVED: 'level' property from the state
  const [userData, setUserData] = useState({
    fullName: '',
    points: 0,
    profilePicture: '/placeholder.svg'
  });
  const [offers, setOffers] = useState<any[]>([]);

  // Wheel states
  const [userId, setUserId] = useState<string | null>(null);
  const [spinAllowed, setSpinAllowed] = useState(false);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<string | null>(null);

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

        const [profileRes, pointsRes, offersRes] = await Promise.all([
          supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
          supabase.from('user_points').select('points, last_spin_at').eq('user_id', user.id).single(),
          supabase.from('featured_offers').select('*').order('created_at', { ascending: false }).limit(4)
        ]);

        const { data: profile } = profileRes;
        const { data: pointsRow } = pointsRes;
        const { data: offersData, error: offersError } = offersRes;

        // REMOVED: Logic for setting level
        setUserData({
          fullName: profile?.full_name || user.email || 'User',
          points: pointsRow?.points || 0,
          profilePicture: profile?.avatar_url || '/placeholder.svg',
        });

        if (offersError) {
            console.error("Error fetching featured offers:", offersError);
        } else {
            setOffers(offersData || []);
        }

        if (pointsRow?.last_spin_at) {
          const last = new Date(pointsRow.last_spin_at);
          const now = new Date();
          const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
          setSpinAllowed(diffHours >= 24);
        } else {
          setSpinAllowed(true);
        }

      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  const handleSpin = () => {
    if (!spinAllowed || mustSpin || !userId) return;
    const randomPrize = Math.floor(Math.random() * segments.length);
    setPrizeNumber(randomPrize);
    setMustSpin(true);
  };

  const handleStopSpinning = async () => {
    setMustSpin(false);
    const prize = segments[prizeNumber];
    setResult(prize.option);

    if (!userId) return;

    try {
      const { error: spinUpdateError } = await supabase
        .from('user_points')
        .upsert({ user_id: userId, last_spin_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (spinUpdateError) throw spinUpdateError;
      
      setSpinAllowed(false);

      if (prize.points > 0) {
        const { error: pointsError } = await supabase.rpc('increment_user_points', {
          user_id_input: userId,
          points_to_add: prize.points,
        });

        if (pointsError) throw pointsError;

        setUserData((prev) => ({
          ...prev,
          points: prev.points + prize.points
        }));
      }

    } catch (error) {
      console.error('Failed to save spin results:', error);
      alert('There was an error saving your prize. Please try again later.');
    }
  };

  const quickActions = [
    { icon: Wallet, label: 'My Wallet', href: '/consumer/wallet', color: 'bg-indigo-500' },
    { icon: QrCode, label: 'QR Scanner', href: '/consumer/scanner', color: 'bg-green-500' },
    { icon: MapPin, label: 'Bin Map', href: '/consumer/map', color: 'bg-blue-500' },
    { icon: Gift, label: 'Coupon Store', href: '/consumer/coupons', color: 'bg-purple-500' },
    { icon: Crown, label: 'Purchase Premium', href: '/consumer/purchase-premium', color: 'bg-gradient-to-r from-yellow-500 to-orange-500' },
    { icon: Play, label: 'Watch Ads', href: '/consumer/ads', color: 'bg-red-500' },
    { icon: Users, label: 'Refer Friends', href: '/consumer/refer', color: 'bg-orange-500' },
    { icon: Bell, label: 'Notifications', href: '/consumer/notifications', color: 'bg-pink-500' },
    { icon: User, label: 'Profile', href: '/consumer/profile', color: 'bg-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white pb-24">
      <PremiumPopup userType="consumer" />

      <div className="relative bg-gradient-to-r from-emerald-600 to-green-700 text-white">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-emerald-400/30 blur-2xl" />
        <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-green-400/20 blur-3xl" />

        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-2 ring-white/70 shadow-md">
                <AvatarImage src={userData.profilePicture} />
                <AvatarFallback>{userData.fullName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  Hello, {loading ? '...' : userData.fullName}!
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {/* REMOVED: The Badge component for the level */}
                  <Badge className="bg-white/15 text-white border-white/30">Consumer</Badge>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <Coins className="w-5 h-5 text-yellow-300" />
                <span className="text-3xl font-extrabold drop-shadow-sm">
                  {userData.points.toLocaleString()}
                </span>
              </div>
              <p className="text-emerald-100 text-sm">Reward Points</p>
              <div className="mt-2">
                {spinAllowed ? (
                  <Badge className="bg-green-500 text-white">Spin Ready</Badge>
                ) : (
                  <Badge className="bg-amber-500 text-white">Come back tomorrow</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-4">
        <AdminAdsDisplay userType="consumers" placement="home_top" />
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-6">

        <div className="rounded-2xl bg-gradient-to-r from-emerald-400/60 to-green-500/60 p-[1px] shadow-lg">
          <Card className="rounded-[15px] border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 text-xs">🎯</span>
                Wheel of Luck
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-white to-emerald-50">
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={segments}
                  onStopSpinning={handleStopSpinning}
                  backgroundColors={['#059669', '#10B981', '#34D399', '#047857']}
                  textColors={['#fff']}
                  outerBorderWidth={8}
                  radiusLineWidth={2}
                  fontSize={14}
                />
              </div>

              <Button
                onClick={handleSpin}
                className="mt-6 h-11 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-md"
                disabled={!spinAllowed || mustSpin}
              >
                {mustSpin ? 'Spinning...' : (spinAllowed ? 'Spin Now' : 'Come Back Tomorrow')}
              </Button>

              {result && (
                <p className={`mt-4 text-base sm:text-lg font-medium ${result.includes('Points') ? 'text-emerald-700' : 'text-gray-600'}`}>
                  You got: <span className="font-bold">{result}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 text-xs">🏷️</span>
              Featured Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <Link key={offer.id} to={offer.link}>
                <div className="group relative overflow-hidden rounded-xl border bg-white hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                  {offer.image_url && (
                    <div className="relative">
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70 group-hover:opacity-80 transition" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800">{offer.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{offer.description}</p>
                    <div className="mt-2 text-primary text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      View offer
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {loading === false && offers.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-6">
                No offers available right now. Check back soon!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 text-xs">🧭</span>
              All Features
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {quickActions.map((a, i) => (
              <Link key={i} to={a.href}>
                <div className="group flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-200 hover:-translate-y-0.5">
                  <div className={`w-12 h-12 ${a.color} rounded-xl flex items-center justify-center mb-2 shadow-md ring-2 ring-white group-hover:scale-105 transition`}>
                    <a.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center">{a.label}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

