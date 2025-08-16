export interface AdminAdvertisement {
  id: string;
  title: string;
  description: string;
  type: 'banner' | 'popup' | 'native' | 'video';
  placement: 'home_top' | 'home_bottom' | 'dashboard' | 'scanner' | 'profile' | 'global' | 'smart_bin';
  targetAudience: 'all' | 'consumers' | 'partners' | 'collectors' | 'premium';
  status: 'active' | 'paused' | 'scheduled' | 'expired' | 'draft';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  impressions: number;
  clicks: number;
  ctr: number;
  imageUrl?: string;
  linkUrl?: string;
  createdAt: string;
  lastUpdated: string;
  advertiser: string;
}

// Mock data - in a real app, this would come from an API
const mockAdminAds: AdminAdvertisement[] = [
  {
    id: 'AD-001',
    title: 'Go Green Challenge 2024',
    description: 'Join our eco-friendly initiative and earn double points for recycling this month!',
    type: 'banner',
    placement: 'home_top',
    targetAudience: 'all',
    status: 'active',
    priority: 'high',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    budget: 10000,
    spent: 3500,
    impressions: 45000,
    clicks: 1350,
    ctr: 3.0,
    imageUrl: '/placeholder.svg',
    linkUrl: '/consumer/scanner',
    createdAt: '2024-01-10',
    lastUpdated: '2024-01-15',
    advertiser: 'EcoCity Municipality'
  },
  {
    id: 'AD-002',
    title: 'Premium Membership Benefits',
    description: 'Upgrade to premium and get exclusive rewards, 5x points, and priority support',
    type: 'banner',
    placement: 'home_bottom',
    targetAudience: 'consumers',
    status: 'active',
    priority: 'medium',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    budget: 5000,
    spent: 1200,
    impressions: 25000,
    clicks: 750,
    ctr: 3.0,
    imageUrl: '/placeholder.svg',
    linkUrl: '/consumer/purchase-premium',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-05',
    advertiser: 'EcoApp Team'
  },
  {
    id: 'AD-003',
    title: 'Partner Business Growth',
    description: 'Scale your business with our advanced analytics and marketing tools',
    type: 'banner',
    placement: 'dashboard',
    targetAudience: 'partners',
    status: 'active',
    priority: 'high',
    startDate: '2024-01-10',
    endDate: '2024-02-28',
    budget: 8000,
    spent: 2100,
    impressions: 18000,
    clicks: 540,
    ctr: 3.0,
    imageUrl: '/placeholder.svg',
    linkUrl: '/partner/purchase-premium',
    createdAt: '2024-01-08',
    lastUpdated: '2024-01-10',
    advertiser: 'EcoApp Business'
  },
  {
    id: 'AD-004',
    title: 'Collector Efficiency Program',
    description: 'New routes optimization tools available! Increase your collection efficiency by 40%',
    type: 'banner',
    placement: 'home_top',
    targetAudience: 'collectors',
    status: 'active',
    priority: 'medium',
    startDate: '2024-01-12',
    endDate: '2024-02-20',
    budget: 3000,
    spent: 800,
    impressions: 12000,
    clicks: 360,
    ctr: 3.0,
    imageUrl: '/placeholder.svg',
    linkUrl: '/collector/map',
    createdAt: '2024-01-10',
    lastUpdated: '2024-01-12',
    advertiser: 'EcoApp Operations'
  }
];

export const getActiveAds = (
  userType: 'consumers' | 'partners' | 'collectors',
  placement: 'home_top' | 'home_bottom' | 'dashboard' | 'global'
): AdminAdvertisement[] => {
  const now = new Date();
  
  return mockAdminAds.filter(ad => {
    // Check if ad is active and within date range
    const isActive = ad.status === 'active';
    const isInDateRange = new Date(ad.startDate) <= now && 
                         (!ad.endDate || new Date(ad.endDate) >= now);
    
    // Check target audience
    const targetMatches = ad.targetAudience === 'all' || ad.targetAudience === userType;
    
    // Check placement
    const placementMatches = ad.placement === placement || ad.placement === 'global';
    
    return isActive && isInDateRange && targetMatches && placementMatches;
  }).sort((a, b) => {
    // Sort by priority: high > medium > low
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const trackAdClick = (adId: string) => {
  // In a real app, this would send analytics data
  console.log('Ad clicked:', adId);
};

export const trackAdImpression = (adId: string) => {
  // In a real app, this would send analytics data
  console.log('Ad impression:', adId);
};
