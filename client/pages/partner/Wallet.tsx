import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Wallet, QrCode, FileImage, FileText, Coins, Gift, History, Bell, Store, Plus, Edit, Trash2, Eye, MoreVertical, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface RedeemedCoupon {
  id: string;
  productName: string;
  shopName: string;
  shopLogo: string;
  productImage: string;
  value: number;
  discountedPrice: number;
  redeemedDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'used';
  qrCode: string;
  shopAddress: string;
  shopPhone: string;
}

interface MyAddedCoupon {
  id: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  discountedPrice: number;
  status: 'pending' | 'approved' | 'rejected';
  createdDate: string;
  expiryDate: string;
  redemptions: number;
  totalQuantity: number;
}

interface ScanHistoryItem {
  id: string;
  binId: string;
  location: string;
  timestamp: string;
  points: number;
  type: 'scan' | 'ad' | 'referral' | 'coupon_sale';
}

interface PaymentHistoryItem {
  id: string;
  type: 'coupon_redemption' | 'points_earned' | 'premium_purchase';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function PartnerWallet() {
  const navigate = useNavigate();
  const [selectedCoupon, setSelectedCoupon] = useState<RedeemedCoupon | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<MyAddedCoupon | null>(null);

  const handleEditCoupon = (coupon: MyAddedCoupon) => {
    try {
      setEditingCoupon(coupon);
      setShowEditDialog(true);
    } catch (error) {
      console.error('Edit coupon error:', error);
      alert('Error opening edit dialog. Please try again.');
    }
  };

  const handleViewCoupon = (coupon: MyAddedCoupon) => {
    try {
      setEditingCoupon(coupon);
      setShowViewDialog(true);
    } catch (error) {
      console.error('View coupon error:', error);
      alert('Error opening view dialog. Please try again.');
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    try {
      if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
        console.log('Deleting coupon:', couponId);
        alert('✅ Coupon deleted successfully!');
      }
    } catch (error) {
      console.error('Delete coupon error:', error);
      alert('Error deleting coupon. Please try again.');
    }
  };

  const handleSaveCoupon = () => {
    if (editingCoupon) {
      console.log('Saving coupon:', editingCoupon);
      alert('Coupon updated successfully!');
      setShowEditDialog(false);
      setEditingCoupon(null);
    }
  };

  const handleDownloadInvoice = (payment: PaymentHistoryItem) => {
    // Generate partner invoice content
    const invoiceContent = `
TRASHEE PARTNER INVOICE
========================
Invoice ID: ${payment.id}
Date: ${payment.date}
Description: ${payment.description}
Amount: ₹${Math.abs(payment.amount)}
Status: ${payment.status}

Partner Business Details:
Thank you for partnering with Trashee!
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partner-invoice-${payment.id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const redeemedCoupons: RedeemedCoupon[] = [
    
  ];

  const myAddedCoupons: MyAddedCoupon[] = [
    
  ];

  const scanHistory: ScanHistoryItem[] = [
    
  ];

  const paymentHistory: PaymentHistoryItem[] = [
   
  ];

  const downloadCouponAsImage = (coupon: RedeemedCoupon) => {
    console.log(`Downloading ${coupon.productName} as image`);
  };

  const downloadCouponAsPDF = (coupon: RedeemedCoupon) => {
    console.log(`Downloading ${coupon.productName} as PDF`);
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
            <h1 className="text-xl font-bold">Partner Wallet</h1>
            <p className="text-sm text-gray-500">Manage coupons, transactions and earnings</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="my-coupons" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="my-coupons" className="flex items-center gap-1 text-xs">
              <Store className="w-3 h-3" />
              My Coupons
            </TabsTrigger>
            <TabsTrigger value="redeemed" className="flex items-center gap-1 text-xs">
              <Gift className="w-3 h-3" />
              Redeemed
            </TabsTrigger>
            <TabsTrigger value="scan-history" className="flex items-center gap-1 text-xs">
              <History className="w-3 h-3" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1 text-xs">
              <Coins className="w-3 h-3" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* My Added Coupons Tab */}
          <TabsContent value="my-coupons" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">My Added Coupons</h3>
              <Button size="sm" onClick={() => navigate('/partner/add-coupon')}>
                <Plus className="w-4 h-4 mr-1" />
                Add New
              </Button>
            </div>
            
            {myAddedCoupons.map((coupon, index) => (
              <Card key={coupon.id} className={`animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img 
                      src={coupon.productImage}
                      alt={coupon.productName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{coupon.productName}</h3>
                          <p className="text-sm text-gray-500">Created: {coupon.createdDate}</p>
                        </div>
                        <Badge variant={
                          coupon.status === 'approved' ? 'default' : 
                          coupon.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {coupon.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-4">
                          <span>Expires: {coupon.expiryDate}</span>
                          <span>Redeemed: {coupon.redemptions}/{coupon.totalQuantity}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">���{coupon.discountedPrice}</span>
                          <span className="text-sm text-gray-500 line-through">₹{coupon.originalPrice}</span>
                          <Badge variant="destructive" className="text-xs">
                            {Math.round(((coupon.originalPrice - coupon.discountedPrice) / coupon.originalPrice) * 100)}% OFF
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-3">
                            <p className="text-sm text-green-600 font-medium">
                              Earned: ₹{(coupon.redemptions * (coupon.originalPrice - coupon.discountedPrice) * 0.1).toFixed(0)}
                            </p>
                            <p className="text-xs text-gray-500">Commission (10%)</p>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-2">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewCoupon(coupon)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditCoupon(coupon)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Coupon
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Coupon
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Redeemed Coupons Tab */}
          <TabsContent value="redeemed" className="space-y-4">
            {redeemedCoupons.map((coupon, index) => (
              <Card key={coupon.id} className={`animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img 
                      src={coupon.productImage}
                      alt={coupon.productName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{coupon.productName}</h3>
                          <p className="text-sm text-gray-600">{coupon.shopName}</p>
                        </div>
                        <Badge variant={coupon.status === 'active' ? 'default' : 'destructive'}>
                          {coupon.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">₹{coupon.discountedPrice}</span>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Activity History Tab */}
          <TabsContent value="scan-history" className="space-y-4">
            {scanHistory.map((item, index) => (
              <Card key={item.id} className={`animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      item.type === 'scan' ? 'bg-green-100' : 
                      item.type === 'ad' ? 'bg-blue-100' : 
                      item.type === 'coupon_sale' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {item.type === 'scan' ? (
                        <QrCode className="w-6 h-6 text-green-600" />
                      ) : item.type === 'ad' ? (
                        <Gift className="w-6 h-6 text-blue-600" />
                      ) : item.type === 'coupon_sale' ? (
                        <Store className="w-6 h-6 text-purple-600" />
                      ) : (
                        <Gift className="w-6 h-6 text-orange-600" />
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
                          <p className="text-xs text-gray-500 mt-1 capitalize">{item.type.replace('_', ' ')}</p>
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
                      payment.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Coins className={`w-6 h-6 ${
                        payment.amount > 0 ? 'text-green-600' : 'text-red-600'
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
                            {payment.amount > 0 ? '+' : ''}₹{Math.abs(payment.amount)}
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
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => downloadCouponAsImage(selectedCoupon)}
                className="flex-1"
              >
                <FileImage className="w-4 h-4 mr-2" />
                Download Image
              </Button>
              <Button 
                variant="outline" 
                onClick={() => downloadCouponAsPDF(selectedCoupon)}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Coupon Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update your coupon details
            </DialogDescription>
          </DialogHeader>

          {editingCoupon && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="coupon-name">Product Name</Label>
                <Input
                  id="coupon-name"
                  value={editingCoupon.productName}
                  onChange={(e) => setEditingCoupon({...editingCoupon, productName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="original-price">Original Price</Label>
                  <Input
                    id="original-price"
                    type="number"
                    value={editingCoupon.originalPrice}
                    onChange={(e) => setEditingCoupon({...editingCoupon, originalPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="discount-price">Discounted Price</Label>
                  <Input
                    id="discount-price"
                    type="number"
                    value={editingCoupon.discountedPrice}
                    onChange={(e) => setEditingCoupon({...editingCoupon, discountedPrice: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Total Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={editingCoupon.totalQuantity}
                    onChange={(e) => setEditingCoupon({...editingCoupon, totalQuantity: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={editingCoupon.expiryDate}
                    onChange={(e) => setEditingCoupon({...editingCoupon, expiryDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCoupon}>
              <Edit className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Coupon Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Coupon Details</DialogTitle>
            <DialogDescription>
              View complete coupon information
            </DialogDescription>
          </DialogHeader>

          {editingCoupon && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={editingCoupon.productImage}
                  alt={editingCoupon.productName}
                  className="w-32 h-32 rounded-lg object-cover mx-auto mb-4"
                />
                <h3 className="font-semibold text-lg">{editingCoupon.productName}</h3>
                <Badge className={
                  editingCoupon.status === 'approved' ? 'bg-green-100 text-green-800' :
                  editingCoupon.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {editingCoupon.status.charAt(0).toUpperCase() + editingCoupon.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Original Price:</span>
                  <span className="text-sm font-medium">₹{editingCoupon.originalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discounted Price:</span>
                  <span className="text-sm font-medium text-green-600">₹{editingCoupon.discountedPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm font-medium text-orange-600">
                    {Math.round(((editingCoupon.originalPrice - editingCoupon.discountedPrice) / editingCoupon.originalPrice) * 100)}% OFF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Redeemed:</span>
                  <span className="text-sm font-medium">{editingCoupon.redemptions}/{editingCoupon.totalQuantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm">{editingCoupon.createdDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expires:</span>
                  <span className="text-sm">{editingCoupon.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Earned:</span>
                  <span className="text-sm font-medium text-green-600">
                    ₹{(editingCoupon.redemptions * (editingCoupon.originalPrice - editingCoupon.discountedPrice) * 0.1).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowViewDialog(false);
              if (editingCoupon) handleEditCoupon(editingCoupon);
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
