import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Camera, CheckCircle, X, Loader2, History, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { QrReader } from 'react-qr-reader';

// Types
interface ScanHistory {
  id: string;
  trashbin_id: string;
  scanned_at: string;
  points_awarded: number;
}
interface ScannedCouponDetails {
  owned_coupon_id: string;
  product_name: string;
  product_image: string;
  shop_name: string;
  discounted_price: number;
  expiry_date: string;
}

export default function PartnerScanner() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('validate-coupon');

  // State for Bin Scanning
  const [isBinScanning, setIsBinScanning] = useState(false);
  const [lastBinScan, setLastBinScan] = useState<any>(null);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [binScanHistory, setBinScanHistory] = useState<ScanHistory[]>([]);
  const [noBinQrMessage, setNoBinQrMessage] = useState(false);

  // State for Coupon Validation flow
  const [isCouponScanning, setIsCouponScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error'; message: string; } | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [scannedCouponDetails, setScannedCouponDetails] = useState<ScannedCouponDetails | null>(null);

  useEffect(() => {
    if (activeTab === 'scan-bin') fetchBinScanHistory();
  }, [activeTab]);

  const fetchBinScanHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("scan_history")
      .select("*")
      .eq("profiles_id", user.id)
      .order("scanned_at", { ascending: false })
      .limit(5);
    if (!error) setBinScanHistory(data || []);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldownTime > 0) {
      timer = setInterval(() => setCooldownTime(t => t > 0 ? t - 1 : 0), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownTime]);

  const formatCooldownTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = (s % 60).toString().padStart(2, '0');
    return `${m}:${rs}`;
  };

  const handleBinScan = async (data: string) => {
    if (data && isBinScanning && cooldownTime === 0) {
      setIsBinScanning(false);
      setNoBinQrMessage(false);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const points = Math.floor(Math.random() * 20) + 10;
      const location = ["Site A", "Site B", "Site C"][Math.floor(Math.random() * 3)];

      await supabase.from("scan_history").insert({
        profiles_id: user.id,
        trashbin_id: data,
        location,
        points_awarded: points,
        scanned_at: new Date().toISOString(),
        scan_type: "partner_scan",
        status: "completed",
      });

      await supabase.rpc('increment_user_points', {
        user_id_input: user.id,
        points_to_add: points,
      });

      const newScan = { id: data, location, timestamp: new Date().toLocaleString("en-IN"), points };
      setLastBinScan(newScan);
      setCooldownTime(300);
      fetchBinScanHistory();
    }
  };

  const handleScan = async (token: string, source: 'manual'|'scan' = 'manual') => {
    if (source === 'scan') setIsCouponScanning(false);
    if (!token.trim()) return;

    setIsProcessing(true);
    setScanResult(null);

    const { data, error } = await supabase.rpc('validate_coupon_token', { token_input: token });

    if (error) {
      setScanResult({ type: 'error', message: error.message });
    } else if (data && data.length > 0) {
      setScannedCouponDetails(data[0]);
      setShowRedeemModal(true);
    } else {
      setScanResult({ type: 'error', message: 'Coupon not found. It may have already been used or is expired.' });
    }
    
    setIsProcessing(false);
    setManualToken('');
  };

  const handleConfirmRedeem = async () => {
    if (!scannedCouponDetails) return;

    setIsProcessing(true);
    const { data, error } = await supabase.rpc('confirm_redeem_owned_coupon', { 
      owned_coupon_id_arg: scannedCouponDetails.owned_coupon_id 
    });

    if (error) {
      setScanResult({ type: 'error', message: error.message });
    } else {
      setScanResult({ type: 'success', message: data });
    }

    setIsProcessing(false);
    setShowRedeemModal(false);
    setScannedCouponDetails(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pb-20 relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>

      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-4 shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2 text-white hover:bg-white/20 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Scanner & Validator</h1>
            <p className="text-indigo-100 text-sm">Scan bins or validate coupons</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex border rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="scan-bin" className="flex-1 text-center py-2 data-[state=active]:bg-white data-[state=active]:text-purple-700">Scan Bin</TabsTrigger>
            <TabsTrigger value="validate-coupon" className="flex-1 text-center py-2 data-[state=active]:bg-white data-[state=active]:text-purple-700">Validate Coupon</TabsTrigger>
          </TabsList>

          <TabsContent value="scan-bin" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-green-600" />Scan Trash Bin</CardTitle>
                <CardDescription>Earn points by scanning partner bin QR codes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => { setIsBinScanning(true); setNoBinQrMessage(false); }} disabled={cooldownTime > 0 || isBinScanning} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:from-purple-700 hover:to-indigo-700">
                  {cooldownTime > 0 ? `Next scan in ${formatCooldownTime(cooldownTime)}` : 'Start Bin Scan'}
                </Button>
                {isBinScanning && (
                  <div className="p-4 border rounded-lg bg-white/80">
                    <QrReader constraints={{ facingMode: 'environment' }} onResult={(res, err) => { if (res) handleBinScan(res.getText()); if (err && !noBinQrMessage) setNoBinQrMessage(true); }} />
                    {noBinQrMessage && <p className="text-red-600 text-sm text-center mt-2">No QR detected. Please align again.</p>}
                  </div>
                )}
                {lastBinScan && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader><CardTitle className="text-green-700 flex items-center gap-2"><CheckCircle className="w-5 h-5" />Scan Success</CardTitle></CardHeader>
                    <CardContent>
                      <p className="font-semibold text-green-800">You earned +{lastBinScan.points} pts!</p>
                      <p>Bin ID: <Badge>{lastBinScan.id}</Badge></p>
                      <p>Location: {lastBinScan.location}</p>
                      <p className="text-sm text-gray-600">{lastBinScan.timestamp}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg">
              <CardHeader><CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-gray-600" />Recent Bin Scans</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {binScanHistory.length > 0 ? (
                  binScanHistory.map(scan => (
                    <div key={scan.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div>
                        <p className="font-medium">ID: {scan.trashbin_id}</p>
                        <p className="text-xs text-gray-500">{new Date(scan.scanned_at).toLocaleString('en-IN')}</p>
                      </div>
                      <Badge className="text-green-600 bg-green-100 border-0">+{scan.points_awarded} pts</Badge>
                    </div>
                  ))
                ) : (<p className="text-gray-500 text-center">No recent scans</p>)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validate-coupon" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Coupon Validator</CardTitle>
                <CardDescription>Scan a customer's QR code to validate their coupon.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Enter secure token manually..." value={manualToken} onChange={e => { setManualToken(e.target.value); setScanResult(null); }} />
                  <Button onClick={() => handleScan(manualToken)} disabled={!manualToken.trim() || isProcessing} className="w-32">
                    {isProcessing ? <Loader2 className="animate-spin" /> : 'Validate'}
                  </Button>
                </div>
                <div className="relative flex items-center"><div className="flex-grow border-t border-gray-300"></div><span className="flex-shrink mx-4 text-sm text-gray-500">OR</span><div className="flex-grow border-t border-gray-300"></div></div>
                <Button onClick={() => setIsCouponScanning(c => !c)} variant="outline" className="w-full flex items-center justify-center gap-2">
                  {isCouponScanning ? 'Close Scanner' : 'Scan Coupon QR'} <Camera className="w-4 h-4" />
                </Button>
                {isCouponScanning && (
                  <div className="p-4 border rounded-lg bg-white/80">
                    <QrReader constraints={{ facingMode: 'environment' }} onResult={(res) => { if (res) handleScan(res.getText(), 'scan'); }} />
                  </div>
                )}
              </CardContent>
            </Card>

            {scanResult && (
              <Card className={scanResult.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${scanResult.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {scanResult.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    {scanResult.type === 'success' ? 'Redemption Complete' : 'Validation Error'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-800 font-semibold">{scanResult.message}</CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {scannedCouponDetails && (
        <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
          <DialogContent className="bg-white rounded-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Gift className="w-5 h-5 text-purple-600" />
                Confirm Redemption
              </DialogTitle>
              <DialogDescription>Please confirm the details before redeeming this coupon.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <div className="flex items-center gap-4">
                <img src={scannedCouponDetails.product_image || '/placeholder.png'} alt={scannedCouponDetails.product_name} className="w-24 h-24 object-cover rounded-lg"/>
                <div>
                  <h3 className="font-bold text-lg">{scannedCouponDetails.product_name}</h3>
                  <p className="text-sm text-gray-600">{scannedCouponDetails.shop_name}</p>
                  <p className="font-bold text-purple-700 text-xl mt-1">₹{scannedCouponDetails.discounted_price}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Expires: {new Date(scannedCouponDetails.expiry_date).toLocaleDateString()}</p>
            </div>
            <DialogFooter className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setShowRedeemModal(false)}>Cancel</Button>
              <Button onClick={handleConfirmRedeem} disabled={isProcessing} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                {isProcessing ? <Loader2 className="animate-spin" /> : 'Confirm Redeem'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
