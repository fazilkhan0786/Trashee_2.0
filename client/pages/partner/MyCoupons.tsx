import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Search, Edit, Trash2, Calendar, Coins, Star, Eye, EyeOff, Plus, Store, Users, MapPin, BarChart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Coupon {
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
  description: string;
  quantity: number;
  totalQuantity: number;
  type: 'bulk' | 'single';
  status: 'active' | 'inactive' | 'expired';
  views: number;
  redeemed: number;
  createdAt: string;
}

export default function PartnerMyCoupons() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [myCoupons, setMyCoupons] = useState<Coupon[]>([
    
  ]);

  const categories = ['Electronics', 'Food', 'Health', 'Lifestyle', 'Entertainment'];
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'expired', label: 'Expired' }
  ];

  const filteredCoupons = myCoupons.filter(coupon => {
    const matchesSearch = coupon.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || statusFilter === '' || coupon.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon({ ...coupon });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingCoupon) return;
    
    setMyCoupons(prev => prev.map(coupon => 
      coupon.id === editingCoupon.id ? editingCoupon : coupon
    ));
    setIsEditDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleDeleteCoupon = (couponId: string) => {
    setMyCoupons(prev => prev.filter(coupon => coupon.id !== couponId));
  };

  const handleToggleStatus = (couponId: string) => {
    setMyCoupons(prev => prev.map(coupon => 
      coupon.id === couponId 
        ? { ...coupon, status: coupon.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' | 'expired' }
        : coupon
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCoupons = myCoupons.length;
  const activeCoupons = myCoupons.filter(c => c.status === 'active').length;
  const totalViews = myCoupons.reduce((sum, c) => sum + c.views, 0);
  const totalRedeemed = myCoupons.reduce((sum, c) => sum + c.redeemed, 0);

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
          <div className="flex-1">
            <h1 className="text-xl font-bold">My Coupons</h1>
            <p className="text-sm text-gray-500">Manage your coupon offerings</p>
          </div>
          <Button 
            onClick={() => navigate('/partner/add-coupon')}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCoupons}</p>
                  <p className="text-xs text-gray-500">Total Coupons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Store className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeCoupons}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalViews}</p>
                  <p className="text-xs text-gray-500">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalRedeemed}</p>
                  <p className="text-xs text-gray-500">Redeemed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search your coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Coupons List */}
        <div className="space-y-4">
          {filteredCoupons.map((coupon, index) => (
            <Card key={coupon.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-24 h-24 bg-gray-200 flex-shrink-0 relative">
                    <img 
                      src={coupon.productImage} 
                      alt={coupon.productName}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      variant={coupon.type === 'bulk' ? 'default' : 'secondary'} 
                      className="absolute top-1 left-1 text-xs"
                    >
                      {coupon.type}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1">{coupon.productName}</h3>
                        <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {coupon.views} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {coupon.redeemed}/{coupon.totalQuantity} redeemed
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {coupon.quantity} left
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={getStatusColor(coupon.status)}>
                          {coupon.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-yellow-500" />
                          <span className="text-sm font-semibold">{coupon.pointsCost}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">₹{coupon.discountedPrice}</span>
                        <span className="text-sm text-gray-500 line-through">₹{coupon.originalPrice}</span>
                        <span className="text-xs text-gray-500">Exp: {coupon.expiryDate}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(coupon.id)}
                          disabled={coupon.status === 'expired'}
                        >
                          {coupon.status === 'active' ? (
                            <><EyeOff className="w-4 h-4 mr-1" />Deactivate</>
                          ) : (
                            <><Eye className="w-4 h-4 mr-1" />Activate</>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCoupon(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{coupon.productName}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCoupons.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No coupons found</p>
            <p className="text-sm text-gray-400">Create your first coupon to get started</p>
            <Button 
              onClick={() => navigate('/partner/add-coupon')}
              className="mt-4 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </div>
        )}
      </div>

      {/* Edit Coupon Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update your coupon details
            </DialogDescription>
          </DialogHeader>
          
          {editingCoupon && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={editingCoupon.productName}
                  onChange={(e) => setEditingCoupon({...editingCoupon, productName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingCoupon.description}
                  onChange={(e) => setEditingCoupon({...editingCoupon, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={editingCoupon.originalPrice}
                    onChange={(e) => setEditingCoupon({...editingCoupon, originalPrice: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="discountedPrice">Discounted Price</Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    value={editingCoupon.discountedPrice}
                    onChange={(e) => setEditingCoupon({...editingCoupon, discountedPrice: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="pointsCost">Points Cost</Label>
                  <Input
                    id="pointsCost"
                    type="number"
                    value={editingCoupon.pointsCost}
                    onChange={(e) => setEditingCoupon({...editingCoupon, pointsCost: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Available Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={editingCoupon.quantity}
                    onChange={(e) => setEditingCoupon({...editingCoupon, quantity: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={editingCoupon.expiryDate}
                  onChange={(e) => setEditingCoupon({...editingCoupon, expiryDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={editingCoupon.category} 
                  onValueChange={(value) => setEditingCoupon({...editingCoupon, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
