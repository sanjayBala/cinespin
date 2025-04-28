import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CACHE_EXPIRY_KEY = 'cinespin_cache_expiry';
const CACHE_DURATION_MS = 20 * 1000; // 20 seconds

/**
 * Implements manual client-side cache clearing after 20 seconds
 * to work alongside Next.js staleTimes experimental feature
 */
export function useCacheManager() {
  const router = useRouter();

  useEffect(() => {
    // Check if we need to refresh cache on mount
    const shouldClearCache = checkCacheExpiry();
    
    if (shouldClearCache) {
      // Clear Next.js cache by refreshing the current route
      router.refresh();
      
      // Set new expiry time
      setCacheExpiry();
      
      console.log('Cache cleared after expiry');
    }
    
    // Set initial expiry time if not set
    if (!localStorage.getItem(CACHE_EXPIRY_KEY)) {
      setCacheExpiry();
    }
  }, [router]);
}

/**
 * Checks if the cache has expired
 * @returns boolean - true if cache has expired
 */
function checkCacheExpiry(): boolean {
  const expiryTimeStr = localStorage.getItem(CACHE_EXPIRY_KEY);
  
  if (!expiryTimeStr) return false;
  
  const expiryTime = parseInt(expiryTimeStr, 10);
  const currentTime = new Date().getTime();
  
  return currentTime > expiryTime;
}

/**
 * Sets a new cache expiry timestamp
 */
function setCacheExpiry(): void {
  const expiryTime = new Date().getTime() + CACHE_DURATION_MS;
  localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
}

/**
 * Manually clears the cache and resets the expiry timer
 */
export function forceRefreshCache(router: ReturnType<typeof useRouter>): void {
  router.refresh();
  setCacheExpiry();
} 