import { NavigateFunction } from 'react-router-dom';

/**
 * Reliable back navigation that handles different scenarios
 */
export const safeNavigateBack = (navigate: NavigateFunction, fallbackPath?: string) => {
  try {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // If no history, navigate to a sensible fallback
      if (fallbackPath) {
        navigate(fallbackPath);
      } else {
        // Determine fallback based on current path
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/consumer/')) {
          navigate('/consumer/home');
        } else if (currentPath.includes('/partner/')) {
          navigate('/partner/home');
        } else if (currentPath.includes('/collector/')) {
          navigate('/collector/home');
        } else if (currentPath.includes('/admin/')) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    }
  } catch (error) {
    console.error('Navigation error:', error);
    // Fallback to home page of current user type
    const currentPath = window.location.pathname;
    if (currentPath.includes('/consumer/')) {
      navigate('/consumer/home');
    } else if (currentPath.includes('/partner/')) {
      navigate('/partner/home');
    } else if (currentPath.includes('/collector/')) {
      navigate('/collector/home');
    } else if (currentPath.includes('/admin/')) {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  }
};
