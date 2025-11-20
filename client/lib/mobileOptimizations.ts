import { CapacitorService } from './capacitorService';

export class MobileOptimizations {
  // Initialize mobile-specific features
  static async initialize(): Promise<void> {
    if (CapacitorService.isNative()) {
      await CapacitorService.initializeApp();
      
      // Set mobile-specific CSS classes
      document.body.classList.add('mobile-app');
      
      // Disable zoom on mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
      
      // Add mobile-specific styles
      this.addMobileStyles();
    }
  }

  // Add mobile-specific CSS
  private static addMobileStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .mobile-app {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        overscroll-behavior: none;
      }
      
      .mobile-app * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
      }
      
      /* Improve touch targets */
      .mobile-app button,
      .mobile-app a,
      .mobile-app [role="button"] {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Safe area support for notched devices */
      .mobile-app .safe-area-top {
        padding-top: env(safe-area-inset-top);
      }
      
      .mobile-app .safe-area-bottom {
        padding-bottom: env(safe-area-inset-bottom);
      }
      
      /* Prevent overscroll bounce */
      .mobile-app {
        position: fixed;
        overflow: hidden;
        width: 100%;
        height: 100%;
      }
      
      .mobile-app #root {
        height: 100vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
  }

  // Handle back button for Android
  static setupBackButtonHandler(): void {
    if (CapacitorService.isNative()) {
      document.addEventListener('backbutton', (e) => {
        e.preventDefault();
        
        // Custom back button logic
        const currentPath = window.location.pathname;
        
        if (currentPath === '/consumer/home' || 
            currentPath === '/partner/home' || 
            currentPath === '/collector/home' || 
            currentPath === '/admin/dashboard') {
          // Exit app on home screens - handled by Capacitor
          if ((window as any).App) {
            (window as any).App.exitApp();
          }
        } else {
          // Navigate back
          window.history.back();
        }
      });
    }
  }

  // Optimize for mobile performance
  static optimizePerformance(): void {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Reduce animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
      document.body.classList.add('reduced-motion');
    }
  }

  // Handle orientation changes
  static handleOrientationChange(): void {
    window.addEventListener('orientationchange', () => {
      // Force layout recalculation after orientation change
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    });
  }

  // Network status monitoring
  static setupNetworkMonitoring(): void {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      document.body.classList.toggle('offline', !isOnline);
      
      // Show offline indicator
      if (!isOnline) {
        CapacitorService.scheduleLocalNotification(
          'No Internet Connection',
          'Some features may not work properly while offline.'
        );
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();
  }
}
