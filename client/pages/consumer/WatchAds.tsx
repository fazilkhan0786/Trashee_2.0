import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // ✅ Added missing import
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
        .from("advertisements") // ✅ fixed table name
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
    // Get current user
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
      // Premium status
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

      // Fetch initial points
      await fetchPoints(uid);
    }

    // Load today's watch count
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

  // Fetch points for the user
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

  // Award points to user in Supabase
  async function awardPoints(userId: string, pointsToAdd: number) {
    try {
      const { data, error } = await supabase.from("user_points").select("points").eq("user_id", userId).single();
      if (error || !data) {
        // Insert new record
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
      // Refresh UI
      if (userId) await fetchPoints(userId);
    } catch (err) {
      console.error("Error awarding points:", err);
    }
  }

  // Today's key string
  function getTodayKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // Increment today's watch count
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

  // End of ad: award points and move to next ad (if available)
  async function handleAdEnded() {
    // Award 10 points to the user if logged in
    if (userId) await awardPoints(userId, 10);
    // Increment today's watch count
    incrementTodayWatch();

    // Move to next ad if available
    if (currentAdIndex !== null && ads && currentAdIndex + 1 < ads.length) {
      const nextIndex = currentAdIndex + 1;
      setCurrentAd(ads[nextIndex]);
      setCurrentAdIndex(nextIndex);
      return;
    }

    // No more ads
    setCurrentAd(null);
    setCurrentAdIndex(null);
  }

  // Check if user can watch more ads today
  const canWatchMore = () => watchedToday < premiumLimit;

  // When user clicks Watch
  const handleWatchClick = (ad: any, index: number) => {
    if (!canWatchMore()) {
      alert(`Daily limit reached. You can watch up to ${premiumLimit} ads today${premiumLimit > 5 ? ' with Premium' : ''}.`);
      return;
    }
    setCurrentAd(ad);
    setCurrentAdIndex(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white p-4 space-y-6">
      {/* Background Decorative Elements (kept minimal to focus on logic) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-green-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header Stats Banner */}
      <div className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Video className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Watch & Earn</h1>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <Coins className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs">+10 pts</p>
              <p className="text-xs">per ad</p>
            </div>
          </div>

          {/* Points display */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">Your Points</span>
            </div>
            <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
              {points} pts
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-200" />
              <p className="text-sm font-semibold">{ads.length}</p>
              <p className="text-xs text-emerald-100">Available</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-emerald-200" />
              <p className="text-sm font-semibold">~30s</p>
              <p className="text-xs text-emerald-100">Avg. Duration</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-emerald-200" />
              <p className="text-sm font-semibold">{premiumLimit}</p>
              <p className="text-xs text-emerald-100">{isPremium ? 'Premium Limit' : 'Ad Limit'}</p>
            </div>
          </div>

          <div className="mt-4 text-sm">
            Daily limit: {premiumLimit} • Watched today: {watchedToday}
          </div>
        </div>
      </div>

      {/* Ads List */}
      <Card className="relative border-emerald-100 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <div className="bg-emerald-100 rounded-full p-1">
              <PlayCircle className="w-5 h-5 text-emerald-700" />
            </div>
            Available Ads
            {!loading && ads.length > 0 && (
              <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-0">
                {ads.length} ads
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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
                <div key={ad.id} className="group p-4 hover:bg-emerald-50 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Video className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
                          {ad.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            30 sec
                          </span>
                          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            +10 points
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleWatchClick(ad, index)}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md group-hover:shadow-lg transition-all"
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
      {currentAd ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white relative">
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
              <p className="text-emerald-100 text-sm mt-1">Watch to earn 10 points</p>
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
                <div className="flex items-center gap-2 text-emerald-600">
                  <Coins className="w-5 h-5" />
                  <span className="font-semibold">10 points earned on completion</span>
                </div>
                <Button
                  onClick={() => {
                    setCurrentAd(null);
                    setCurrentAdIndex(null);
                  }}
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}