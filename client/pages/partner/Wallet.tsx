import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, QrCode, Calendar, Coins, Gift, History, Bell, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OwnedCoupon, getOwnedCoupons, generateCouponToken } from "../../lib/couponStoreService";
import { supabase } from "../../lib/supabase";
import QRCode from "react-qr-code";

// Interfaces can be moved to a types file
interface ScanHistory { id: string; user_id: string; item_name: string; points_earned: number; scanned_at: string; }
interface Transaction { id: string; user_id: string; type: string; description: string; amount: number; status: string; reference_id?: string; created_at: string; }

export default function WalletPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<OwnedCoupon[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
      const couponRes = await getOwnedCoupons();
      if (couponRes.success && couponRes.data) { setCoupons(couponRes.data); }
      else { setError(couponRes.error || "Failed to fetch coupons"); }
      const { data: scans } = await supabase.from("scan_history").select("*").eq("profiles_id", userId).order("scanned_at", { ascending: false });
      if (scans) setScanHistory(scans);
      const { data: txs } = await supabase.from("transaction_history").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (txs) setTransactions(txs);
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-600"></div>
      <p className="ml-4 text-emerald-700 font-medium">Loading your wallet...</p>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-center">
        <p className="font-medium">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-20 p-4">
      <div className="bg-white border-b border-emerald-100 shadow-sm rounded-xl mb-6">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-emerald-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-emerald-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-emerald-800">My Wallet</h1>
            <p className="text-sm text-emerald-600/80">Manage your coupons, scans, and transactions</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="coupons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-emerald-50 rounded-xl">
            <TabsTrigger value="coupons" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              <Gift className="w-4 h-4" /> Coupons
            </TabsTrigger>
            <TabsTrigger value="scan-history" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              <History className="w-4 h-4" /> Scan History
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm">
              <Coins className="w-4 h-4" /> Payments
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
                const daysLeft = getDaysUntilExpiry(coupon.coupons_store.expiry_date);
                return (
                  <Card key={coupon.id} className="border border-emerald-100 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative">
                          <img src={coupon.coupons_store.product_image || "/placeholder.png"} alt={coupon.coupons_store.product_name} className="w-20 h-20 rounded-lg object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-800">{coupon.coupons_store.product_name}</h3>
                              <p className="text-sm text-gray-600">{coupon.coupons_store.shop_name}</p>
                            </div>
                            <Badge variant={coupon.status === "active" ? "default" : coupon.status === "expired" ? "destructive" : "secondary"}>
                              {coupon.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>Expires: {new Date(coupon.coupons_store.expiry_date).toLocaleDateString()}</span>
                            {coupon.status === "active" && !isNaN(daysLeft) && (
                              <div className="flex items-center gap-1">
                                <Bell className="w-3 h-3 text-gray-400" />
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

          {/* Scan History and Payments tabs are unchanged */}
          <TabsContent value="scan-history">{/* ... */}</TabsContent>
          <TabsContent value="payments">{/* ... */}</TabsContent>
        </Tabs>
      </div>

      <Dialog open={showQRCode} onOpenChange={(isOpen) => { if (!isOpen) { setQrToken(null); } setShowQRCode(isOpen); }}>
        <DialogContent className="bg-white rounded-xl border-0 shadow-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-emerald-800">
              <QrCode className="w-5 h-5 text-emerald-600" /> Coupon QR Code
            </DialogTitle>
            {selectedCoupon && <DialogDescription className="text-gray-500">Show this code at {selectedCoupon.coupons_store.shop_name} to redeem. It will expire in 5 minutes.</DialogDescription>}
          </DialogHeader>
          <div className="flex justify-center items-center p-6 h-56">
            {isTokenLoading && <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />}
            {!isTokenLoading && qrToken && <QRCode value={qrToken} size={200} />}
            {!isTokenLoading && !qrToken && <p className="text-red-500 text-center">Failed to generate QR Code. Please try again.</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="outline" onClick={() => setShowQRCode(false)} className="text-gray-700 border-gray-200 hover:bg-gray-50">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}