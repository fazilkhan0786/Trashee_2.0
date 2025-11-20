import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AdminAdsDisplay from '@/components/AdminAdsDisplay';
import {
  Coins, QrCode, MapPin, Gift, Play, Users,
  Wallet, Bell, User, Truck
} from 'lucide-react';
import { Wheel } from 'react-custom-roulette';

export default function CollectorHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>({
    name: '',
    level: 'Collector',
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
        // Get the current authenticated user.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }
        setUserId(user.id);

        // --- MODIFIED FETCH ---
        // Removed the fetch from the obsolete 'collectors' table.
        // We only need 'profiles', 'user_points', and 'collector_updates'.
        const [profileRes, userPointsRes, updatesRes] = await Promise.all([
          supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
          supabase.from('user_points').select('*').eq('user_id', user.id).single(),
          supabase.from('collector_updates').select('*').order('created_at', { ascending: false }).limit(4)
        ]);

        // Process profile result.
        const { data: profile, error: profileError } = profileRes;
        if (profileError && profileError.code !== 'PGRST116') throw profileError;

        // Process user_points.
        let { data: userPoints, error: userPointsError } = userPointsRes;
        if (userPointsError && userPointsError.code !== 'PGRST116') {
          throw userPointsError;
        }
        if (!userPoints) {
          const { data: inserted, error: insertError } = await supabase
            .from('user_points')
            .insert({ user_id: user.id, points: 0 })
            .select()
            .single();
          if (insertError) {
            console.error('Failed to create user_points:', insertError);
            userPoints = { points: 0, last_spin_at: null, updated_at: new Date().toISOString() };
          } else {
            userPoints = inserted;
          }
        }

        // --- REMOVED: Collector data processing (now obsolete) ---

        // Process collector updates.
        const { data: updatesData, error: updatesError } = updatesRes;
        if (updatesError) {
          console.error('Updates error:', updatesError);
        } else {
          setOffers(updatesData || []);
        }

        // --- MODIFIED: Determine the display name ---
        // Use the profile.full_name as the primary source.
        const profileName = profile?.full_name;
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
        const displayName = profileName || metaName || 'Collector';

        // --- MODIFIED: Update header data ---
        setUserData({
          name: displayName,
          points: userPoints.points || 0,
          // Use avatar from 'profiles' table.
          profilePicture: profile?.avatar_url || '/placeholder.svg'
        });

        // Determine if the user can spin based on user_points.last_spin_at.
        if (userPoints.last_spin_at) {
          const last = new Date(userPoints.last_spin_at);
          const now = new Date();
          const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
          setSpinAllowed(diffHours >= 24);
        } else {
          setSpinAllowed(true);
        }
      } catch (err: any) {
        console.error('Load error:', err);
        if (err.code === 'PGRST116') {
          const { data: { user } } = await supabase.auth.getUser();
          setUserData({
            name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'Collector',
            points: 0,
            profilePicture: '/placeholder.svg'
          });
        } else {
          navigate('/login', { replace: true });
        }
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
      const { error: spinError } = await supabase
        .from('user_points')
        .update({
          last_spin_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      if (spinError) throw spinError;
      setSpinAllowed(false);
      if (prize.points > 0) {
        const { data: currentPointsData, error: fetchError } = await supabase
          .from('user_points')
          .select('points')
          .eq('user_id', userId)
          .single();
        if (fetchError) throw fetchError;
        const currentPoints = currentPointsData?.points || 0;
        const newPoints = currentPoints + prize.points;
        const { error: updatePointsError } = await supabase
          .from('user_points')
          .update({
            points: newPoints,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        if (updatePointsError) throw updatePointsError;
        setUserData((prev: any) => ({ ...prev, points: newPoints }));
      }
    } catch (error) {
      console.error('Spin save error:', error);
      alert('Error saving prize. Please try again.');
      window.location.reload();
    }
  };

  const quickActions = [
    { icon: QrCode, label: 'QR Scanner', href: '/collector/scanner', color: 'bg-blue-600' },
    { icon: MapPin, label: 'Map & Routes', href: '/collector/map', color: 'bg-cyan-600' },
    { icon: Gift, label: 'Coupon Store', href: '/collector/coupons', color: 'bg-purple-600' },
    { icon: Truck, label: 'Collect Trash', href: '/collector/collect-trash', color: 'bg-orange-600' },
    { icon: Play, label: 'Watch Ads', href: '/collector/ads', color: 'bg-red-600' },
    { icon: Users, label: 'Refer Friends', href: '/collector/refer', color: 'bg-pink-600' },
    { icon: Wallet, label: 'My Wallet', href: '/collector/wallet', color: 'bg-indigo-600' },
    { icon: Bell, label: 'Notifications', href: '/collector/notifications', color: 'bg-yellow-600' },
    { icon: User, label: 'Profile', href: '/collector/profile', color: 'bg-gray-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-24">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-between">
            
            {/* --- MODIFIED: CLICKABLE HEADER LINK --- */}
            <Link to="/collector/profile" className="flex items-center gap-4">
              <Avatar className="w-16 h-16 ring-2 ring-white/40 shadow-xl transition-transform duration-300 hover:scale-105">
                <AvatarImage src={userData.profilePicture} />
                <AvatarFallback className="text-2xl bg-blue-800 text-white font-bold">
                  {userData.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Hello, {userData.name}!</h1>
                <Badge className="bg-white/15 text-white border-white/30 mt-1 font-medium">Collector</Badge>
              </div>
            </Link>
            {/* --- END MODIFICATION --- */}

            <div className="text-right">
              <div className="flex items-center justify-end gap-2 mb-1">
                <Coins className="w-6 h-6 text-yellow-300 shadow-sm" />
                <span className="text-3xl font-extrabold tracking-tight">{userData.points.toLocaleString()}</span>
              </div>
              <p className="text-blue-100 text-sm font-medium">Reward Points</p>
              <div className="mt-2">
                {spinAllowed ? (
                  <Badge className="bg-green-500 text-white shadow-md">Ready to Spin 🎯</Badge>
                ) : (
                  <Badge className="bg-gray-500 text-white shadow-md">Try Again Tomorrow</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ads */}
      <div className="max-w-5xl mx-auto px-4 -mt-4">
        <AdminAdsDisplay userType="collectors" placement="home_top" />
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Wheel Section */}
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">🎯</span>
              Daily Spin & Win Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-8">
            {/* Fixed size container for the wheel */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg w-[320px] h-[320px] flex items-center justify-center">
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                data={segments}
                onStopSpinning={handleStopSpinning}
                backgroundColors={['#059669', '#10B981', '#34D399', '#047857']}
                textColors={['#fff']}
                outerBorderWidth={8}
                radiusLineWidth={3}
                fontSize={14}
              />
            </div>
            <Button
              onClick={handleSpin}
              className="mt-8 h-12 px-10 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              disabled={!spinAllowed || mustSpin}
            >
              {mustSpin ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Spinning...
                </>
              ) : spinAllowed ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Spin Now
                </>
              ) : (
                'Try Tomorrow'
              )}
            </Button>
            {result && (
              <p className={`mt-6 text-xl font-bold ${result.includes('Points') ? 'text-emerald-700' : 'text-gray-600'}`}>
                You won: <span className="font-extrabold">{result}</span>
              </p>
            )}
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 text-sm font-bold">📢</span>
              Latest Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {offers.map((offer) => (
              <Link key={offer.id} to={offer.link || '#'} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {offer.image_url && (
                  <img 
                    src={offer.image_url} 
                    alt={offer.title} 
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{offer.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{offer.description}</p>
                  {offer.link && (
                    <div className="mt-3 flex items-center text-blue-600 text-sm font-medium">
                      View Details
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
            ))}
            {offers.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No updates available right now.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-800">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-700 text-sm font-bold">⚡</span>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickActions.map((a, i) => (
              <Link key={i} to={a.href} className="group">
                <div className="flex flex-col items-center p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                  <div className={`w-14 h-14 ${a.color} rounded-2xl flex items-center justify-center mb-3 shadow-md ring-2 ring-white`}>
                    <a.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 text-center leading-tight group-hover:text-blue-700 transition-colors">
                    {a.label}
                  </span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}