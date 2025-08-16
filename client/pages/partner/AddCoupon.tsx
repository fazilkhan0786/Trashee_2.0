import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Upload, ImageIcon, Store, Tag, Calendar, Coins, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PartnerAddCoupon() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    shopName: '',
    productDescription: '',
    offerType: '',
    quantity: '',
    originalPrice: '',
    discountedPrice: '',
    expiryDate: '',
    category: '',
    pincode: '',
    productImage: null as File | null,
    shopLogo: null as File | null
  });

  const categories = ['Food', 'Electronics', 'Fashion', 'Health', 'Beauty', 'Home', 'Sports', 'Books', 'Other'];
  const offerTypes = [
    { value: 'single', label: 'Single Use', description: 'purchase Only One' },
    { value: 'bulk', label: 'Bulk Offer', description: 'Multiple coupons in more less price' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Submitting coupon:', formData);
    setIsSubmitting(false);
    
    // Reset form
    setFormData({
      productName: '',
      shopName: '',
      productDescription: '',
      offerType: '',
      quantity: '',
      originalPrice: '',
      discountedPrice: '',
      expiryDate: '',
      category: '',
      pincode: '',
      productImage: null,
      shopLogo: null
    });
  };

  const isFormValid = formData.productName && formData.shopName && formData.offerType && 
                     formData.originalPrice && formData.discountedPrice && formData.expiryDate;

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
            <h1 className="text-xl font-bold">Add New Coupon</h1>
            <p className="text-sm text-gray-500">Create attractive offers for customers</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Form Card */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Coupon Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Information</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Shop Name *</Label>
                    <Input
                      id="shopName"
                      value={formData.shopName}
                      onChange={(e) => handleInputChange('shopName', e.target.value)}
                      placeholder="Enter your shop name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="productDescription">Product Description</Label>
                    <Textarea
                      id="productDescription"
                      value={formData.productDescription}
                      onChange={(e) => handleInputChange('productDescription', e.target.value)}
                      placeholder="Describe your product or offer"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Offer Details</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="offerType">Offer Type *</Label>
                    <Select value={formData.offerType} onValueChange={(value) => handleInputChange('offerType', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select offer type" />
                      </SelectTrigger>
                      <SelectContent>
                        {offerTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{type.label}</span>
                              <span className="text-xs text-gray-500">{type.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Coupon Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="Number of coupons available"
                      min="1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Original Price (₹) *</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discountedPrice">Discounted Price (₹) *</Label>
                      <Input
                        id="discountedPrice"
                        type="number"
                        value={formData.discountedPrice}
                        onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  {formData.originalPrice && formData.discountedPrice && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <Tag className="w-4 h-4" />
                        <span className="font-medium">
                          {Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.discountedPrice)) / parseFloat(formData.originalPrice)) * 100)}% OFF
                        </span>
                        <span className="text-green-600">
                          (Save ₹{(parseFloat(formData.originalPrice) - parseFloat(formData.discountedPrice)).toFixed(2)})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Image Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Images</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload product image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('productImage', e.target.files?.[0] || null)}
                        className="hidden"
                        id="productImage"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('productImage')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      {formData.productImage && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ {formData.productImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Shop Logo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Store className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload shop logo</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('shopLogo', e.target.files?.[0] || null)}
                        className="hidden"
                        id="shopLogo"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('shopLogo')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      {formData.shopLogo && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ {formData.shopLogo.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={!isFormValid || isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Submitting for Review...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit Coupon for Admin Review
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  Your coupon will be reviewed by admin before being made available to customers
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines Card */}
        <Card className="bg-blue-50 border-blue-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader>
            <CardTitle className="text-blue-800">Coupon Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure product images are clear and high-quality</li>
              <li>Provide accurate pricing and discount information</li>
              <li>Set reasonable expiry dates (minimum 7 days from now)</li>
              <li>Write clear and honest product descriptions</li>
              <li>Admin review typically takes 24-48 hours</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
