import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Gift, Plus, Search, Filter, Activity, Eye, Edit, Trash2, CheckCircle, AlertCircle, Clock, Store, Users, Coins, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// 1. UPDATED INTERFACE: Matches your 'coupons_store' schema
interface CouponData {
  id: string;
  product_name: string;
  product_image: string | null;
  shop_logo: string | null;
  shop_name: string;
  points_cost: number;
  original_price: number;
  discounted_price: number;
  expiry_date: string;
  category: string | null;
  distance: string | null;
  rating: number | null;
  description: string | null;
  quantity: number;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

// This interface for partner requests is unchanged
interface PartnerCouponRequest {
  id: string;
  partner_id: string;
  product_name: string;
  shop_name: string;
  product_description: string | null;
  offer_type: string;
  quantity: number | null;
  original_price: number;
  discounted_price: number;
  points_price: number;
  expiry_date: string;
  category: string | null;
  pincode: string | null;
  product_image_url: string | null;
  shop_logo_url: string | null;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
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

  // 2. UPDATED STATE: 'newCoupon' now uses snake_case and 'is_active'
  const [newCoupon, setNewCoupon] = useState<Partial<CouponData>>({
    category: 'Food',
    is_active: true,
    quantity: 1,
    rating: 4.0
  });

  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [requests, setRequests] = useState<PartnerCouponRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. UPDATED FETCH: Now points to 'coupons_store'
  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons_store')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setCoupons(data as CouponData[]);
    if (error) console.error('Error fetching coupons:', error);
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('partner_coupon_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (data) setRequests(data as PartnerCouponRequest[]);
    if (error) console.error('Error fetching requests:', error);
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchCoupons(), fetchRequests()]).then(() => {
      setIsLoading(false);
    });
  }, []);


  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         coupon.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || coupon.category === filterCategory;
    // 4. UPDATED FILTER: Checks 'is_active' boolean
    const matchesStatus = filterStatus === 'all' ||
                        (filterStatus === 'active' && coupon.is_active === true) ||
                        (filterStatus === 'inactive' && coupon.is_active === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 5. UPDATED HANDLER: Inserts into 'coupons_store' with snake_case
  const handleCreateCoupon = async () => {
    if (!newCoupon.product_name || !newCoupon.shop_name || !newCoupon.points_cost) return;

    const couponToInsert = {
      product_name: newCoupon.product_name,
      product_image: newCoupon.product_image || '/placeholder.svg',
      shop_logo: newCoupon.shop_logo || '/placeholder.svg',
      shop_name: newCoupon.shop_name,
      points_cost: newCoupon.points_cost || 0,
      original_price: newCoupon.original_price || 0,
      discounted_price: newCoupon.discounted_price || 0,
      expiry_date: newCoupon.expiry_date || new Date().toISOString().split('T')[0],
      category: newCoupon.category || 'Food',
      distance: newCoupon.distance || '0 km',
      rating: newCoupon.rating || 4.0,
      description: newCoupon.description || '',
      quantity: newCoupon.quantity || 1,
      is_active: newCoupon.is_active,
    };

    const { error } = await supabase.from('coupons_store').insert(couponToInsert);

    if (error) {
      alert('Error creating coupon: ' + error.message);
    } else {
      await fetchCoupons();
      setNewCoupon({
        category: 'Food',
        is_active: true,
        quantity: 1,
        rating: 4.0
      });
      setShowCreateDialog(false);
    }
  };

  // 6. UPDATED HANDLER: Edits 'coupons_store'
  const handleEditCoupon = async () => {
    if (!selectedCoupon || !newCoupon.product_name) return;

    const couponToUpdate = {
      ...newCoupon,
      updated_at: new Date().toISOString()
    };
    
    delete couponToUpdate.id;
    delete couponToUpdate.created_at;
    
    const { error } = await supabase
      .from('coupons_store')
      .update(couponToUpdate)
      .eq('id', selectedCoupon.id);

    if (error) {
      alert('Error updating coupon: ' + error.message);
    } else {
      await fetchCoupons();
      setShowEditDialog(false);
      setSelectedCoupon(null);
      setNewCoupon({
        category: 'Food',
        is_active: true,
        quantity: 1,
        rating: 4.0
      });
    }
  };

  // 7. UPDATED HANDLER: Deletes from 'coupons_store'
  const handleDeleteCoupon = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      const { error } = await supabase.from('coupons_store').delete().eq('id', id);
      if (error) {
        alert('Error deleting coupon: ' + error.message);
      } else {
        await fetchCoupons();
      }
    }
  };

  // 8. UPDATED HANDLER: Toggles 'is_active' boolean
  const handleToggleStatus = async (id: string) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;

    const newStatus = !coupon.is_active; // Toggle boolean
    
    const { error } = await supabase
      .from('coupons_store')
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      await fetchCoupons();
    }
  };

  // 9. CRITICAL UPDATE: This now inserts into 'coupons_store'
  const handleApproveRequest = async (request: PartnerCouponRequest) => {
    // Map request fields directly to 'coupons_store' schema (snake_case)
    const couponToInsert = {
      product_name: request.product_name,
      product_image: request.product_image_url || '/placeholder.svg',
      shop_logo: request.shop_logo_url || '/placeholder.svg',
      shop_name: request.shop_name,
      points_cost: request.points_price,
      original_price: request.original_price,
      discounted_price: request.discounted_price,
      expiry_date: request.expiry_date,
      category: request.category || 'Food',
      description: request.product_description || '',
      quantity: request.quantity || 1,
      is_active: true, // Set to active on approval
      rating: 4.0, // Default rating
      distance: '0 km', // Default distance
    };

    // Insert into the new 'coupons_store' table
    const { error: insertError } = await supabase.from('coupons_store').insert(couponToInsert);

    if (insertError) {
      alert('Error approving coupon: ' + insertError.message);
      return;
    }

    // Update the request status (this is unchanged)
    const { error: updateError } = await supabase
      .from('partner_coupon_requests')
      .update({ status: 'approved' })
      .eq('id', request.id);

    if (updateError) {
      alert('Error updating request status: ' + updateError.message);
    }
    
    alert('Coupon approved and added to store!');
    await fetchCoupons();
    await fetchRequests();
  };

  const handleDeclineRequest = async (id: string) => {
    if (!confirm('Are you sure you want to decline this request?')) return;
    
    const { error } = await supabase
      .from('partner_coupon_requests')
      .update({ status: 'declined' })
      .eq('id', id);

    if (error) {
      alert('Error declining request: ' + error.message);
    } else {
      alert('Request declined.');
      await fetchRequests();
    }
  };

  // 10. UPDATED HELPERS: Use 'is_active' boolean
  const getStatusColor = (isActive: boolean | null) => {
    if (isActive === true) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 ring-1 ring-inset ring-green-200/60 dark:ring-green-900/30';
    if (isActive === false) return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 ring-1 ring-inset ring-gray-200/60 dark:ring-gray-800/50';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 ring-1 ring-inset ring-red-200/60 dark:ring-red-900/30';
  };

  const getStatusIcon = (isActive: boolean | null) => {
    if (isActive === true) return <CheckCircle className="w-4 h-4" />;
    if (isActive === false) return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'Food': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300 ring-1 ring-inset ring-orange-200/60 dark:ring-orange-900/30';
      case 'Entertainment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 ring-1 ring-inset ring-purple-200/60 dark:ring-purple-900/30';
      case 'Lifestyle': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-inset ring-blue-200/60 dark:ring-blue-900/30';
      case 'Health': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 ring-1 ring-inset ring-green-200/60 dark:ring-green-900/30';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300 ring-1 ring-inset ring-gray-200/60 dark:ring-gray-800/50';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-14 w-14">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 animate-ping opacity-20" />
            <div className="animate-spin rounded-full h-14 w-14 border-2 border-emerald-500 border-t-transparent mx-auto"></div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">Loading Coupon Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/60 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 animate-in slide-in-from-top duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Coupon Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage all coupons available in the coupon store</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2 rounded-lg shadow-sm hover:shadow-md transition-all bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4" />
                    Add Coupon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur">
                  <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                    <DialogDescription>
                      Add a new coupon to the coupon store
                    </DialogDescription>
                  </DialogHeader>
                  
                  {/* 11. UPDATED FORM: Uses snake_case field names */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="product-name">Product Name *</Label>
                        <Input
                          id="product-name"
                          placeholder="Enter product name"
                          value={newCoupon.product_name || ''}
                          onChange={(e) => setNewCoupon({ ...newCoupon, product_name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="shop-name">Shop Name *</Label>
                        <Input
                          id="shop-name"
                          placeholder="Enter shop name"
                          value={newCoupon.shop_name || ''}
                          onChange={(e) => setNewCoupon({ ...newCoupon, shop_name: e.target.value })}
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
                        className="resize-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="points-cost">Points Cost *</Label>
                        <div className="relative">
                          <Input
                            id="points-cost"
                            type="number"
                            placeholder="150"
                            value={newCoupon.points_cost || ''}
                            onChange={(e) => setNewCoupon({ ...newCoupon, points_cost: Number(e.target.value) })}
                            className="pl-10"
                          />
                          <Coins className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="original-price">Original Price</Label>
                        <div className="relative">
                          <Input
                            id="original-price"
                            type="number"
                            placeholder="299"
                            value={newCoupon.original_price || ''}
                            onChange={(e) => setNewCoupon({ ...newCoupon, original_price: Number(e.target.value) })}
                            className="pl-8"
                          />
                          <span className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="discounted-price">Discounted Price</Label>
                        <div className="relative">
                          <Input
                            id="discounted-price"
                            type="number"
                            placeholder="199"
                            value={newCoupon.discounted_price || ''}
                            onChange={(e) => setNewCoupon({ ...newCoupon, discounted_price: Number(e.target.value) })}
                            className="pl-8"
                          />
                          <span className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={newCoupon.category || 'Food'} onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })}>
                          <SelectTrigger className="rounded-lg">
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
                          value={newCoupon.expiry_date || ''}
                          onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
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
                  
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCoupon} className="bg-emerald-600 hover:bg-emerald-700">
                      <Gift className="w-4 h-4 mr-2" />
                      Create Coupon
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-950 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center ring-1 ring-inset ring-blue-200/60 dark:ring-blue-900/30">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Coupons</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-950 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-100">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-500 to-teal-500" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center ring-1 ring-inset ring-green-200/60 dark:ring-green-900/30">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.filter(c => c.is_active).length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-950 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-200">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gray-400 to-gray-600" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center ring-1 ring-inset ring-gray-200/60 dark:ring-gray-800/50">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{coupons.filter(c => !c.is_active).length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-gradient-to-br from-white to-slate-50 dark:from-gray-900 dark:to-gray-950 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 delay-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center ring-1 ring-inset ring-purple-200/60 dark:ring-purple-900/30">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(coupons.map(c => c.shop_name)).size}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Partner Shops</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Partner Coupon Requests */}
        {requests.length > 0 && (
          <div className="space-y-4 p-4 sm:p-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Partner Coupon Requests <span className="text-gray-500 dark:text-gray-400">({requests.length})</span>
              </h2>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {requests.map(request => (
                <Card key={request.id} className="animate-in fade-in-50 bg-white/90 dark:bg-gray-900/90 border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden ring-1 ring-inset ring-gray-200/60 dark:ring-gray-700/60">
                        <img 
                          src={request.product_image_url || '/placeholder.svg'} 
                          alt={request.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{request.product_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Store className="w-3 h-3" />
                            {request.shop_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {request.points_price} points
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <span>₹{request.discounted_price} (was ₹{request.original_price})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                        onClick={() => handleDeclineRequest(request.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApproveRequest(request)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <CardContent className="p-4">
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
                <SelectTrigger className="w-full md:w-40">
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
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Coupon Store */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Coupon Store <span className="text-gray-500 dark:text-gray-400">({filteredCoupons.length})</span>
          </h2>
        </div>
        <div className="space-y-3">
          {filteredCoupons.map((coupon, index) => (
            <Card
              key={coupon.id}
              className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100} border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ring-1 ring-inset ring-gray-200/60 dark:ring-gray-700/60">
                      <img 
                        src={coupon.product_image || '/placeholder.svg'} 
                        alt={coupon.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{coupon.product_name}</h3>
                        <Badge className={`${getCategoryColor(coupon.category)} rounded-full px-2 py-0.5`}>
                          {coupon.category}
                        </Badge>
                        <Badge className={`${getStatusColor(coupon.is_active)} rounded-full px-2 py-0.5`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(coupon.is_active)}
                            {coupon.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          {coupon.shop_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {coupon.points_cost} points
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {coupon.quantity} available
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>₹{coupon.discounted_price} (was ₹{coupon.original_price})</span>
                        <span>Expires: {coupon.expiry_date}</span>
                        <span>Updated: {coupon.updated_at}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
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
                      className="rounded-lg"
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
                      className="rounded-lg"
                      onClick={() => handleToggleStatus(coupon.id)}
                    >
                      {coupon.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-lg"
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
          <Card className="text-center py-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-0 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
            <CardContent>
              <Gift className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No coupons found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 15. UPDATED DIALOGS: Show 'coupons_store' data */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur">
          <DialogHeader>
            <DialogTitle>Coupon Details</DialogTitle>
            <DialogDescription>
              View coupon information and redemption statistics
            </DialogDescription>
          </DialogHeader>
          
          {selectedCoupon && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto mb-4 overflow-hidden ring-1 ring-inset ring-gray-200/60 dark:ring-gray-700/60">
                  <img 
                    src={selectedCoupon.product_image || '/placeholder.svg'} 
                    alt={selectedCoupon.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">{selectedCoupon.product_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedCoupon.id}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Shop:</span>
                  <span className="text-sm font-medium">{selectedCoupon.shop_name}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                  <Badge className={`${getCategoryColor(selectedCoupon.category)} rounded-full px-2 py-0.5`}>
                    {selectedCoupon.category}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge className={`${getStatusColor(selectedCoupon.is_active)} rounded-full px-2 py-0.5`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedCoupon.is_active)}
                      {selectedCoupon.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Points Cost:</span>
                  <span className="text-sm font-semibold">{selectedCoupon.points_cost}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="text-sm">₹{selectedCoupon.discounted_price} (was ₹{selectedCoupon.original_price})</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                  <span className="text-sm">{selectedCoupon.quantity} available</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expires:</span>
                  <span className="text-sm">{selectedCoupon.expiry_date}</span>
                </div>
                
                {selectedCoupon.description && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Description:</span>
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white/90 dark:bg-gray-900/90 backdrop-blur">
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
                  value={newCoupon.product_name || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, product_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-shop-name">Shop Name *</Label>
                <Input
                  id="edit-shop-name"
                  placeholder="Enter shop name"
                  value={newCoupon.shop_name || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, shop_name: e.target.value })}
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
                className="resize-none"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-points-cost">Points Cost *</Label>
                <div className="relative">
                  <Input
                    id="edit-points-cost"
                    type="number"
                    placeholder="150"
                    value={newCoupon.points_cost || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, points_cost: Number(e.target.value) })}
                    className="pl-10"
                  />
                  <Coins className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-original-price">Original Price</Label>
                <div className="relative">
                  <Input
                    id="edit-original-price"
                    type="number"
                    placeholder="299"
                    value={newCoupon.original_price || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, original_price: Number(e.target.value) })}
                    className="pl-8"
                  />
                  <span className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-discounted-price">Discounted Price</Label>
                <div className="relative">
                  <Input
                    id="edit-discounted-price"
                    type="number"
                    placeholder="199"
                    value={newCoupon.discounted_price || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discounted_price: Number(e.target.value) })}
                    className="pl-8"
                  />
                  <span className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={newCoupon.category || 'Food'} onValueChange={(value) => setNewCoupon({ ...newCoupon, category: value })}>
                  <SelectTrigger className="rounded-lg">
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
                  value={newCoupon.expiry_date || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={newCoupon.is_active ? 'active' : 'inactive'} onValueChange={(value) => setNewCoupon({ ...newCoupon, is_active: value === 'active' })}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCoupon} className="bg-emerald-600 hover:bg-emerald-700">
              <Edit className="w-4 h-4 mr-2" />
              Update Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}