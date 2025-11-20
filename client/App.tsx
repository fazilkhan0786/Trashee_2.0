import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, Component } from "react";
import { MobileOptimizations } from "@/lib/mobileOptimizations";

// Import BottomNav directly (not lazy-loaded) since it's critical UI
import BottomNav from "./components/ui/bottom-nav";

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">The application encountered an error</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this.props as any).children;
  }
}

// Lazy load components with error handling
const LazyComponent = ({ importFn, fallback, name }: { importFn: () => Promise<any>, fallback: React.ReactNode, name: string }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    importFn()
      .then((module) => setComponent(() => module.default))
      .catch((err) => {
        console.error(`Failed to load ${name}:`, err);
        setError(err.message);
      });
  }, [importFn, name]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold text-red-600 mb-4">Component Error</h1>
          <p className="text-gray-600 mb-4">Failed to load {name}</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading {name}...</p>
        </div>
      </div>
    );
  }

  return <Component />;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  // Initialize mobile optimizations
  useEffect(() => {
    MobileOptimizations.initialize();
    MobileOptimizations.setupBackButtonHandler();
    MobileOptimizations.optimizePerformance();
    MobileOptimizations.handleOrientationChange();
    MobileOptimizations.setupNetworkMonitoring();
  }, []);

  // Determine user type from current path
  const getUserType = () => {
    if (location.pathname.startsWith('/consumer')) return 'consumer';
    if (location.pathname.startsWith('/partner')) return 'partner';
    if (location.pathname.startsWith('/collector')) return 'collector';
    if (location.pathname.startsWith('/admin')) return 'admin';
    return null;
  };

  const userType = getUserType();
  const showBottomNav = userType !== null;

  // Check if premium popup should be shown
  useEffect(() => {
    if (userType === 'consumer' || userType === 'partner') {
      const hasSeenPopup = localStorage.getItem(`premium-popup-seen-${userType}`);
      if (!hasSeenPopup) {
        const timer = setTimeout(() => {
          setShowPremiumPopup(true);
        }, 2000); // Show after 2 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [userType, location.pathname]);

  const handleClosePremiumPopup = () => {
    try {
      setShowPremiumPopup(false);
      if (userType) {
        localStorage.setItem(`premium-popup-seen-${userType}`, 'true');
      }
    } catch (error) {
      console.error('Error closing premium popup:', error);
      setShowPremiumPopup(false);
    }
  };

  const handleUpgradeClick = () => {
    try {
      handleClosePremiumPopup();
      const upgradePath = `/${userType}/purchase-premium`;
      if (window.location.pathname !== upgradePath) {
        window.location.href = upgradePath;
      }
    } catch (error) {
      console.error('Error navigating to upgrade:', error);
      window.location.href = `/${userType}/purchase-premium`;
    }
  };

  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={
          <LazyComponent 
            importFn={() => import("./pages/Login")} 
            fallback={<div>Loading Login...</div>}
            name="Login"
          />
        } />
        <Route path="/login" element={
          <LazyComponent 
            importFn={() => import("./pages/Login")} 
            fallback={<div>Loading Login...</div>}
            name="Login"
          />
        } />
        <Route path="/signup" element={
          <LazyComponent 
            importFn={() => import("./pages/Signup")} 
            fallback={<div>Loading Signup...</div>}
            name="Signup"
          />
        } />
        <Route path="/forgot-password" element={
          <LazyComponent 
            importFn={() => import("./pages/ForgotPassword")} 
            fallback={<div>Loading ForgotPassword...</div>}
            name="ForgotPassword"
          />
        } />
        
        {/* ✅ THE NEWLY ADDED ROUTE FOR THE PASSWORD UPDATE PAGE */}
        <Route path="/update-password" element={
          <LazyComponent
            importFn={() => import("./pages/UpdatePasswordPage.tsx")}
            fallback={<div>Loading Update Password...</div>}
            name="UpdatePassword"
          />
        } />

        {/* Consumer Routes */}
        <Route path="/consumer/home" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/Home")} 
            fallback={<div>Loading Consumer Home...</div>}
            name="ConsumerHome"
          />
        } />
        <Route path="/consumer/scanner" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/Scanner")} 
            fallback={<div>Loading Scanner...</div>}
            name="ConsumerScanner"
          />
        } />
        <Route path="/consumer/map" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/Map")} 
            fallback={<div>Loading Map...</div>}
            name="ConsumerMap"
          />
        } />
        <Route path="/consumer/coupons" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/CouponStore")} 
            fallback={<div>Loading Coupons...</div>}
            name="ConsumerCouponStore"
          />
        } />
        <Route path="/consumer/ads" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/WatchAds")} 
            fallback={<div>Loading Ads...</div>}
            name="ConsumerWatchAds"
          />
        } />
        <Route path="/consumer/refer" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/ReferFriends")} 
            fallback={<div>Loading Refer...</div>}
            name="ConsumerReferFriends"
          />
        } />
        <Route path="/consumer/wallet" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/Wallet")} 
            fallback={<div>Loading Wallet...</div>}
            name="ConsumerWallet"
          />
        } />
        <Route path="/consumer/notifications" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/Notifications")} 
            fallback={<div>Loading Notifications...</div>}
            name="ConsumerNotifications"
          />
        } />
        <Route path="/consumer/profile" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/Profile")} 
            fallback={<div>Loading Profile...</div>}
            name="ConsumerProfile"
          />
        } />
        <Route path="/consumer/purchase-premium" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/PurchasePremium")} 
            fallback={<div>Loading Premium...</div>}
            name="ConsumerPurchasePremium"
          />
        } />
        <Route path="/consumer/wheel-of-luck" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/WheelOfLuck")} 
            fallback={<div>Loading Wheel...</div>}
            name="ConsumerWheelOfLuck"
          />
        } />
        <Route path="/consumer/scan-history" element={
          <LazyComponent 
            importFn={() => import("./pages/consumer/ScanHistory")} 
            fallback={<div>Loading History...</div>}
            name="ConsumerScanHistory"
          />
        } />

        {/* Partner Routes */}
        <Route path="/partner/home" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/Home")} 
            fallback={<div>Loading Partner Home...</div>}
            name="PartnerHome"
          />
        } />
        <Route path="/partner/profile" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/Profile")} 
            fallback={<div>Loading Partner Profile...</div>}
            name="PartnerProfile"
          />
        } />
        <Route path="/partner/scanner" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/Scanner")} 
            fallback={<div>Loading Partner Scanner...</div>}
            name="PartnerScanner"
          />
        } />
        <Route path="/partner/map" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/Map")} 
            fallback={<div>Loading Partner Map...</div>}
            name="PartnerMap"
          />
        } />
        <Route path="/partner/wallet" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/Wallet")} 
            fallback={<div>Loading Partner Wallet...</div>}
            name="PartnerWallet"
          />
        } />
        <Route path="/partner/coupons" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/CouponStore")} 
            fallback={<div>Loading Partner Coupon Store...</div>}
            name="PartnerCouponStore"
          />
        } />
        <Route path="/partner/add-coupon" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/AddCoupon")} 
            fallback={<div>Loading Add Coupon...</div>}
            name="PartnerAddCoupon"
          />
        } />
        <Route path="/partner/my-coupons" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/MyCoupons")} 
            fallback={<div>Loading My Coupons...</div>}
            name="PartnerMyCoupons"
          />
        } />
        <Route path="/partner/notifications" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/Notifications")} 
            fallback={<div>Loading Partner Notifications...</div>}
            name="PartnerNotifications"
          />
        } />
        <Route path="/partner/scan-history" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/ScanHistory")} 
            fallback={<div>Loading Partner Scan History...</div>}
            name="PartnerScanHistory"
          />
        } />
        <Route path="/partner/refer" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/ReferFriends")} 
            fallback={<div>Loading Partner Refer Friends...</div>}
            name="PartnerReferFriends"
          />
        } />
        <Route path="/partner/ads" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/WatchAds")} 
            fallback={<div>Loading Partner Watch Ads...</div>}
            name="PartnerWatchAds"
          />
        } />
        <Route path="/partner/wheel-of-luck" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/WheelOfLuck")} 
            fallback={<div>Loading Partner Wheel of Luck...</div>}
            name="PartnerWheelOfLuck"
          />
        } />
        <Route path="/partner/purchase-premium" element={
          <LazyComponent 
            importFn={() => import("./pages/partner/PurchasePremium")} 
            fallback={<div>Loading Partner Purchase Premium...</div>}
            name="PartnerPurchasePremium"
          />
        } />

        {/* Collector Routes */}
        <Route path="/collector/home" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/Home")} 
            fallback={<div>Loading Collector Home...</div>}
            name="CollectorHome"
          />
        } />
        <Route path="/collector/profile" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/Profile")} 
            fallback={<div>Loading Collector Profile...</div>}
            name="CollectorProfile"
          />
        } />
        <Route path="/collector/scanner" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/Scanner")} 
            fallback={<div>Loading Collector Scanner...</div>}
            name="CollectorScanner"
          />
        } />
        <Route path="/collector/map" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/Map")} 
            fallback={<div>Loading Collector Map...</div>}
            name="CollectorMap"
          />
        } />
        <Route path="/collector/wallet" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/Wallet")} 
            fallback={<div>Loading Collector Wallet...</div>}
            name="CollectorWallet"
          />
        } />
        <Route path="/collector/coupons" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/CouponStore")} 
            fallback={<div>Loading Collector Coupon Store...</div>}
            name="CollectorCouponStore"
          />
        } />
        <Route path="/collector/collect-trash" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/CollectTrash")} 
            fallback={<div>Loading Collect Trash...</div>}
            name="CollectorCollectTrash"
          />
        } />
        <Route path="/collector/notifications" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/Notifications")} 
            fallback={<div>Loading Collector Notifications...</div>}
            name="CollectorNotifications"
          />
        } />
        <Route path="/collector/scan-history" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/ScanHistory")} 
            fallback={<div>Loading Collector Scan History...</div>}
            name="CollectorScanHistory"
          />
        } />
        <Route path="/collector/refer" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/ReferFriends")} 
            fallback={<div>Loading Collector Refer Friends...</div>}
            name="CollectorReferFriends"
          />
        } />
        <Route path="/collector/ads" element={
          <LazyComponent 
            importFn={() => import("./pages/collector/WatchAd")} 
            fallback={<div>Loading Collector Watch Ad...</div>}
            name="CollectorWatchAd"
          />
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/Dashboard")} 
            fallback={<div>Loading Admin Dashboard...</div>}
            name="AdminDashboard"
          />
        } />
        <Route path="/admin/profile" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/Profile")} 
            fallback={<div>Loading Admin Profile...</div>}
            name="AdminProfile"
          />
        } />
        <Route path="/admin/users" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/UserManagement")} 
            fallback={<div>Loading User Management...</div>}
            name="AdminUserManagement"
          />
        } />
        <Route path="/admin/bins" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/BinManagement")} 
            fallback={<div>Loading Bin Management...</div>}
            name="AdminBinManagement"
          />
        } />
        <Route path="/admin/qr-management" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/QRManagement")} 
            fallback={<div>Loading QR Management...</div>}
            name="AdminQRManagement"
          />
        } />
        <Route path="/admin/ads" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/AdManagement")} 
            fallback={<div>Loading Ad Management...</div>}
            name="AdminAdManagement"
          />
        } />
        <Route path="/admin/map" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/AdminMapExample")} 
            fallback={<div>Loading Admin Map...</div>}
            name="AdminMap"
          />
        } />
        <Route path="/admin/collector-assignment" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/CollectorAssignment")} 
            fallback={<div>Loading Collector Assignment...</div>}
            name="AdminCollectorAssignment"
          />
        } />
        <Route path="/admin/complaints" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/ComplaintManagement")} 
            fallback={<div>Loading Complaint Management...</div>}
            name="AdminComplaintManagement"
          />
        } />
        <Route path="/admin/coupon-management" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/CouponManagement")} 
            fallback={<div>Loading Coupon Management...</div>}
            name="AdminCouponManagement"
          />
        } />
        <Route path="/admin/registrations" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/RegistrationManagement")} 
            fallback={<div>Loading Registration Management...</div>}
            name="AdminRegistrationManagement"
          />
        } />
        <Route path="/admin/request-management" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/RequestManagement")} 
            fallback={<div>Loading Request Management...</div>}
            name="AdminRequestManagement"
          />
        } />
        <Route path="/admin/reward-management" element={
          <LazyComponent 
            importFn={() => import("./pages/admin/RewardManagement")} 
            fallback={<div>Loading Reward Management...</div>}
            name="AdminRewardManagement"
          />
        } />
        
        {/* Fallback route */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-green-600 mb-4">
                🗑️ Trashee Green Revolutionary
              </h1>
              <p className="text-gray-600 mb-4">
                Page not found. Current path: {window.location.pathname}
              </p>
              <div className="space-x-4">
                <a href="/login" className="text-blue-500 underline">Login</a>
                <a href="/consumer/home" className="text-green-500 underline">Consumer</a>
              </div>
            </div>
          </div>
        } />
      </Routes>

      {/* Show BottomNav for user-specific routes */}
      {showBottomNav && userType && (
        <BottomNav userType={userType} />
      )}

      {/* Premium Popup */}
      {showPremiumPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🚀 Upgrade to Premium!</h2>
              <button onClick={handleClosePremiumPopup} className="text-gray-500">✕</button>
            </div>
            <p className="text-gray-600 mb-4">Get exclusive features and benefits!</p>
            <div className="flex gap-2">
              <button onClick={handleUpgradeClick} className="bg-blue-500 text-white px-4 py-2 rounded">
                Upgrade Now
              </button>
              <button onClick={handleClosePremiumPopup} className="bg-gray-200 px-4 py-2 rounded">
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main App component rendering logic
const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}