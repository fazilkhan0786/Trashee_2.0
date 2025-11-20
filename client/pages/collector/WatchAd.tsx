import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, PlayCircle, X, Coins, Clock, TrendingUp, Video, Sparkles } from "lucide-react";

export default function WatchAds() {
  const LOCAL_WATCH_KEY = 'ads_watched_today_v1';
  const [ads, setAds] = useState<any[]>([]);
  const [currentAd, setCurrentAd] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [premiumLimit, setPremiumLimit] = useState<number>(5);
  const [watchedToday, setWatchedToday] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    loadAds();
    loadUserAndLimit();
  }, []);

  async function loadAds() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (err) {
      console.error("Error loading ads:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserAndLimit() {
    let uid: string | null = null;
    try {
      const { data } = await supabase.auth.getUser();
      uid = data?.user?.id ?? null;
    } catch {
      const u = (supabase as any).auth?.user?.();
      uid = u?.id ?? null;
    }

    if (uid) {
      setUserId(uid);
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_premium, premium_until")
          .eq("id", uid)
          .single();
        let premiumActive = false;
        if (profile) {
          if (profile.is_premium) premiumActive = true;
          else if (profile.premium_until) premiumActive = new Date(profile.premium_until) > new Date();
        }
        setIsPremium(premiumActive);
        setPremiumLimit(premiumActive ? 15 : 5);
      } catch (err) {
        console.error("Error fetching premium status:", err);
      }

      await fetchPoints(uid);
    }

    const todayKey = new Date().toISOString().slice(0, 10);
    const stored = localStorage.getItem(LOCAL_WATCH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === todayKey) {
          setWatchedToday(parsed.count ?? 0);
        } else {
          localStorage.setItem(LOCAL_WATCH_KEY, JSON.stringify({ date: todayKey, count: 0 }));
          setWatchedToday(0);
        }
      } catch {
        localStorage.setItem(LOCAL_WATCH_KEY, JSON.stringify({ date: todayKey, count: 0 }));
        setWatchedToday(0);
      }
    } else {
      localStorage.setItem(LOCAL_WATCH_KEY, JSON.stringify({ date: todayKey, count: 0 }));
      setWatchedToday(0);
    }
  }

  async function fetchPoints(uid: string) {
    try {
      const { data, error } = await supabase
        .from("user_points")
        .select("points")
        .eq("user_id", uid)
        .single();

      if (error || !data) {
        setPoints(0);
        return;
      }
      setPoints(Number(data.points ?? 0));
    } catch (err) {
      console.error("Error fetching points:", err);
    }
  }

  async function awardPoints(userId: string, pointsToAdd: number) {
    try {
      const { data, error } = await supabase.from("user_points").select("points").eq("user_id", userId).single();
      if (error || !data) {
        await supabase.from("user_points").insert({
          user_id: userId,
          points: pointsToAdd,
          updated_at: new Date().toISOString(),
        });
      } else {
        const currentPoints = Number(data.points ?? 0);
        const nextPoints = currentPoints + pointsToAdd;
        await supabase.from("user_points").update({
          points: nextPoints,
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId);
      }
      if (userId) await fetchPoints(userId);
    } catch (err) {
      console.error("Error awarding points:", err);
    }
  }

  function getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  function incrementTodayWatch(): number {
    const key = getTodayKey();
    const stored = localStorage.getItem(LOCAL_WATCH_KEY);
    let current = 0;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.date === key) current = parsed.count ?? 0;
        else current = 0;
      } catch {
        current = 0;
      }
    }
    const next = current + 1;
    localStorage.setItem(LOCAL_WATCH_KEY, JSON.stringify({ date: key, count: next }));
    setWatchedToday(next);
    return next;
  }

  async function handleAdEnded() {
    if (userId) await awardPoints(userId, 10);
    incrementTodayWatch();

    if (currentAdIndex !== null && ads && currentAdIndex + 1 < ads.length) {
      const nextIndex = currentAdIndex + 1;
      setCurrentAd(ads[nextIndex]);
      setCurrentAdIndex(nextIndex);
      return;
    }

    setCurrentAd(null);
    setCurrentAdIndex(null);
  }

  const canWatchMore = () => watchedToday < premiumLimit;

  const handleWatchClick = (ad: any, index: number) => {
    if (!canWatchMore()) {
      alert(`Daily limit reached. You can watch up to ${premiumLimit} ads today${premiumLimit > 5 ? ' with Premium' : ''}.`);
      return;
    }
    setCurrentAd(ad);
    setCurrentAdIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Video className="w-6 h-6" />
                Watch & Earn
              </h1>
              <p className="text-blue-100 mt-1">Earn points by watching ads</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Banner */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Your Points</h2>
              </div>
              <div className="bg-blue-100 rounded-full px-4 py-2 shadow-sm">
                <span className="font-bold text-blue-600 text-lg">{points}</span>
                <span className="text-blue-500 text-sm ml-1">pts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Available</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{ads.length}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Avg. Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">~30s</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">{isPremium ? 'Premium' : 'Daily'} Limit</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{premiumLimit}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Watched Today</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{watchedToday}</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Daily limit: {premiumLimit} • Watched today: {watchedToday}
            </div>
          </CardContent>
        </Card>

        {/* Ads List */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <div className="bg-blue-100 rounded-full p-1">
                <PlayCircle className="w-5 h-5 text-blue-700" />
              </div>
              Available Ads
              {!loading && ads.length > 0 && (
                <Badge className="ml-auto bg-blue-100 text-blue-700 border-0">
                  {ads.length} ads
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                </div>
                <p className="text-gray-500 font-medium">Loading ads...</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <Video className="w-10 h-10 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-gray-600 font-medium">No ads available</p>
                  <p className="text-gray-400 text-sm mt-1">Check back later for new content</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {ads.map((ad, index) => (
                  <div key={ad.id} className="group p-4 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Video className="w-7 h-7 text-blue-600" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                            {ad.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              30 sec
                            </span>
                            <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              +10 points
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleWatchClick(ad, index)}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md group-hover:shadow-lg transition-all"
                        disabled={watchedToday >= premiumLimit}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        {watchedToday >= premiumLimit ? 'Limit reached' : 'Watch'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Ad Player */}
        {currentAd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white relative">
                <Button
                  onClick={() => {
                    setCurrentAd(null);
                    setCurrentAdIndex(null);
                  }}
                  className="absolute right-4 top-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 h-auto"
                >
                  <X className="w-5 h-5" />
                </Button>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Video className="w-6 h-6" />
                  {currentAd.title}
                </CardTitle>
                <p className="text-blue-100 text-sm mt-1">Watch to earn 10 points</p>
              </CardHeader>
              <CardContent className="p-0 bg-black">
                <video
                  src={currentAd.video_url}
                  controls
                  autoPlay
                  onEnded={handleAdEnded}
                  className="w-full"
                  style={{ maxHeight: "60vh" }}
                />
                <div className="bg-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Coins className="w-5 h-5" />
                    <span className="font-semibold">10 points earned on completion</span>
                  </div>
                  <Button
                    onClick={() => {
                      setCurrentAd(null);
                      setCurrentAdIndex(null);
                    }}
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}