import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import {
  ArrowLeft, Search, Filter, MapPin,
  Calendar, Coins, Star, ShoppingBag,
  Wallet, CheckCircle, Store, TagIcon,
  Video, AlertCircle, Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { safeNavigateBack } from "../../lib/navigation";
import { getCoupons, redeemCoupon, Coupon } from "../../lib/couponStoreService";
import { supabase } from "../../lib/supabase";

export default function CouponStore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInsufficientPointsModal, setShowInsufficientPointsModal] = useState(false);
  const [redeemedCoupon, setRedeemedCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [pointsLoading, setPointsLoading] = useState(true);

  useEffect(() => {
    async function loadCoupons() {
      try {
        setLoading(true);
        const { success, data, error } = await getCoupons();
        if (!success || error) {
          setError("Failed to load coupons. Please try again");
          return;
        }
        setCoupons(data || []);
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    loadCoupons();
  }, []);

  useEffect(() => {
    async function fetchPoints() {
      setPointsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserPoints(0);
          return;
        }
        const { data } = await supabase
          .from("user_points")
          .select("points")
          .eq("user_id", user.id)
          .single();
        
        if (data) {
          setUserPoints(data.points || 0);
        } else {
          setUserPoints(0);
        }
      } catch (err) {
        console.error("Error fetching points:", err);
        setUserPoints(0);
      } finally {
        setPointsLoading(false);
      }
    }
    fetchPoints();
  }, []);

  const categories = [
    { value: "all", label: "All" }, { value: "Food", label: "Food" },
    { value: "Entertainment", label: "Entertainment" }, { value: "Lifestyle", label: "Lifestyle" },
    { value: "Health", label: "Health" },
  ];

  const sortOptions = [
    { value: "points-low", label: "Points: Low to High" }, { value: "points-high", label: "Points: High to Low" },
    { value: "distance", label: "Nearest First" }, { value: "expiry", label: "Expiring Soon" },
    { value: "rating", label: "Highest Rated" },
  ];

  const filteredAndSortedCoupons = coupons
    .filter(coupon => {
      const matchesSearch = coupon.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            coupon.shop_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || filterCategory === "" || coupon.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "points-low": return a.points_cost - b.points_cost;
        case "points-high": return b.points_cost - a.points_cost;
        case "distance": return parseFloat(a.distance || "99999") - parseFloat(b.distance || "99999");
        case "expiry": return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        case "rating": return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });

  const handleRedeem = async (coupon: Coupon) => {
    if (userPoints !== null && coupon.points_cost > userPoints) {
      setSelectedCoupon(coupon);
      setShowInsufficientPointsModal(true);
      return;
    }

    const result = await redeemCoupon(coupon.id);

    if (!result.success) {
      alert(`Redemption Failed: ${result.error || "An unknown error occurred."}`);
      return;
    }
    
    if (result.newBalance !== undefined) {
      setUserPoints(result.newBalance);
    }
    
    setCoupons(prevCoupons => 
      prevCoupons.map(c => 
        c.id === coupon.id ? { ...c, quantity: c.quantity - 1 } : c
      )
    );

    setRedeemedCoupon(coupon);
    setShowSuccessModal(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "food": return "🍕";
      case "entertainment": return "🎬";
      case "lifestyle": return "🛍️";
      case "health": return "💊";
      default: return "🏷️";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white pb-20">
      <div className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => safeNavigateBack(navigate, "/partner/home")} className="p-2 rounded-full hover:bg-emerald-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-emerald-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-emerald-800">Coupon Store</h1>
            <p className="text-sm text-emerald-600/80">Redeem points for amazing deals</p>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full"><Coins className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-emerald-100">Available Points</p>
              {pointsLoading ? <p className="text-2xl font-bold">Loading...</p> : <p className="text-2xl font-bold">{userPoints?.toLocaleString() ?? 0}</p>}
            </div>
          </div>
          <Button onClick={() => navigate("/partner/wallet")} variant="outline" className="bg-white text-emerald-700 hover:bg-emerald-50 border-0">
            <Wallet className="w-4 h-4 mr-2" /> My Wallet
          </Button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <Card className="bg-white rounded-2xl shadow-md border border-emerald-100">
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 w-4 h-4" />
              <Input placeholder="Search coupons or shops..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <div className="flex items-center gap-2"><TagIcon className="w-4 h-4 text-emerald-500" /><SelectValue placeholder="Category" /></div>
                </SelectTrigger>
                <SelectContent className="max-h-60">{categories.map(c => <SelectItem key={c.value} value={c.value} className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50">{c.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex items-center justify-between w-full px-3 py-2 border border-gray-200 rounded-lg hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <div className="flex items-center gap-2"><Filter className="w-4 h-4 text-emerald-500" /><SelectValue placeholder="Sort by" /></div>
                </SelectTrigger>
                <SelectContent className="max-h-60">{sortOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="px-3 py-2 hover:bg-emerald-50">{opt.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        {loading && <div className="flex flex-col items-center justify-center py-12 space-y-2"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div><p className="text-emerald-700 font-medium">Loading coupons...</p><p className="text-emerald-400 text-sm">Finding the best deals for you</p></div>}
        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl"><p className="font-medium">{error}</p><Button variant="outline" size="sm" className="mt-2 text-rose-700 border-rose-200 hover:bg-rose-50" onClick={() => window.location.reload()}>Retry</Button></div>}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredAndSortedCoupons.length > 0 && <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-emerald-600" />Available Offers ({filteredAndSortedCoupons.length})</h2>}
            <div className="grid grid-cols-1 gap-4">
              {filteredAndSortedCoupons.map((coupon, index) => (
                <Card key={coupon.id} className={`overflow-hidden rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${coupon.quantity === 0 ? 'opacity-60 bg-gray-50' : ''}`}>
                  <CardContent className="p-0 flex">
                    <div className="relative w-32 h-auto bg-gray-100">
                      <img src={coupon.product_image || 'https://placehold.co/200x200?text=Deal'} alt={coupon.product_name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm p-1 rounded-md text-xs font-medium">{getCategoryIcon(coupon.category)} {coupon.category}</div>
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-800 line-clamp-2">{coupon.product_name}</h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1"><Store className="w-3 h-3 mr-1" />{coupon.shop_name}</p>
                          </div>
                          <Badge variant="outline" className="bg-emerald-100 border-0 text-emerald-800 px-2 py-1 font-semibold"><Coins className="w-3 h-3 mr-1" />{coupon.points_cost}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 my-2">
                          <span className="flex items-center"><MapPin className="w-3 h-3 mr-1 text-gray-400" />{coupon.distance}</span>
                          {coupon.rating && <span className="flex items-center"><Star className="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" />{coupon.rating}</span>}
                          <span className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-gray-400" />Exp: {coupon.expiry_date}</span>
                          <span className={`flex items-center font-medium ${coupon.quantity <= 10 && coupon.quantity > 0 ? 'text-amber-600' : coupon.quantity === 0 ? 'text-rose-600' : ''}`}><Package className="w-3 h-3 mr-1" />{coupon.quantity > 0 ? `${coupon.quantity} left` : 'Out of Stock'}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div>
                          <p className="text-xs text-gray-500 line-through">₹{coupon.original_price}</p>
                          <p className="text-xl font-bold text-emerald-600">₹{coupon.discounted_price}</p>
                        </div>
                        <Button onClick={() => handleRedeem(coupon)} className={`transition-all ${coupon.quantity > 0 ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:opacity-90 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} disabled={pointsLoading || (userPoints !== null && coupon.points_cost > userPoints) || coupon.quantity === 0}>
                          {coupon.quantity > 0 ? <><ShoppingBag className="w-4 h-4 mr-2" />Redeem</> : 'Out of Stock'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredAndSortedCoupons.length === 0 && <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-white rounded-xl shadow-sm border border-gray-100"><ShoppingBag className="w-16 h-16 text-gray-300" /><div className="text-center"><p className="text-gray-600 font-medium">No coupons found</p><p className="text-gray-500 text-sm">Try adjusting your filters</p></div><Button variant="outline" onClick={() => { setFilterCategory("all"); setSortBy("all"); setSearchQuery(""); }}>Clear Filters</Button></div>}
            </div>
          </div>
        )}
      </div>
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}><DialogContent className="bg-white rounded-2xl max-w-sm border-0 shadow-2xl"><div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-100 rounded-full p-4 border-4 border-white"><CheckCircle className="w-10 h-10 text-emerald-600" /></div><DialogHeader className="text-center pt-6"><DialogTitle className="text-xl font-bold text-emerald-800 mt-4">Coupon Redeemed!</DialogTitle><DialogDescription className="text-emerald-600">{redeemedCoupon && `"${redeemedCoupon.product_name}" added to your wallet.`}</DialogDescription></DialogHeader>{redeemedCoupon && <div className="bg-gray-50 p-3 rounded-lg my-2"><div className="flex justify-between text-sm"><span className="text-gray-500">Coupon value:</span><span className="font-medium">₹{redeemedCoupon.discounted_price}</span></div><div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Points spent:</span><span className="font-medium">-{redeemedCoupon.points_cost} points</span></div><div className="flex justify-between text-sm mt-1"><span className="text-gray-500">Remaining points:</span><span className="font-medium">{userPoints} points</span></div></div>}<DialogFooter className="flex flex-col gap-2 mt-4"><Button onClick={() => navigate("/partner/wallet")} className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:opacity-90"><Wallet className="w-4 h-4 mr-2" /> See in Wallet</Button><Button variant="outline" onClick={() => setShowSuccessModal(false)} className="w-full">Continue Shopping</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={showInsufficientPointsModal} onOpenChange={setShowInsufficientPointsModal}><DialogContent className="bg-white rounded-2xl max-w-sm border-0 shadow-2xl"><div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-amber-100 rounded-full p-4 border-4 border-white"><AlertCircle className="w-10 h-10 text-amber-600" /></div><DialogHeader className="text-center pt-6"><DialogTitle className="text-xl font-bold text-amber-800 mt-4">Insufficient Points</DialogTitle><DialogDescription className="text-amber-600">You need {selectedCoupon && userPoints !== null ? selectedCoupon.points_cost - userPoints : 0} more points to redeem this coupon.</DialogDescription></DialogHeader>{selectedCoupon && <div className="bg-amber-50 p-3 rounded-lg my-2"><div className="flex justify-between text-sm"><span className="text-amber-700">Coupon:</span><span className="font-medium">{selectedCoupon.product_name}</span></div><div className="flex justify-between text-sm mt-1"><span className="text-amber-700">Points needed:</span><span className="font-medium">{selectedCoupon.points_cost}</span></div><div className="flex justify-between text-sm mt-1"><span className="text-amber-700">Your points:</span><span className="font-medium">{userPoints}</span></div></div>}<DialogFooter className="flex flex-col gap-2 mt-4"><Button onClick={() => { setShowInsufficientPointsModal(false); navigate("/partner/watch-ads"); }} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white"><Video className="w-4 h-4 mr-2" /> Watch Ads to Earn Points</Button><Button variant="outline" onClick={() => setShowInsufficientPointsModal(false)} className="w-full text-amber-700 border-amber-200 hover:bg-amber-50">Maybe Later</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
