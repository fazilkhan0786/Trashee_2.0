import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PremiumPopup from '@/components/PremiumPopup';
import AdminAdsDisplay from '@/components/AdminAdsDisplay';
import {
  Coins,
  QrCode,
  MapPin,
  Gift,
  Play,
  Users,
  Wallet,
  Bell,
  User,
  Plus,
  Megaphone,
  Send,
  Upload,
  Crown,
  Sparkles,
  TrendingUp,
  Tag,
  Calendar,
  ShoppingBag,
  Store,
  MoreVertical,
  Ticket,
  Loader2
} from 'lucide-react';

// A simple, self-contained wheel component
const SpinToWinWheel = ({ onSpin, disabled, result, isSpinning }: { onSpin: () => void; disabled: boolean; result: string | null; isSpinning: boolean; }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-64 h-64 flex items-center justify-center">
            <div className={`absolute w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full transition-transform duration-1000 ${isSpinning ? 'animate-spin' : ''}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-white"></div>
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute w-full h-full" style={{ transform: `rotate(${i * 45}deg)` }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-1/2 bg-white/20"></div>
                        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-xs transform rotate-90">{i % 2 === 0 ? 'Win!' : 'Try'}</span>
                    </div>
                ))}
            </div>
             <div className="absolute w-48 h-48 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-center p-4">
                {result ? (
                    <div className="text-white">
                        <p className="font-bold text-lg">{result.includes('Points') ? 'You Won!' : 'Better Luck Next Time!'}</p>
                        <p className="text-sm">{result}</p>
                    </div>
                ) : (
                   isSpinning ? <p className="text-white font-bold text-xl">Spinning...</p> : <Ticket className="w-16 h-16 text-white/50" />
                )}
            </div>
        </div>
        <Button 
          onClick={onSpin} 
          className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg transition-all transform hover:scale-105" 
          disabled={disabled || isSpinning}
        >
          {isSpinning ? 'Spinning...' : (disabled ? 'Come Back Tomorrow' : 'Spin to Win')}
        </Button>
    </div>
  );
};

export default function PartnerHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmittingAd, setIsSubmittingAd] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    level: 'Partner',
    points: 0,
    profilePicture: '/placeholder.svg'
  });
  const [myCoupons, setMyCoupons] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [spinAllowed, setSpinAllowed] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const segments = [
    { option: '5 Points', points: 5 }, { option: 'Try Again', points: 0 },
    { option: '10 Points', points: 10 }, { option: 'Try Again', points: 0 },
    { option: '20 Points', points: 20 }, { option: 'Try Again', points: 0 },
    { option: '50 Points', points: 50 }, { option: 'Try Again', points: 0 },
  ];

  const handleSpin = async () => {
    // ... (function is unchanged) ...
    if (!spinAllowed || isSpinning || !userId) return;
    setIsSpinning(true);
    setResult(null);

    setTimeout(async () => {
      const prizeIndex = Math.floor(Math.random() * segments.length);
      const prize = segments[prizeIndex];
      
      setResult(prize.option);
      setIsSpinning(false);
      setSpinAllowed(false);
      
      await supabase.from('user_points').upsert({ user_id: userId, last_spin_at: new Date().toISOString() }, { onConflict: 'user_id' });

      if (prize.points > 0) {
        const { error } = await supabase.rpc('increment_user_points', { user_id_input: userId, points_to_add: prize.points });
        if (!error) {
            setUserData(prev => ({ ...prev, points: prev.points + prize.points }));
        } else {
          console.error("Failed to add points:", error);
        }
      }
    }, 3000);
  };

  const quickActions = [
    { icon: QrCode, label: 'QR Scanner', href: '/partner/scanner', color: 'from-purple-500 to-indigo-500' },
    { icon: MapPin, label: 'Map & Shop', href: '/partner/map', color: 'from-blue-500 to-cyan-500' },
    { icon: Gift, label: 'Coupon Store', href: '/partner/coupons', color: 'from-pink-500 to-purple-500' },
    { icon: Crown, label: 'Purchase Premium', href: '/partner/purchase-premium', color: 'from-yellow-500 to-orange-500' },
    { icon: Plus, label: 'Add Coupon', href: '/partner/add-coupon', color: 'from-orange-500 to-red-500' },
    { icon: Play, label: 'Watch Ads', href: '/partner/ads', color: 'from-red-500 to-pink-500' },
    { icon: Users, label: 'Refer Friends', href: '/partner/refer', color: 'from-teal-500 to-green-500' },
    { icon: Wallet, label: 'My Wallet', href: '/partner/wallet', color: 'from-indigo-500 to-purple-500' },
    { icon: Bell, label: 'Notifications', href: '/partner/notifications', color: 'from-amber-500 to-yellow-500' },
    { icon: User, label: 'Profile', href: '/partner/profile', color: 'from-gray-600 to-gray-800' }
  ];

  const [showSponsorDialog, setShowSponsorDialog] = useState(false);
  const [sponsorFormData, setSponsorFormData] = useState({
    adTitle: '', adDescription: '', selectedRate: '', duration: '',
    targetAudience: '', businessCategory: '',
    adMedia: null as File | null, additionalNotes: ''
  });

  const adPricingOptions = [
    { value: '1', label: '30 sec, 5 plays/day - ₹50/day', rate: 50 },
    { value: '2', label: '60 sec, 5 plays/day - ₹90/day', rate: 90 },
    { value: '3', label: '30 sec, 10 plays/day - ₹90/day', rate: 90 },
    { value: '4', label: '60 sec, 10 plays/day - ₹170/day', rate: 170 },
    { value: '5', label: '30 sec, 15 plays/day - ₹125/day', rate: 125 },
    { value: '6', label: '60 sec, 15 plays/day - ₹250/day', rate: 250 },
    { value: '7', label: '30 sec, 25 plays/day - ₹200/day', rate: 200 },
    { value: '8', label: '60 sec, 25 plays/day - ₹350/day', rate: 350 },
    { value: '9', label: '30 sec, 30 plays/day - ₹240/day', rate: 240 },
    { value: '10', label: '60 sec, 30 plays/day - ₹480/day', rate: 480 },
  ];

  const handleSponsorFormChange = (field: string, value: string | File | null) => {
    setSponsorFormData(prev => ({...prev, [field]: value}));
  };

  // --- THIS IS THE MODIFIED FUNCTION ---
  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorFormData.adMedia) {
        alert("Please upload an ad media file.");
        return;
    }
    
    const selectedPackage = adPricingOptions.find(p => p.value === sponsorFormData.selectedRate);
    if (!selectedPackage) {
        alert("Please select a valid ad plan.");
        return;
    }

    setIsSubmittingAd(true);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const durationInDays = parseInt(sponsorFormData.duration);
        const totalBudget = selectedPackage.rate * durationInDays;

        const file = sponsorFormData.adMedia;
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        // Use the folder name 'sponsored-ads' as in your original code
        const filePath = `sponsored-ads/${user.id}/${Date.now()}-${sanitizedFileName}`; 
        
        // --- FIXED: Use 'sponsored_ads' bucket (lowercase) ---
        const { error: uploadError } = await supabase.storage
          .from('sponsored_ads') 
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;

        // --- FIXED: Use 'sponsored_ads' bucket (lowercase) ---
        const { data: urlData } = supabase.storage
          .from('sponsored_ads')
          .getPublicUrl(filePath);
        
        const finalNotes = `Selected Plan: ${selectedPackage.label}\nDuration: ${durationInDays} days\nCalculated Budget: ₹${totalBudget}\n\n--- Partner Notes ---\n${sponsorFormData.additionalNotes}`;

        // --- FIXED: Changed from .rpc() to .from().insert() ---
        // This now matches your table schema exactly
        const { error: insertError } = await supabase
          .from('sponsored_ad_requests') // Your table name
          .insert({
            id: user.id, // This is the user's ID, matching your schema
            ad_title: sponsorFormData.adTitle,
            ad_description: sponsorFormData.adDescription,
            budget: totalBudget,
            duration_days: durationInDays,
            target_audience: sponsorFormData.targetAudience,
            business_category: sponsorFormData.businessCategory,
            ad_media_url: urlData.publicUrl,
            additional_notes: finalNotes,
            status: 'pending' // Default status
          });

        if (insertError) throw insertError;
        // --- END OF FIX ---

        alert('Sponsorship request submitted successfully!');
        setSponsorFormData({
            adTitle: '', adDescription: '', selectedRate: '', duration: '',
            targetAudience: '', businessCategory: '', adMedia: null, additionalNotes: ''
        });
        setShowSponsorDialog(false);

    } catch (error: any) {
        console.error("Error submitting ad request:", error);
        alert(`Error: ${error.message}`);
    } finally {
        setIsSubmittingAd(false);
    }
  };
  
  const fetchMyCoupons = async (currentUserId: string) => {
    // This function remains for future use, you will connect this later
  };

  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }

        setUserId(user.id);

        const [profileRes, pointsRes] = await Promise.all([
            supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
            supabase.from('user_points').select('points, last_spin_at').eq('user_id', user.id).single()
        ]);
        
        const { data: profile } = profileRes;
        const { data: pointsRow } = pointsRes;
        
        setUserData(prev => ({
          ...prev,
          name: profile?.full_name || user.email?.split('@')[0] || 'Partner',
          email: user.email || '',
          profilePicture: profile?.avatar_url || '/placeholder.svg',
          points: pointsRow?.points || 0
        }));

        if (pointsRow?.last_spin_at) {
            const last = new Date(pointsRow.last_spin_at);
            const now = new Date();
            const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
            setSpinAllowed(diffHours >= 24);
        } else {
            setSpinAllowed(true);
        }
      } catch (error) {
        console.error('Error in loadUserData:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [navigate]);
  
  const isSponsorFormValid = sponsorFormData.adTitle && 
                            sponsorFormData.selectedRate && 
                            sponsorFormData.duration && 
                            sponsorFormData.adMedia;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 pb-20">
      <PremiumPopup userType="partner" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl">
         <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/partner/profile"><Avatar className="w-14 h-14"><AvatarImage src={userData.profilePicture} /><AvatarFallback>{userData.name.charAt(0)}</AvatarFallback></Avatar></Link>
              <div>
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <Badge className="mt-1"><Sparkles className="w-3 h-3 mr-1" />{userData.level}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 p-3 rounded-xl">
                <div className="flex items-center gap-2"><Coins className="w-6 h-6 text-yellow-300" /><span className="text-3xl font-bold">{userData.points.toLocaleString()}</span></div>
                <p className="text-purple-100 text-sm">Reward Points</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AdminAdsDisplay userType="partners" placement="home_top" />

      <div className="relative p-4 space-y-6">
        <Card className="border-0 shadow-xl">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp/>Wheel of Luck</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center">
             <SpinToWinWheel onSpin={handleSpin} disabled={!spinAllowed} result={result} isSpinning={isSpinning} />
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4"><div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"><Megaphone className="w-7 h-7 text-white" /></div>
                <div>
                  <h3 className="text-xl font-bold">Sponsor Your Ad</h3>
                  <p className="text-sm text-gray-600">Spend money to display your ad.</p>
                </div>
              </div>
              <Dialog open={showSponsorDialog} onOpenChange={setShowSponsorDialog}>
                <DialogTrigger asChild><Button><Send className="w-4 h-4 mr-2" />Request Sponsorship</Button></DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>Sponsor Ad Request</DialogTitle><DialogDescription>Submit your ad for review.</DialogDescription></DialogHeader>
                  <form onSubmit={handleSponsorSubmit} className="space-y-4 py-4">
                    <div><Label>Ad Title *</Label><Input value={sponsorFormData.adTitle} onChange={(e) => handleSponsorFormChange('adTitle', e.target.value)} required /></div>
                    <div><Label>Ad Description *</Label><Textarea value={sponsorFormData.adDescription} onChange={(e) => handleSponsorFormChange('adDescription', e.target.value)} required /></div>
                    <div><Label>Upload Media *</Label><div className="mt-1 flex justify-center p-6 border-2 border-dashed rounded-md"><div className="text-center"><Upload className="mx-auto h-12 w-12 text-gray-400" /><label htmlFor="adMedia-upload" className="cursor-pointer font-medium text-purple-600"><span>Upload a file</span><input id="adMedia-upload" type="file" className="sr-only" onChange={(e) => handleSponsorFormChange('adMedia', e.target.files ? e.target.files[0] : null)} accept="image/*,video/*" required /></label>{sponsorFormData.adMedia ? <p className="text-xs text-green-600">Selected: {sponsorFormData.adMedia.name}</p> : <p className="text-xs text-gray-500">Up to 10MB</p>}</div></div></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Ad Plan *</Label>
                        <Select value={sponsorFormData.selectedRate} onValueChange={(v) => handleSponsorFormChange('selectedRate', v)} required>
                          <SelectTrigger><SelectValue placeholder="Select a plan..." /></SelectTrigger>
                          <SelectContent>
                            {adPricingOptions.map((plan) => (
                              <SelectItem key={plan.value} value={plan.value}>
                                {plan.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Campaign Duration (days) *</Label>
                        <Input type="number" value={sponsorFormData.duration} onChange={(e) => handleSponsorFormChange('duration', e.target.value)} placeholder="e.g., 7" min="1" required />
                      </div>
                    </div>
                    
                    <div><Label>Target Audience</Label><Input value={sponsorFormData.targetAudience} onChange={(e) => handleSponsorFormChange('targetAudience', e.target.value)} /></div>
                    
                    <div>
                      <Label>Business Category</Label>
                      <Select value={sponsorFormData.businessCategory} onValueChange={(v) => handleSponsorFormChange('businessCategory', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div><Label>Additional Notes</Label><Textarea value={sponsorFormData.additionalNotes} onChange={(e) => handleSponsorFormChange('additionalNotes', e.target.value)} /></div>
                    <DialogFooter>
                      <Button type="submit" className="w-full" disabled={!isSponsorFormValid || isSubmittingAd}>
                        {isSubmittingAd ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isSubmittingAd ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader><div className="flex items-center justify-between"><CardTitle className="flex items-center gap-2"><Tag/>My Coupons</CardTitle><Link to="/partner/add-coupon"><Button size="sm"><Plus className="w-4 h-4 mr-1"/>Add</Button></Link></div></CardHeader>
          <CardContent>
            {myCoupons.length === 0 ? <div className="text-center py-8"><ShoppingBag className="mx-auto w-10 h-10 text-gray-400"/><p>No coupons yet.</p></div> : myCoupons.map(c => <div key={c.id}>...</div>)}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardHeader><CardTitle>Partner Features</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {quickActions.map((action, i) => <Link key={i} to={action.href} className="group flex flex-col items-center p-4 border rounded-lg hover:shadow-lg"><div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center mb-2`}><action.icon className="w-7 h-7 text-white" /></div><span>{action.label}</span></Link>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}