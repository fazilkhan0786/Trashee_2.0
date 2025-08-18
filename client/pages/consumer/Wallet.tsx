import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Wallet, QrCode, Download, Calendar, Clock, FileImage, FileText, Coins, Gift, History, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOwnedCoupons, OwnedCoupon } from '@/lib/couponStoreService';
import { getUserTransactionHistory, TransactionHistory } from '@/lib/transactionHistoryService';
import { getUserScanHistory } from '@/lib/scanHistoryService';
import { supabase } from '@/lib/supabase';

// Using interfaces from services
export default function ConsumerWallet() {
  const navigate = useNavigate();
  const [selectedCoupon, setSelectedCoupon] = useState<OwnedCoupon | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [redeemedCoupons, setRedeemedCoupons] = useState<OwnedCoupon[]>([]);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load wallet data from Supabase
  useEffect(() => {
    async function loadWalletData() {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }
        
        // Load redeemed coupons
        const { success: couponsSuccess, data: couponsData, error: couponsError } = await getOwnedCoupons(user.id);
        if (couponsSuccess) {
          setRedeemedCoupons(couponsData || []);
        } else {
          console.error('Error fetching redeemed coupons:', couponsError);
        }
        
        // Load scan history
        const { success: scanSuccess, data: scanData, error: scanError } = await getUserScanHistory(user.id);
        if (scanSuccess) {
          setScanHistory(scanData || []);
        } else {
          console.error('Error fetching scan history:', scanError);
        }
        
        // Load transaction history
        const { success: transactionSuccess, data: transactionData, error: transactionError } = await getUserTransactionHistory(user.id);
        if (transactionSuccess) {
          setPaymentHistory(transactionData || []);
        } else {
          console.error('Error fetching transaction history:', transactionError);
        }
        
      } catch (err) {
        console.error('Unexpected error loading wallet data:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadWalletData();
  }, [navigate]);

  const handleDownloadInvoice = (payment: TransactionHistory) => {
    // Generate invoice content
    const invoiceContent = `
TRASHEE INVOICE
================
Invoice ID: ${payment.id}
Date: ${new Date(payment.created_at).toLocaleString()}
Description: ${payment.description}
Amount: ${payment.amount} points
Status: ${payment.status}

Thank you for using Trashee!
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${payment.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Data is loaded from Supabase in useEffect

  const downloadCouponAsImage = (coupon: OwnedCoupon) => {
    // Simulate download
    console.log(`Downloading ${coupon.product_name} as image`);
  };

  const downloadCouponAsPDF = (coupon: OwnedCoupon) => {
    // Simulate download
    console.log(`Downloading ${coupon.product_name} as PDF`);
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">My Wallet</h1>
            <p className="text-sm text-gray-500">Manage your coupons and transaction history</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="coupons" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="scan-history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Scan History
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Redeemed Coupons Tab */}
          <TabsContent value="coupons" className="space-y-4">
            {redeemedCoupons.map((coupon, index) => (
              <Card key={coupon.id} className={`animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img 
                      src={coupon.product_image}
                      alt={coupon.product_name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{coupon.product_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <img 
                              src={coupon.shop_logo}
                              alt={coupon.shop_name}
                              className="w-4 h-4 rounded-full"
                            />
                            <span className="text-sm text-gray-600">{coupon.shop_name}</span>
                          </div>
                        </div>
                        <Badge variant={
                          coupon.status === 'active' ? 'default' : 
                          coupon.status === 'expired' ? 'destructive' : 'secondary'
                        }>
                          {coupon.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Expires: {coupon.expiry_date}</span>
                          </div>
                          {coupon.status === 'active' && (
                            <div className="flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              <span className={
                                getDaysUntilExpiry(coupon.expiry_date) <= 7 ? 'text-red-600 font-medium' : ''
                              }>
                                {getDaysUntilExpiry(coupon.expiry_date)} days left
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">₹{coupon.discounted_price}</span>
                          <span className="text-sm text-gray-500 line-through">₹{coupon.value}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setShowQRCode(true);
                            }}
                            disabled={coupon.status !== 'active'}
                          >
                            <QrCode className="w-4 h-4 mr-1" />
                            QR Code
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedCoupon(coupon)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Scan History Tab */}
          <TabsContent value="scan-history" className="space-y-4">
            {scanHistory.map((item, index) => (
              <Card key={item.id} className={`animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      item.type === 'scan' ? 'bg-green-100' : 
                      item.type === 'ad' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {item.type === 'scan' ? (
                        <QrCode className="w-6 h-6 text-green-600" />
                      ) : item.type === 'ad' ? (
                        <Gift className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Gift className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.binId}</p>
                          <p className="text-sm text-gray-500">{item.location}</p>
                          <p className="text-xs text-gray-400">{item.timestamp}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            +{item.points} points
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1 capitalize">{item.type}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="payments" className="space-y-4">
            {paymentHistory.map((payment, index) => (
              <Card key={payment.id} className={`animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      payment.type === 'points_earned' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Coins className={`w-6 h-6 ${
                        payment.type === 'points_earned' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{payment.description}</p>
                          <p className="text-sm text-gray-500">{payment.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            payment.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {payment.amount > 0 ? '+' : ''}{payment.amount} points
                          </p>
                          <div className="flex items-center gap-2 justify-end">
                            <Badge variant={
                              payment.status === 'completed' ? 'default' :
                              payment.status === 'pending' ? 'secondary' : 'destructive'
                            } className="text-xs">
                              {payment.status}
                            </Badge>
                            {payment.status === 'completed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadInvoice(payment)}
                                className="p-1 h-auto"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Modal */}
      {showQRCode && selectedCoupon && (
        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Coupon QR Code</DialogTitle>
              <DialogDescription>
                Show this QR code at {selectedCoupon.shopName} for redemption
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-40 h-40 bg-black rounded-lg flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-white" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">QR Code: {selectedCoupon.qrCode}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">{selectedCoupon.productName}</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Shop:</strong> {selectedCoupon.shopName}</p>
                  <p><strong>Address:</strong> {selectedCoupon.shopAddress}</p>
                  <p><strong>Phone:</strong> {selectedCoupon.shopPhone}</p>
                  <p><strong>Value:</strong> ₹{selectedCoupon.discountedPrice}</p>
                  <p><strong>Expires:</strong> {selectedCoupon.expiryDate}</p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowQRCode(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Coupon Details Modal */}
      {selectedCoupon && !showQRCode && (
        <Dialog open={!!selectedCoupon} onOpenChange={() => setSelectedCoupon(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Coupon Details</DialogTitle>
              <DialogDescription>
                {selectedCoupon.productName} from {selectedCoupon.shopName}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <img 
                  src={selectedCoupon.productImage}
                  alt={selectedCoupon.productName}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedCoupon.productName}</h3>
                  <p className="text-sm text-gray-600">{selectedCoupon.shopName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-green-600">₹{selectedCoupon.discountedPrice}</span>
                    <span className="text-sm text-gray-500 line-through">₹{selectedCoupon.value}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Redeemed Date:</span>
                  <span>{selectedCoupon.redeemedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiry Date:</span>
                  <span>{selectedCoupon.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={selectedCoupon.status === 'active' ? 'default' : 'destructive'}>
                    {selectedCoupon.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Shop Address:</span>
                  <span className="text-right">{selectedCoupon.shopAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shop Phone:</span>
                  <span>{selectedCoupon.shopPhone}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => downloadCouponAsImage(selectedCoupon)}
                className="flex-1"
              >
                <FileImage className="w-4 h-4 mr-2" />
                Download as Image
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadCouponAsPDF(selectedCoupon)}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download as PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
