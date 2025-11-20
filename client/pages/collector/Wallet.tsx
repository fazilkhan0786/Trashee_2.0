import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, QrCode, Calendar, Coins, Gift, Bell, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateCouponToken } from "../../lib/couponStoreService";
import { supabase } from "../../lib/supabase";
import QRCode from "react-qr-code";

interface OwnedCoupon {
  id: string;
  user_id: string;
  coupon_id: string;
  product_name: string;
  shop_name: string;
  shop_logo: string | null;
  product_image: string | null;
  value: number;
  discounted_price: number;
  redeemed_date: string | null;
  expiry_date: string;
  status: string;
  qr_code: string | null;
  shop_address: string | null;
  shop_phone: string | null;
  created_at: string;
  updated_at: string;
  claimed_at: string | null;
}

interface Transaction { id: string; user_id: string; type: string; description: string; amount: number; status: string; reference_id?: string; created_at: string; }

export default function WalletPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<OwnedCoupon[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [points, setPoints] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<OwnedCoupon | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login", { replace: true }); return; }
      setUserId(user.id);
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const [couponRes, pointsRes, txsRes] = await Promise.all([
        supabase
          .from("owned_coupons")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_points")
          .select("points")
          .eq("user_id", userId)
          .single(),
        supabase
          .from("transaction_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
      ]);

      // Process coupons
      if (couponRes.error) {
        setError(couponRes.error.message || "Failed to fetch coupons");
      } else if (couponRes.data) {
        setCoupons(couponRes.data);
      }
      
      // Process points
      if (pointsRes.error && pointsRes.error.code !== 'PGRST116') { // Ignore "no row" error
        console.error("Error fetching points:", pointsRes.error);
      } else if (pointsRes.data) {
        setPoints(pointsRes.data.points || 0);
      }

      // Process transactions
      if (txsRes.error) {
        console.error("Error fetching transactions:", txsRes.error);
      } else if (txsRes.data) {
        setTransactions(txsRes.data);
      }

      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return NaN;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = Math.max(0, expiry.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleShowQrCode = async (coupon: OwnedCoupon) => {
    setSelectedCoupon(coupon);
    setShowQRCode(true);
    setIsTokenLoading(true);
    setQrToken(null); 

    const res = await generateCouponToken(coupon.id);
    if (res.success && res.token) {
      setQrToken(res.token);
    } else {
      console.error("Failed to generate QR token:", res.error);
    }
    setIsTokenLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-blue-700 font-medium">Loading your wallet...</p>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-center">
        <p className="font-medium">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20 p-4">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Coins className="w-6 h-6" />
                My Wallet
              </h1>
              <p className="text-blue-100 mt-1">Manage your coupons and transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4 text-center">
              <Gift className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">{coupons.length}</p>
              <p className="text-xs text-gray-600">Total Coupons</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl shadow-md hover:shadow-lg transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4 text-center">
              <Coins className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <p className="text-2xl font-bold">{points}</p>
              <p className="text-xs text-gray-600">Total Points</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="coupons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl">
            <TabsTrigger value="coupons" className="flex items-center gap-2 rounded-lg p-4 text-center font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md">
              <Gift className="w-5 h-5" /> Coupons
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 rounded-lg p-4 text-center font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md">
              <Coins className="w-5 h-5" /> Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coupons" className="space-y-4">
            {coupons.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No coupons yet.</p>
              </div>
            ) : (
              coupons.map((coupon) => {
                const daysLeft = getDaysUntilExpiry(coupon.expiry_date);
                return (
                  <Card key={coupon.id} className="border border-blue-100 shadow-md rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative">
                          <img src={coupon.product_image || "/placeholder.png"} alt={coupon.product_name} className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
                          {coupon.status === 'active' && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                onClick={() => handleShowQrCode(coupon)}
                                className="bg-white/80 text-blue-600 px-3 py-1 rounded-lg font-medium text-sm"
                              >
                                <QrCode className="w-4 h-4 mr-1" />
                                Redeem
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{coupon.product_name}</h3>
                              <p className="text-sm text-gray-600">{coupon.shop_name}</p>
                            </div>
                            {/* --- THIS IS THE FIXED LINE --- */}
                            <Badge variant={coupon.status === "active" ? "default" : coupon.status === "expired" ? "destructive" : "secondary"} className="text-xs">
                              {coupon.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Expires: {new Date(coupon.expiry_date).toLocaleDateString()}</span>
                            {coupon.status === "active" && !isNaN(daysLeft) && (
                              <div className="flex items-center gap-1">
                                <Bell className="w-4 h-4 text-yellow-400" />
                                <span className={daysLeft <= 7 ? "text-red-600 font-medium" : "text-gray-600"}>
                                  {daysLeft} days left
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleShowQrCode(coupon)}>
                              <QrCode className="w-4 h-4 mr-1" /> QR Code
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="payments">
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map(tx => (
                  <Card key={tx.id} className="border border-gray-100 shadow-md rounded-3xl">
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{tx.description}</p>
                        <p className="text-sm text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                      <div className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={(isOpen) => { if (!isOpen) { setQrToken(null); } setShowQRCode(isOpen); }}>
        <DialogContent className="bg-gradient-to-b from-white to-gray-50 rounded-3xl border border-blue-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-blue-800">
              <QrCode className="w-5 h-5 text-blue-600" /> Coupon QR Code
            </DialogTitle>
            {selectedCoupon && (
              <DialogDescription className="text-gray-600">
                Show this code at {selectedCoupon.shop_name} to redeem. It will expire in 5 minutes.
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex justify-center items-center p-6 h-64">
            {isTokenLoading && (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="mt-2 text-gray-600">Generating QR code...</p>
              </div>
            )}
            {!isTokenLoading && qrToken && <QRCode value={qrToken} size={200} fgColor="#1E40AF" />}
            {!isTokenLoading && !qrToken && (
              <div className="text-center">
                <Bell className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                <p className="text-rose-700 text-lg font-medium">Failed to generate QR code</p>
                <p className="text-gray-500 mt-2">Please try again later</p>
                <Button 
                  onClick={() => setShowQRCode(false)} 
                  className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full py-2 px-4"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-4 justify-center">
            <Button 
              onClick={() => setShowQRCode(false)} 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full py-2 px-6"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}