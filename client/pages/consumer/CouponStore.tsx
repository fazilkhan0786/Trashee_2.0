import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  ArrowLeft, Search, Filter, MapPin, 
  Calendar, Coins, Star, ShoppingBag, 
  Wallet, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { safeNavigateBack } from '@/lib/navigation';
import { getCoupons, redeemCoupon, Coupon } from '@/lib/couponStoreService';
import { supabase } from '@/lib/supabase';

export default function CouponStore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redeemedCoupon, setRedeemedCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load coupons from Supabase
  useEffect(() => {
    async function loadCoupons() {
      try {
        setLoading(true);
        setError(null);
        
        const { success, data, error } = await getCoupons();
        
        if (!success || error) {
          console.error('Error fetching coupons:', error);
          setError('Failed to load coupons. Please try again');
          return;
        }
        
        setCoupons(data || []);
      } catch (err) {
        console.error('Unexpected error loading coupons:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadCoupons();
  }, []);

  const categories = [
    { value: 'all', label: 'All' }, 
    { value: 'Food', label: 'Food' }, 
    { value: 'Entertainment', label: 'Entertainment' }, 
    { value: 'Lifestyle', label: 'Lifestyle' }, 
    { value: 'Health', label: 'Health' }
  ];
  
  const sortOptions = [
    { value: 'points-low', label: 'Points: Low to High' },
    { value: 'points-high', label: 'Points: High to Low' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'expiry', label: 'Expiring Soon' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const filteredAndSortedCoupons = coupons
    .filter(coupon => {
      const matchesSearch = coupon.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           coupon.shop_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || filterCategory === '' || coupon.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'points-low':
          return a.points_cost - b.points_cost;
        case 'points-high':
          return b.points_cost - a.points_cost;
        case 'distance':
          const distA = parseFloat(a.distance || '99999');
          const distB = parseFloat(b.distance || '99999');
          return distA - distB;
        case 'expiry':
          return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  const handleRedeem = async (coupon: Coupon) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to redeem coupons');
        return;
      }

      // Call backend-secured redeem logic
      const { success, error } = await redeemCoupon(coupon.id);
      
      if (!success || error) {
        console.error('Error redeeming coupon:', error);
        alert(typeof error === 'string' ? error : (error as any)?.message || 'Failed to redeem coupon. Please try again.');
        return;
      }

      setRedeemedCoupon(coupon);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Unexpected error redeeming coupon:', err);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleSeeInWallet = () => {
    setShowSuccessModal(false);
    navigate('/consumer/wallet');
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    setRedeemedCoupon(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => safeNavigateBack(navigate, '/consumer/home')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Coupon Store</h1>
            <p className="text-sm text-gray-500">Redeem points for amazing deals</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search coupons or shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-3">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="flex-1">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading coupons...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p>{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}
        
        {/* Coupons Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedCoupons.map((coupon, index) => (
              <Card 
                key={coupon.id} 
                className={`overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                      <img 
                        src={coupon.product_image} 
                        alt={coupon.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm line-clamp-1">{coupon.product_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <img 
                              src={coupon.shop_logo} 
                              alt={coupon.shop_name}
                              className="w-4 h-4 rounded-full"
                            />
                            <span className="text-xs text-gray-600">{coupon.shop_name}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <Coins className="w-3 h-3 mr-1" />
                          {coupon.points_cost}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{coupon.distance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{coupon.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Exp: {coupon.expiry_date}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">₹{coupon.discounted_price}</span>
                          <span className="text-xs text-gray-500 line-through">₹{coupon.original_price}</span>
                        </div>
                        
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => handleRedeem(coupon)}
                        >
                          <ShoppingBag className="w-4 h-4 mr-1" />
                          Redeem
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredAndSortedCoupons.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No coupons found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-green-800">Coupon Redeemed!</DialogTitle>
                <DialogDescription className="mt-2">
                  {redeemedCoupon && (
                    <span>
                      "{redeemedCoupon.product_name}" has been successfully added to your wallet.
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={handleSeeInWallet}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Wallet className="w-4 h-4 mr-2" />
              See in Wallet
            </Button>
            <Button
              variant="outline"
              onClick={handleDone}
              className="w-full"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
