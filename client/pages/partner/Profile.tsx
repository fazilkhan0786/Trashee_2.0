import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft, User, Camera, Shield, HelpCircle,
  LogOut, Edit, Save, Lock, Store, Upload, FileText, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { updateUserProfile, updateShopProfile, uploadFile } from '@/lib/profileService';

export default function PartnerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // State for tracking selected files
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [shopImageFile, setShopImageFile] = useState<File | null>(null);
  const [taxCertFile, setTaxCertFile] = useState<File | null>(null);
  const [bizLicenseFile, setBizLicenseFile] = useState<File | null>(null);

  // State for data from the 'profiles' table
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
    avatar_url: '/placeholder.svg',
  });

  // State for data from the 'partner_shops' table
  const [shopData, setShopData] = useState({
    shop_name: '',
    shop_description: '',
    shop_address: '',
    shop_image_url: '/placeholder.svg',
    tax_certificate_url: '',
    business_license_url: '',
  });

  // State for notification settings
  const [securitySettings, setSecuritySettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_alerts: false,
  });

  // Fetch all user and shop data on component load
  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      // Fetch from both tables in parallel for better performance
      const [profileRes, shopRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('partner_shops').select('*').eq('partner_id', user.id).single()
      ]);

      const { data: profile } = profileRes;
      const { data: shop } = shopRes;

      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          email: user.email || '',
          phone_number: profile.phone_number || '',
          address: profile.address || '',
          avatar_url: profile.avatar_url || '/placeholder.svg',
        });
        setSecuritySettings({
          email_notifications: profile.email_notifications ?? true,
          push_notifications: profile.push_notifications ?? true,
          sms_alerts: profile.sms_alerts ?? false,
        });
      }

      if (shop) {
        setShopData({
          shop_name: shop.shop_name || '',
          shop_description: shop.shop_description || '',
          shop_address: shop.shop_address || '',
          shop_image_url: shop.shop_image_url || '/placeholder.svg',
          tax_certificate_url: shop.tax_certificate_url || '',
          business_license_url: shop.business_license_url || '',
        });
      } else {
        // If no shop profile exists, pre-fill some details from the personal profile
        setShopData(prev => ({
          ...prev,
          shop_name: profile?.full_name ? `${profile.full_name}'s Store` : '',
          shop_address: profile?.address || '',
        }));
      }

      setLoading(false);
    }
    
    loadUserData();
  }, [navigate]);

  // Handle file selection and preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'shopImage' | 'tax' | 'license') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    switch (type) {
      case 'avatar':
        setAvatarFile(file);
        setProfileData(prev => ({ ...prev, avatar_url: previewUrl }));
        break;
      case 'shopImage':
        setShopImageFile(file);
        setShopData(prev => ({ ...prev, shop_image_url: previewUrl }));
        break;
      case 'tax':
        setTaxCertFile(file);
        break;
      case 'license':
        setBizLicenseFile(file);
        break;
    }
  };
  
  // Handle the entire update process
  const handleProfileUpdate = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to update your profile.');
      setLoading(false);
      return;
    }

    try {
      // Create a list of all potential file upload tasks
      const uploadTasks: Promise<{ type: string; url?: string; error?: string }>[] = [];

      if (avatarFile) uploadTasks.push(uploadFile(avatarFile, 'avatars').then(res => ({ type: 'avatar_url', ...res })));
      if (shopImageFile) uploadTasks.push(uploadFile(shopImageFile, 'shop-images').then(res => ({ type: 'shop_image_url', ...res })));
      if (taxCertFile) uploadTasks.push(uploadFile(taxCertFile, 'business_documents').then(res => ({ type: 'tax_certificate_url', ...res })));
      if (bizLicenseFile) uploadTasks.push(uploadFile(bizLicenseFile, 'business_documents').then(res => ({ type: 'business_license_url', ...res })));

      // Execute all file uploads in parallel
      const uploadResults = await Promise.all(uploadTasks);

      // Check for any upload errors before proceeding
      const uploadError = uploadResults.find(res => res.error);
      if (uploadError) {
        throw new Error(`Failed to upload ${uploadError.type.replace('_url', '')}: ${uploadError.error}`);
      }

      // Consolidate URLs from successful uploads
      const newUrls = uploadResults.reduce((acc, res) => {
        if (res.url) acc[res.type] = res.url;
        return acc;
      }, {} as { [key: string]: string });

      // Prepare data for the 'profiles' table update
      const profileUpdates = {
        full_name: profileData.full_name,
        phone_number: profileData.phone_number,
        address: profileData.address,
        avatar_url: newUrls.avatar_url || profileData.avatar_url,
        ...securitySettings
      };

      // Prepare data for the 'partner_shops' table update
      const shopUpdates = {
        shop_name: shopData.shop_name,
        shop_description: shopData.shop_description,
        shop_address: shopData.shop_address,
        shop_image_url: newUrls.shop_image_url || shopData.shop_image_url,
        tax_certificate_url: newUrls.tax_certificate_url || shopData.tax_certificate_url,
        business_license_url: newUrls.business_license_url || shopData.business_license_url,
      };

      // Execute database updates in parallel
      const [profileResult, shopResult] = await Promise.all([
        updateUserProfile(user.id, profileUpdates),
        updateShopProfile(user.id, shopUpdates)
      ]);

      if (!profileResult.success || !shopResult.success) {
        throw new Error(profileResult.error || shopResult.error || 'Failed to update database.');
      }

      alert('Profile updated successfully!');
      setIsEditing(false);
      // Reset file states after successful upload
      setAvatarFile(null);
      setShopImageFile(null);
      setTaxCertFile(null);
      setBizLicenseFile(null);

    } catch (error: any) {
      alert(`Update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password reset requests
  const handlePasswordReset = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/update-password` });
        if (error) alert(`Error: ${error.message}`);
        else alert('A password reset link has been sent to your email.');
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-indigo-50 to-blue-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-indigo-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-indigo-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-indigo-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-indigo-800">Partner Profile & Settings</h1>
            <p className="text-sm text-indigo-600/80">Manage your account and shop details</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-indigo-50 rounded-xl p-1">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg border-0">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white/30"><AvatarImage src={profileData.avatar_url} /><AvatarFallback>{profileData.full_name?.charAt(0)}</AvatarFallback></Avatar>
                  {isEditing && <label htmlFor="avatar-upload" className="cursor-pointer absolute -bottom-2 -right-2 block"><div className="w-10 h-10 bg-white text-indigo-700 rounded-full flex items-center justify-center shadow-md"><Camera className="w-4 h-4" /><input id="avatar-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e, 'avatar')} /></div></label>}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profileData.full_name}</h2>
                  <p className="text-indigo-100">{profileData.email}</p>
                  <Badge className="bg-yellow-300 text-yellow-900 border-0 mt-2 font-medium"><Award className="w-4 h-4 mr-1" /> Partner</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal & Shop Information</CardTitle>
                <Button onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}>
                  {isEditing ? <><Save className="w-4 h-4 mr-2" />Save All</> : <><Edit className="w-4 h-4 mr-2" />Edit</>}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <h3 className="font-semibold text-indigo-700 border-b pb-2">Personal Details</h3>
                <div className="space-y-2"><Label>Full Name</Label><Input value={profileData.full_name} onChange={e => setProfileData(p => ({...p, full_name: e.target.value}))} disabled={!isEditing} /></div>
                <div className="space-y-2"><Label>Phone Number</Label><Input value={profileData.phone_number} onChange={e => setProfileData(p => ({...p, phone_number: e.target.value}))} disabled={!isEditing} /></div>
                
                <h3 className="font-semibold text-indigo-700 border-b pb-2 pt-4">Shop Details</h3>
                <div className="space-y-2"><Label>Shop Name</Label><Input value={shopData.shop_name} onChange={e => setShopData(p => ({...p, shop_name: e.target.value}))} disabled={!isEditing} /></div>
                <div className="space-y-2"><Label>Shop Address</Label><Input value={shopData.shop_address} onChange={e => setShopData(p => ({...p, shop_address: e.target.value}))} disabled={!isEditing} /></div>
                <div className="space-y-2"><Label>Shop Description</Label><Textarea value={shopData.shop_description} onChange={e => setShopData(p => ({...p, shop_description: e.target.value}))} disabled={!isEditing} /></div>
                
                <div className="space-y-2 pt-4">
                  <Label>Business Documents <span className="text-red-500 text-xs">*Required for verification</span></Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Label htmlFor="tax-cert" className={!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}><FileText className="mx-auto mb-2 text-gray-400"/><p className="text-sm text-gray-600">Tax Certificate</p><input id="tax-cert" type="file" className="hidden" onChange={e => handleFileChange(e, 'tax')} disabled={!isEditing}/></Label>
                      {taxCertFile ? <p className="text-xs text-green-600 mt-2">✓ {taxCertFile.name}</p> : shopData.tax_certificate_url && <a href={shopData.tax_certificate_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 mt-2 block underline">View Uploaded File</a>}
                    </div>
                     <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <Label htmlFor="biz-license" className={!isEditing ? 'cursor-not-allowed' : 'cursor-pointer'}><FileText className="mx-auto mb-2 text-gray-400"/><p className="text-sm text-gray-600">Business License</p><input id="biz-license" type="file" className="hidden" onChange={e => handleFileChange(e, 'license')} disabled={!isEditing}/></Label>
                      {bizLicenseFile ? <p className="text-xs text-green-600 mt-2">✓ {bizLicenseFile.name}</p> : shopData.business_license_url && <a href={shopData.business_license_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 mt-2 block underline">View Uploaded File</a>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2"><Lock/>Password</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between p-4 border rounded-lg"><div><h3>Reset Password</h3><p className="text-sm text-gray-500">Send a reset link to your email.</p></div><Button variant="outline" onClick={handlePasswordReset}>Send Link</Button></div></CardContent></Card>
            <Card><CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader><CardContent className="space-y-2">{Object.entries(securitySettings).map(([key, value]) => (<div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"><Label className="capitalize">{key.replace(/_/g, ' ')}</Label><Switch checked={value} onCheckedChange={c => isEditing && setSecuritySettings(p => ({...p, [key]: c}))} disabled={!isEditing}/></div>))} {!isEditing && <p className="text-sm text-gray-500 mt-4">Click the "Edit" button in the Profile tab to change these settings.</p>}</CardContent></Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <Card><CardHeader><CardTitle>App Information</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span>Version:</span><span>1.0.8</span></div><div className="flex justify-between"><span>Last Updated:</span><span>Oct 17, 2025</span></div><hr/><Button asChild variant="outline" className="w-full"><a href="https://dprofiz.com/" target="_blank" rel="noopener noreferrer">Partner Help Center</a></Button></CardContent></Card>
            <Card><CardContent className="p-4"><Button variant="destructive" onClick={handleLogout} className="w-full"><LogOut className="mr-2"/>Logout</Button></CardContent></Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

