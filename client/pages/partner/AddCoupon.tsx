import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Upload, ImageIcon, Store, Tag, Coins, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function PartnerAddCoupon() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    shopName: '',
    productDescription: '',
    offerType: '',
    quantity: '',
    originalPrice: '',
    discountedPrice: '',
    pointsPrice: '',
    expiryDate: '',
    category: '',
    pincode: '',
    productImage: null as File | null,
    shopLogo: null as File | null
  });
  
  const [imagePreviews, setImagePreviews] = useState({
    productImage: '',
    shopLogo: ''
  });

  const categories = ['Food', 'Electronics', 'Fashion', 'Health', 'Beauty', 'Home', 'Sports', 'Books', 'Other'];
  const offerTypes = [
    { value: 'single', label: 'Single Use', description: 'Purchase Only One' },
    { value: 'bulk', label: 'Bulk Offer', description: 'Multiple coupons in more less price' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: 'productImage' | 'shopLogo', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    
    // Create or revoke the preview URL
    if (file) {
      const newPreviewUrl = URL.createObjectURL(file);
      // Revoke old URL if it exists, to prevent memory leaks
      if (imagePreviews[field]) {
        URL.revokeObjectURL(imagePreviews[field]);
      }
      setImagePreviews(prev => ({ ...prev, [field]: newPreviewUrl }));
    } else {
      if (imagePreviews[field]) {
        URL.revokeObjectURL(imagePreviews[field]);
      }
      setImagePreviews(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null); 

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a coupon.");

      let productImageUrl = '';
      let shopLogoUrl = '';

      if (formData.productImage) {
        const file = formData.productImage;
        const filePath = `${user.id}/${file.name}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('product_images') 
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('product_images')
          .getPublicUrl(filePath);
        productImageUrl = urlData.publicUrl;
      }

      if (formData.shopLogo) {
        const file = formData.shopLogo;
        const filePath = `${user.id}/${file.name}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('shop_logos') 
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('shop_logos')
          .getPublicUrl(filePath);
        shopLogoUrl = urlData.publicUrl;
      }

      const couponRequestData = {
        partner_id: user.id,
        product_name: formData.productName,
        shop_name: formData.shopName,
        product_description: formData.productDescription || null,
        offer_type: formData.offerType,
        quantity: formData.quantity ? parseInt(formData.quantity) : null,
        original_price: parseFloat(formData.originalPrice),
        discounted_price: parseFloat(formData.discountedPrice),
        points_price: parseInt(formData.pointsPrice),
        expiry_date: formData.expiryDate,
        category: formData.category || null,
        pincode: formData.pincode || null,
        product_image_url: productImageUrl || null,
        shop_logo_url: shopLogoUrl || null,
      };

      const { error: insertError } = await supabase
        .from('partner_coupon_requests')
        .insert([couponRequestData]);
        
      if (insertError) throw insertError;

      alert('Coupon submitted for review successfully!');
      setFormData({
        productName: '', shopName: '', productDescription: '', offerType: '',
        quantity: '', originalPrice: '', discountedPrice: '', pointsPrice: '',
        expiryDate: '', category: '', pincode: '', productImage: null, shopLogo: null
      });
      if (imagePreviews.productImage) URL.revokeObjectURL(imagePreviews.productImage);
      if (imagePreviews.shopLogo) URL.revokeObjectURL(imagePreviews.shopLogo);
      setImagePreviews({ productImage: '', shopLogo: '' });
      
      navigate('/partner/home');
    } catch (error: any) {
      console.error('Error submitting coupon:', error);
      setFormError(error.message || 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.productName && formData.shopName && formData.offerType && 
                     formData.originalPrice && formData.discountedPrice && formData.expiryDate &&
                     formData.pointsPrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pb-20 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-32 -left-20 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-4 shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2 text-white hover:bg-white/20 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Add New Coupon</h1>
            <p className="text-indigo-100 text-sm">Create attractive offers for customers</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-3xl mx-auto relative z-10">
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Coupon Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800">Product Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2"><Label htmlFor="productName">Product Name *</Label><Input id="productName" value={formData.productName} onChange={(e) => handleInputChange('productName', e.target.value)} placeholder="Enter product name" required /></div>
                  <div className="space-y-2"><Label htmlFor="shopName">Shop Name *</Label><Input id="shopName" value={formData.shopName} onChange={(e) => handleInputChange('shopName', e.target.value)} placeholder="Enter your shop name" required /></div>
                  <div className="space-y-2"><Label htmlFor="category">Category</Label><Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map(category => (<SelectItem key={category} value={category}>{category}</SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="productDescription">Product Description</Label><Textarea id="productDescription" value={formData.productDescription} onChange={(e) => handleInputChange('productDescription', e.target.value)} placeholder="Describe your product or offer" rows={3}/></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800">Offer Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2"><Label htmlFor="offerType">Offer Type *</Label><Select value={formData.offerType} onValueChange={(value) => handleInputChange('offerType', value)} required><SelectTrigger><SelectValue placeholder="Select offer type" /></SelectTrigger><SelectContent>{offerTypes.map(type => (<SelectItem key={type.value} value={type.value}><div className="flex flex-col"><span className="font-medium">{type.label}</span><span className="text-xs text-gray-500">{type.description}</span></div></SelectItem>))}</SelectContent></Select></div>
                  <div className="space-y-2"><Label htmlFor="quantity">Coupon Quantity</Label><Input id="quantity" type="number" value={formData.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} placeholder="Number of coupons available" min="1"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="originalPrice">Original Price (₹) *</Label><Input id="originalPrice" type="number" value={formData.originalPrice} onChange={(e) => handleInputChange('originalPrice', e.target.value)} placeholder="0" min="0" step="0.01" required/></div>
                    
                    {/* HERE IS THE FIX:
                      Changed 'e.g-target.value' to 'e.target.value'
                    */}
                    <div className="space-y-2"><Label htmlFor="discountedPrice">Discounted Price (₹) *</Label><Input id="discountedPrice" type="number" value={formData.discountedPrice} onChange={(e) => handleInputChange('discountedPrice', e.target.value)} placeholder="0" min="0" step="0.01" required/></div>
                  </div>
                  
                  {/* This dynamic display is great! */}
                  {formData.originalPrice && formData.discountedPrice && parseFloat(formData.originalPrice) > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <Tag className="w-4 h-4" />
                        <span className="font-medium">{Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.discountedPrice)) / parseFloat(formData.originalPrice)) * 100)}% OFF</span>
                        <span className="text-green-600">(Save ₹{(parseFloat(formData.originalPrice) - parseFloat(formData.discountedPrice)).toFixed(2)})</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2"><Label htmlFor="pointsPrice">Set Coupons Points Price *</Label><div className="relative"><Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" /><Input id="pointsPrice" type="number" value={formData.pointsPrice} onChange={(e) => handleInputChange('pointsPrice', e.target.value)} placeholder="e.g., 500" min="0" required className="pl-10"/></div></div>
                  <div className="space-y-2"><Label htmlFor="expiryDate">Expiry Date *</Label><Input id="expiryDate" type="date" value={formData.expiryDate} onChange={(e) => handleInputChange('expiryDate', e.target.value)} min={new Date().toISOString().split('T')[0]} required/></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-800">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white/70">
                      {imagePreviews.productImage ? (
                        <img src={imagePreviews.productImage} alt="Product Preview" className="w-24 h-24 object-cover mx-auto rounded-lg mb-2"/>
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      )}
                      <p className="text-sm text-gray-600 mb-2">Upload product image</p>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange('productImage', e.target.files?.[0] || null)} className="hidden" id="productImage"/>
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('productImage')?.click()} className="hover:border-purple-300">
                        <Upload className="w-4 h-4 mr-2" />Choose File
                      </Button>
                      {formData.productImage && !imagePreviews.productImage && (
                        <p className="text-xs text-green-600 mt-2">✓ {formData.productImage.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Shop Logo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white/70">
                      {imagePreviews.shopLogo ? (
                        <img src={imagePreviews.shopLogo} alt="Shop Logo Preview" className="w-24 h-24 object-cover mx-auto rounded-lg mb-2"/>
                      ) : (
                        <Store className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      )}
                      <p className="text-sm text-gray-600 mb-2">Upload shop logo</p>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange('shopLogo', e.target.files?.[0] || null)} className="hidden" id="shopLogo"/>
                      <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('shopLogo')?.click()} className="hover:border-purple-300">
                        <Upload className="w-4 h-4 mr-2" />Choose File
                      </Button>
                      {formData.shopLogo && !imagePreviews.shopLogo && (
                        <p className="text-xs text-green-600 mt-2">✓ {formData.shopLogo.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">  
                {formError && (
                  <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-md mb-4">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{formError}</p>
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
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
                <p className="text-xs text-gray-500 text-center mt-2">Your coupon will be reviewed by admin before being made available to customers</p>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100 shadow">
          <CardHeader>
            <CardTitle className="text-blue-800">Coupon Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure product images are clear and high-quality</li>
              <li>Provide accurate pricing and discount information</li>
              <li>Set a fair points price for the value of the coupon</li>
              <li>Set reasonable expiry dates (minimum 7 days from now)</li>
              <li>Admin review typically takes 24-48 hours</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}