import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Gift, Plus, Search, Filter, MapPin, Calendar, Activity, Eye, Edit, Trash2, CheckCircle, AlertCircle, Clock, Store, Users, Coins, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CouponData {
  id: string;
  productName: string;
  productImage: string;
  shopLogo: string;
  shopName: string;
  pointsCost: number;
  originalPrice: number;
  discountedPrice: number;
  expiryDate: string;
  category: string;
  distance: string;
  rating: number;
  description: string;
  quantity: number;
  status: 'active' | 'inactive' | 'expired';
  redeemed: number;
  createdAt: string;
  lastUpdated: string;
  qrCode?: string;
}

export default function CouponManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponData | null>(null);

  const [newCoupon, setNewCoupon] = useState<Partial<CouponData>>({
    category: 'Food',
    status: 'active',
    quantity: 1,
    rating: 4.0
  });

  const [coupons, setCoupons] = useState<CouponData[]>([
   
  ]);

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || coupon.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || coupon.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateCoupon = () => {
    if (!newCoupon.productName || !newCoupon.shopName || !newCoupon.pointsCost) return;

    const couponId = `CP${String(coupons.length + 1).padStart(3, '0')}`;
    const newCouponData: CouponData = {
      id: couponId,
      productName: newCoupon.productName,
      productImage: newCoupon.productImage || '/placeholder.svg',
      shopLogo: newCoupon.shopLogo || '/placeholder.svg',
      shopName: newCoupon.shopName,
      pointsCost: newCoupon.pointsCost || 0,
      originalPrice: newCoupon.originalPrice || 0,
      discountedPrice: newCoupon.discountedPrice || 0,
      expiryDate: newCoupon.expiryDate || '',
      category: newCoupon.category || 'Food',
      distance: newCoupon.distance || '0 km',
      rating: newCoupon.rating || 4.0,
      description: newCoupon.description || '',
      quantity: newCoupon.quantity || 1,
      status: newCoupon.status as any,
      redeemed: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      qrCode: `TRASHEE_COUPON_${couponId}`
    };

    setCoupons([...coupons, newCouponData]);
    setNewCoupon({
      category: 'Food',
      status: 'active',
      quantity: 1,
      rating: 4.0
    });
    setShowCreateDialog(false);
  };

  const handleEditCoupon = () => {
    if (!selectedCoupon || !newCoupon.productName) return;

    const updatedCoupon: CouponData = {
      ...selectedCoupon,
      ...newCoupon,
      lastUpdated: new Date().toISOString().split('T')[0]
    } as CouponData;

    setCoupons(coupons.map(coupon => 
      coupon.id === selectedCoupon.id ? updatedCoupon : coupon
    ));
    
    setShowEditDialog(false);
    setSelectedCoupon(null);
    setNewCoupon({
      category: 'Food',
      status: 'active',
      quantity: 1,
      rating: 4.0
    });
  };

  const handleDeleteCoupon = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      setCoupons(coupons.filter(coupon => coupon.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setCoupons(coupons.map(coupon => 
      coupon.id === id 
        ? { ...coupon, status: coupon.status === 'active' ? 'inactive' : 'active', lastUpdated: new Date().toISOString().split('T')[0] }
        : coupon
    ));
  };

  const handleAssignQRCode = (couponId: string) => {
    const qrCode = `TRASHEE_COUPON_${couponId}_${Date.now()}`;
    setCoupons(coupons.map(coupon => 
      coupon.id === couponId 
        ? { ...coupon, qrCode, lastUpdated: new Date().toISOString().split('T')[0] }
        : coupon
    ));
    alert(`QR Code assigned successfully!\nQR Code: ${qrCode}`);
  };

  const handleAssignAllQRCodes = () => {
    const updatedCoupons = coupons.map(coupon => ({
      ...coupon,
      qrCode: `TRASHEE_COUPON_${coupon.id}_${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    }));
    setCoupons(updatedCoupons);
    alert('QR Codes assigned to all coupons successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food': return 'bg-orange-100 text-orange-800';
      case 'Entertainment': return 'bg-purple-100 text-purple-800';
      case 'Lifestyle': return 'bg-blue-100 text-blue-800';
      case 'Health': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center justify-between">
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
              <h1 className="text-xl font-bold">Coupon Management</h1>
              <p className="text-sm text-gray-500">Manage all coupons available in the coupon store</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAssignAllQRCodes}>
              <QrCode className="w-4 h-4 mr-2" />
              Assign All QR Codes
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Coupon</DialogTitle>
                  <DialogDescription>
                    Add a new coupon to the coupon store
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="product-name">Product Name *</Label>
                      <Input
                        id="product-name"
                        placeholder="Enter product name"
                        value={newCoupon.productName || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, productName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shop-name">Shop Name *</Label>
                      <Input
                        id="shop-name"
                        placeholder="Enter shop name"
                        value={newCoupon.shopName || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, shopName: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter coupon description"
                      value={newCoupon.description || ''}
                      onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="points-cost">Points Cost *</Label>
                      <Input
                        id="points-cost"
                        type="number"
                        placeholder="150"
                        value={newCoupon.pointsCost || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, pointsCost: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="original-price">Original Price</Label>
                      <Input
                        id="original-price"
                        type="number"
                        placeholder="299"
                        value={newCoupon.originalPrice || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, originalPrice: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="discounted-price">Discounted Price</Label>
                      <Input
                        id="discounted-price"
                        type="number"
                        placeholder="199"
                        value={newCoupon.discountedPrice || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discountedPrice: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newCoupon.category} onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Food">Food</SelectItem>
                          <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="25"
                        value={newCoupon.quantity || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, quantity: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input
                        id="expiry-date"
                        type="date"
                        value={newCoupon.expiryDate || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="distance">Distance</Label>
                      <Input
                        id="distance"
                        placeholder="0.5 km"
                        value={newCoupon.distance || ''}
                        onChange={(e) => setNewCoupon({ ...newCoupon, distance: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCoupon}>
                    <Gift className="w-4 h-4 mr-2" />
                    Create Coupon
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.length}</p>
                  <p className="text-xs text-gray-600">Total Coupons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.filter(c => c.status === 'active').length}</p>
                  <p className="text-xs text-gray-600">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + c.redeemed, 0)}</p>
                  <p className="text-xs text-gray-600">Total Redeemed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(coupons.map(c => c.shopName)).size}</p>
                  <p className="text-xs text-gray-600">Partner Shops</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Lifestyle">Lifestyle</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Coupons List */}
        <div className="space-y-3">
          {filteredCoupons.map((coupon, index) => (
            <Card key={coupon.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={coupon.productImage} 
                        alt={coupon.productName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{coupon.productName}</h3>
                        <Badge className={getCategoryColor(coupon.category)}>
                          {coupon.category}
                        </Badge>
                        <Badge className={getStatusColor(coupon.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(coupon.status)}
                            {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          {coupon.shopName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {coupon.pointsCost} points
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {coupon.redeemed}/{coupon.quantity} redeemed
                        </span>
                        {coupon.qrCode && (
                          <span className="flex items-center gap-1">
                            <QrCode className="w-3 h-3" />
                            QR Assigned
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>₹{coupon.discountedPrice} (was ₹{coupon.originalPrice})</span>
                        <span>Expires: {coupon.expiryDate}</span>
                        <span>Updated: {coupon.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCoupon(coupon);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCoupon(coupon);
                        setNewCoupon({...coupon});
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssignQRCode(coupon.id)}
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      QR Code
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(coupon.id)}
                    >
                      {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCoupons.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No coupons found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Coupon Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Coupon Details</DialogTitle>
            <DialogDescription>
              View coupon information and redemption statistics
            </DialogDescription>
          </DialogHeader>
          
          {selectedCoupon && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <img 
                    src={selectedCoupon.productImage} 
                    alt={selectedCoupon.productName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-semibold text-lg">{selectedCoupon.productName}</h3>
                <p className="text-sm text-gray-500">{selectedCoupon.id}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Shop:</span>
                  <span className="text-sm font-medium">{selectedCoupon.shopName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <Badge className={getCategoryColor(selectedCoupon.category)}>
                    {selectedCoupon.category}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={getStatusColor(selectedCoupon.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedCoupon.status)}
                      {selectedCoupon.status.charAt(0).toUpperCase() + selectedCoupon.status.slice(1)}
                    </div>
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Points Cost:</span>
                  <span className="text-sm font-semibold">{selectedCoupon.pointsCost}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-sm">₹{selectedCoupon.discountedPrice} (was ₹{selectedCoupon.originalPrice})</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <span className="text-sm">{selectedCoupon.quantity} available</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Redeemed:</span>
                  <span className="text-sm font-semibold">{selectedCoupon.redeemed}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expires:</span>
                  <span className="text-sm">{selectedCoupon.expiryDate}</span>
                </div>
                
                {selectedCoupon.qrCode && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">QR Code:</span>
                    <span className="text-sm font-mono">{selectedCoupon.qrCode}</span>
                  </div>
                )}
                
                {selectedCoupon.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="text-sm mt-1">{selectedCoupon.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update coupon information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-product-name">Product Name *</Label>
                <Input
                  id="edit-product-name"
                  placeholder="Enter product name"
                  value={newCoupon.productName || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, productName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-shop-name">Shop Name *</Label>
                <Input
                  id="edit-shop-name"
                  placeholder="Enter shop name"
                  value={newCoupon.shopName || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, shopName: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter coupon description"
                value={newCoupon.description || ''}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-points-cost">Points Cost *</Label>
                <Input
                  id="edit-points-cost"
                  type="number"
                  placeholder="150"
                  value={newCoupon.pointsCost || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, pointsCost: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-original-price">Original Price</Label>
                <Input
                  id="edit-original-price"
                  type="number"
                  placeholder="299"
                  value={newCoupon.originalPrice || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, originalPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-discounted-price">Discounted Price</Label>
                <Input
                  id="edit-discounted-price"
                  type="number"
                  placeholder="199"
                  value={newCoupon.discountedPrice || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountedPrice: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={newCoupon.category} onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  placeholder="25"
                  value={newCoupon.quantity || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, quantity: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-expiry-date">Expiry Date</Label>
                <Input
                  id="edit-expiry-date"
                  type="date"
                  value={newCoupon.expiryDate || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={newCoupon.status} onValueChange={(value) => setNewCoupon({ ...newCoupon, status: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCoupon}>
              <Edit className="w-4 h-4 mr-2" />
              Update Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
