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

export async function discoverMedia(
  preferences: MediaPreferencesFilter,
  onProgress?: (progress: FetchProgress) => void,
  pageOffset?: number
): Promise<{ media: MediaItem[]; totalResults: number; currentPage: number }> {
  const currentYear = new Date().getFullYear();
  const ITEMS_PER_PAGE = 20; // TMDb's fixed page size
  const DESIRED_ITEM_COUNT = 64; // Reduced from 100 to limit API pressure
  const PAGES_TO_FETCH = Math.ceil(DESIRED_ITEM_COUNT / ITEMS_PER_PAGE);
  
  // Reduce minimum vote count for less common languages
  // This helps get more diverse results for languages with fewer movies
  let voteCountMin = 50; // default
  const lessCommonLanguages = ['mr', 'ml', 'kn', 'gu', 'pa', 'te', 'bn'];
  if (preferences.language && lessCommonLanguages.includes(preferences.language)) {
    voteCountMin = 10; // Much lower for regional languages
  }
  
  // First, get the total number of pages available with retry logic
  const initialResponse = await retryAxiosRequest(() => 
    tmdbClient.get<TMDbResponse>(`/discover/${preferences.mediaType}`, {
      params: {
        with_genres: preferences.genres?.join(','),
        [`${preferences.mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'}.gte`]: 
          preferences.yearStart ? `${preferences.yearStart}-01-01` : '1900-01-01',
        [`${preferences.mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'}.lte`]: 
          preferences.yearEnd ? `${preferences.yearEnd}-12-31` : `${currentYear}-12-31`,
        'vote_average.gte': preferences.minRating || 0,
        'vote_average.lte': preferences.maxRating || 10,
        'with_original_language': preferences.language,
        'vote_count.gte': voteCountMin,
        'popularity.gte': preferences.minPopularity || 0,
        sort_by: 'popularity.desc',
        include_adult: preferences.includeAdult || false,
        page: 1
      },
    }),
    5,  // Increased retries for initial request
    1500 // Longer initial delay
  );

  const totalAvailablePages = initialResponse.data.total_pages;
  
  let startPage = 1;
  if (pageOffset) {
    startPage = pageOffset;
  } else if (totalAvailablePages > PAGES_TO_FETCH) {
    startPage = Math.floor(Math.random() * (totalAvailablePages - PAGES_TO_FETCH + 1)) + 1;
  }

  // Limit pages to fetch to reduce load
  const pagesToFetch = Math.min(PAGES_TO_FETCH, totalAvailablePages - startPage + 1, 5);
  const allItems: MediaItem[] = [];

  // Start with initial response data
  allItems.push(...initialResponse.data.results);

  // Sequential fetching with limited concurrency
  for (let i = 0; i < pagesToFetch - 1; i++) {
    try {
      const response = await retryAxiosRequest(() => 
        tmdbClient.get<TMDbResponse>(`/discover/${preferences.mediaType}`, {
          params: {
            with_genres: preferences.genres?.join(','),
            [`${preferences.mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'}.gte`]: 
              preferences.yearStart ? `${preferences.yearStart}-01-01` : '1900-01-01',
            [`${preferences.mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'}.lte`]: 
              preferences.yearEnd ? `${preferences.yearEnd}-12-31` : `${currentYear}-12-31`,
            'vote_average.gte': preferences.minRating || 0,
            'vote_average.lte': preferences.maxRating || 10,
            'with_original_language': preferences.language,
            'vote_count.gte': voteCountMin,
            'popularity.gte': preferences.minPopularity || 0,
            sort_by: 'popularity.desc',
            include_adult: preferences.includeAdult || false,
            page: startPage + i + 1
          },
        }),
        4,   // Increase retries for subsequent requests
        1200  // Increased delay
      );
      
      allItems.push(...response.data.results);
      
      if (onProgress) {
        onProgress({
          currentPage: i + 2,
          totalPages: pagesToFetch,
          totalMovies: initialResponse.data.total_results,
          moviesLoaded: allItems.length
        });
      }
      
      // Increased delay between requests to avoid overloading the API and reduce connection resets
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      // If we've got some items already, we can proceed despite the error
      if (allItems.length > 0) {
        logger.warn('Error fetching additional pages, but continuing with available results', { error });
        break;
      }
      throw error;
    }
  }

  // If we have at least one result, return it even if we couldn't fetch everything
  if (allItems.length === 0) {
    throw new Error('No movies found matching your criteria');
  }

  // Shuffle the items array for better randomization
  for (let i = allItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
  }

  return {
    media: allItems,
    totalResults: initialResponse.data.total_results,
    currentPage: startPage
  };
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