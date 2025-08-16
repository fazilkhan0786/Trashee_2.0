import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Search, Filter, MapPin, Calendar, Coins, Star, ShoppingBag, Users, Truck, Gift, CheckCircle } from 'lucide-react';
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
  distance: string;
  rating: number;
  description: string;
  quantity: number;
  type: 'bulk' | 'single';
  shopAddress: string;
  shopPhone: string;
  collectorDiscount?: number;
}

export default function CollectorCouponStore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('points-low');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const coupons: Coupon[] = [
    
  ];

  const categories = [{ value: 'all', label: 'All' }, { value: 'Safety Equipment', label: 'Safety Equipment' }, { value: 'Fuel & Transport', label: 'Fuel & Transport' }, { value: 'Vehicle Services', label: 'Vehicle Services' }, { value: 'Insurance & Benefits', label: 'Insurance & Benefits' }, { value: 'Food & Refreshments', label: 'Food & Refreshments' }];
  const sortOptions = [
    { value: 'points-low', label: 'Points: Low to High' },
    { value: 'points-high', label: 'Points: High to Low' },
    { value: 'distance', label: 'Nearest First' },
    { value: 'expiry', label: 'Expiring Soon' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const filteredAndSortedCoupons = React.useMemo(() => {
    let filtered = coupons.filter(coupon => {
      const matchesSearch = coupon.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           coupon.shopName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || filterCategory === '' || coupon.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Apply sorting
    switch (sortBy) {
      case 'points-low':
        filtered = filtered.sort((a, b) => a.pointsCost - b.pointsCost);
        break;
      case 'points-high':
        filtered = filtered.sort((a, b) => b.pointsCost - a.pointsCost);
        break;
      case 'distance':
        filtered = filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case 'expiry':
        filtered = filtered.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return filtered;
  }, [coupons, searchQuery, filterCategory, sortBy]);

  const handleRedeem = (coupon: Coupon) => {
    console.log('Redeeming coupon:', coupon.id);
    // Direct redemption without confirmation popup
    alert(`✅ Coupon redeemed successfully!\n\n${coupon.productName} at ${coupon.shopName}\nPoints deducted: ${coupon.pointsCost}`);
    setSelectedCoupon(null);
  };

  const userStats = {
    totalPoints: 0,
    redeemedCoupons: 0,
    savedAmount: 0,
    memberSince: 'June 2023'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6" />
              Collector Coupon Store
            </h1>
            <p className="text-sm opacity-90">Exclusive deals for waste collectors</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Points Balance Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Your Points Balance</h2>
                <div className="text-3xl font-bold mt-1">{userStats.totalPoints.toLocaleString()}</div>
                <p className="text-sm opacity-90">Available for redemption</p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8" />
                </div>
                <p className="text-xs mt-2">Member since {userStats.memberSince}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userStats.redeemedCoupons}</div>
              <div className="text-xs text-gray-500">Coupons Redeemed</div>
            </CardContent>
          </Card>
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">₹{userStats.savedAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Total Saved</div>
            </CardContent>
          </Card>
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{coupons.length}</div>
              <div className="text-xs text-gray-500">Available Offers</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search collector-specific deals..."
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

        {/* Collector Benefits Card */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800">Collector Exclusive Benefits</h3>
                <p className="text-sm text-orange-600">Extra discounts on work equipment, fuel, and insurance</p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                Up to 30% OFF
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredAndSortedCoupons.map((coupon, index) => (
            <Card key={coupon.id} className={`overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-0">
                <div className="flex">
                  <div className="w-28 h-28 bg-gray-200 flex-shrink-0 relative">
                    <img 
                      src={coupon.productImage} 
                      alt={coupon.productName}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      variant={coupon.type === 'bulk' ? 'default' : 'secondary'} 
                      className="absolute top-2 left-2 text-xs"
                    >
                      {coupon.type}
                    </Badge>
                    {coupon.collectorDiscount && (
                      <Badge 
                        className="absolute bottom-2 left-2 text-xs bg-orange-500 text-white"
                      >
                        <Truck className="w-3 h-3 mr-1" />
                        +{coupon.collectorDiscount}% OFF
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 p-4">
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
                          <Badge variant="outline" className="text-xs">
                            Collector Special
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs ml-2">
                        <Coins className="w-3 h-3 mr-1" />
                        {coupon.pointsCost}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{coupon.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{coupon.distance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{coupon.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{coupon.quantity} left</span>
                        </div>
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
                        <Badge variant="destructive" className="text-xs">
                          {Math.round(((coupon.originalPrice - coupon.discountedPrice) / coupon.originalPrice) * 100)}% OFF
                        </Badge>
                      </div>
                      
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => handleRedeem(coupon)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Redeem Now
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
            <p className="text-gray-500">No collector coupons found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
