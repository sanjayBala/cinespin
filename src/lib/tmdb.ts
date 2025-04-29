import axios, { AxiosError } from 'axios';
import logger from './logger';

// Get TMDB API key from environment variable
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is not defined in environment variables');
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string; // for TV shows
  overview: string;
  release_date?: string;
  first_air_date?: string; // for TV shows
  vote_average: number;
  vote_count: number;
  popularity: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  original_language: string;
}

export interface MediaPreferencesFilter {
  mediaType: 'movie' | 'tv';
  genres?: number[];
  yearStart?: number;
  yearEnd?: number;
  language?: string;
  minRating?: number;
  maxRating?: number;
  minPopularity?: number;
  includeAdult?: boolean;
  excludeIds?: number[];
}

interface TMDbResponse {
  page: number;
  results: MediaItem[];
  total_pages: number;
  total_results: number;
}

export interface FetchProgress {
  currentPage: number;
  totalPages: number;
  totalMovies: number;
  moviesLoaded: number;
}

const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: TMDB_API_KEY,
  },
  headers: {
    'Accept': 'application/json'
  },
  // Add timeout to prevent hanging requests
  timeout: 10000, // 10 seconds
});

// Function to implement retry logic
const retryAxiosRequest = async <T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    const err = error as AxiosError;
    if (retries <= 0) {
      throw error;
    }
    
    // Enhanced retry logic to handle network errors like ECONNRESET more explicitly
    if (
      !err.response || 
      (err.response.status >= 500 && err.response.status < 600) ||
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT' ||
      err.code === 'ECONNABORTED' ||
      err.message.includes('Network Error')
    ) {
      logger.warn(`Retrying TMDB API request after ${err.code || 'network error'}. Attempts left: ${retries}`, { 
        error: err.message,
        code: err.code,
        status: err.response?.status,
      });
      
      // Increased wait time before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      return retryAxiosRequest(fn, retries - 1, delay * 2);
    }
    
    throw error;
  }
};

// Add error handling interceptor
tmdbClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      logger.error('TMDB API connection error:', {
        error: error.message,
        code: error.code
      });
    } else {
      logger.error('TMDB API Error:', {
        message: error.message,
        response: error.response ? {
          data: error.response.data,
          status: error.response.status
        } : 'No response'
      });
    }
    throw error;
  }
);

// Import any necessary functions from your cacheManager
const CACHE_EXPIRY_KEY = 'cinespin_cache_expiry';

/**
 * Discover movies or TV shows based on user preferences
 */
export async function discoverMedia(preferences: MediaPreferencesFilter): Promise<{ media: MediaItem[], totalResults: number }> {
  // Check if cache is expired
  const shouldBypassCache = checkCacheExpiry();
  
  try {
    // Destructure preferences
    const { 
      mediaType, 
      genres,
      yearStart,
      yearEnd,
      language,
      minRating,
      maxRating,
      minPopularity,
      includeAdult,
      excludeIds
    } = preferences;
    
    const endpoint = mediaType === 'movie' ? '/discover/movie' : '/discover/tv';
    
    // Assemble request parameters
    const params: Record<string, string | number | boolean | undefined> = {
      with_genres: genres?.join(',') || undefined,
      'vote_average.gte': minRating || undefined,
      'vote_average.lte': maxRating || undefined,
      'vote_count.gte': 25, // Ensure some minimum vote count for quality
      'popularity.gte': minPopularity || undefined,
      sort_by: 'popularity.desc',
      include_adult: includeAdult || false,
      language: 'en-US', // Always use English for display language
      with_original_language: language, // Filter movies by their original language
    };
    
    // Add year parameters if provided
    if (yearStart) {
      params[mediaType === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte'] = 
        `${yearStart}-01-01`;
    }
    
    if (yearEnd) {
      params[mediaType === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte'] = 
        `${yearEnd}-12-31`;
    }
    
    // If cache should be bypassed, add a unique cache-busting parameter
    if (shouldBypassCache) {
      params._cacheBust = Date.now();
    }
    
    // To get more diversity in results, we'll fetch a larger set of pages
    // First fetch to get the total number of available results
    const initialResponse = await retryAxiosRequest(() => 
      tmdbClient.get<TMDbResponse>(endpoint, { 
        params: { ...params, page: 1 } 
      })
    );
    
    const { total_pages, total_results } = initialResponse.data;
    
    // If there are multiple pages, try to get results from different pages
    let allResults: MediaItem[] = [...initialResponse.data.results];
    
    if (total_pages > 1) {
      // Get up to 3 additional pages randomly to increase diversity
      const pagesToFetch = Math.min(3, total_pages - 1);
      const additionalPages: number[] = [];
      
      // Select random pages (avoiding duplicates)
      while (additionalPages.length < pagesToFetch) {
        const randomPage = Math.floor(Math.random() * total_pages) + 1;
        if (randomPage !== 1 && !additionalPages.includes(randomPage)) {
          additionalPages.push(randomPage);
        }
      }
      
      // Fetch additional pages
      for (const page of additionalPages) {
        try {
          const pageResponse = await retryAxiosRequest(() => 
            tmdbClient.get<TMDbResponse>(endpoint, { 
              params: { ...params, page } 
            })
          );
          
          allResults = [...allResults, ...pageResponse.data.results];
        } catch {
          // If we fail to get additional pages but have some results, continue
          logger.warn(`Failed to fetch page ${page}, continuing with available results`);
        }
      }
    }
    
    // Filter out excluded IDs if provided
    let filteredResults = allResults;
    if (excludeIds && excludeIds.length > 0) {
      const excludeSet = new Set(excludeIds);
      filteredResults = allResults.filter(item => !excludeSet.has(item.id));
      
      logger.info('Filtered out viewed items', {
        beforeCount: allResults.length,
        afterCount: filteredResults.length,
        excludedCount: allResults.length - filteredResults.length
      });
      
      // If filtering leaves us with no results, use original set
      // This ensures user still gets recommendations even if they've seen many movies
      if (filteredResults.length === 0) {
        logger.info('All results were excluded - using original set for variety');
        filteredResults = allResults;
      }
    }
    
    // Reset cache expiry timer after successful fetch
    setCacheExpiry();
    
    return {
      media: filteredResults,
      totalResults: total_results
    };
  } catch (error) {
    logger.error('Error in discoverMedia:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      preferences
    });
    throw error;
  }
}

// Check if the cache has expired
function checkCacheExpiry(): boolean {
  if (typeof window === 'undefined') return false;
  
  const expiryTimeStr = localStorage.getItem(CACHE_EXPIRY_KEY);
  
  if (!expiryTimeStr) return false;
  
  const expiryTime = parseInt(expiryTimeStr, 10);
  const currentTime = new Date().getTime();
  
  return currentTime > expiryTime;
}

// Sets a new cache expiry timestamp
function setCacheExpiry(): void {
  if (typeof window === 'undefined') return;
  
  const expiryTime = new Date().getTime() + (20 * 1000); // 20 seconds
  localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
}

export async function getMovieDetails(movieId: number) {
  return retryAxiosRequest(() => 
    tmdbClient.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,recommendations',
      },
    })
  ).then(response => response.data);
}

export async function searchMovies(query: string): Promise<MediaItem[]> {
  return retryAxiosRequest(() => 
    tmdbClient.get('/search/movie', {
      params: {
        query,
        include_adult: false,
      },
    })
  ).then(response => response.data.results);
}

export function getImageUrl(path: string | null, size: 'original' | 'w500' = 'w500'): string {
  if (!path) return '/placeholder-movie.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
} 