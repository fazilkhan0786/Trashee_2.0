import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Search, Filter, MapPin, Calendar, Coins, Star, ShoppingBag, Wallet, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { safeNavigateBack } from '@/lib/navigation';

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
  distance: string;
  rating: number;
  description: string;
}

export default function CouponStore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redeemedCoupon, setRedeemedCoupon] = useState<Coupon | null>(null);

  const coupons: Coupon[] = [
   
  ];

  const categories = [{ value: 'all', label: 'All' }, { value: 'Food', label: 'Food' }, { value: 'Entertainment', label: 'Entertainment' }, { value: 'Lifestyle', label: 'Lifestyle' }, { value: 'Health', label: 'Health' }];
  const sortOptions = [
    { value: 'points-low', label: 'Points: Low to High' },
    { value: 'points-high', label: 'Points: High to Low' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'expiry', label: 'Expiring Soon' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const filteredAndSortedCoupons = coupons
    .filter(coupon => {
      const matchesSearch = coupon.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           coupon.shopName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || filterCategory === '' || coupon.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'points-low':
          return a.pointsCost - b.pointsCost;
        case 'points-high':
          return b.pointsCost - a.pointsCost;
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        case 'expiry':
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

  const handleRedeem = (coupon: Coupon) => {
    console.log('Redeeming coupon:', coupon.id);
    // Handle redemption logic here
    setRedeemedCoupon(coupon);
    setShowSuccessModal(true);
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

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSortedCoupons.map((coupon, index) => (
            <Card key={coupon.id} className={`overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${index * 100}`}>
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                    <img 
                      src={coupon.productImage} 
                      alt={coupon.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm line-clamp-1">{coupon.productName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <img 
                            src={coupon.shopLogo} 
                            alt={coupon.shopName}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-xs text-gray-600">{coupon.shopName}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        <Coins className="w-3 h-3 mr-1" />
                        {coupon.pointsCost}
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
                        <span>Exp: {coupon.expiryDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-green-600">₹{coupon.discountedPrice}</span>
                        <span className="text-xs text-gray-500 line-through">₹{coupon.originalPrice}</span>
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
        </div>

        {filteredAndSortedCoupons.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No coupons found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
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
                      "{redeemedCoupon.productName}" has been successfully added to your wallet.
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
