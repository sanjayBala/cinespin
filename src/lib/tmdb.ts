import axios from 'axios';

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
  }
});

// Add error handling interceptor
tmdbClient.interceptors.response.use(
  response => response,
  error => {
    console.error('TMDB API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
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
  const DESIRED_ITEM_COUNT = 150;
  const PAGES_TO_FETCH = Math.ceil(DESIRED_ITEM_COUNT / ITEMS_PER_PAGE);
  
  // First, get the total number of pages available
  const initialResponse = await tmdbClient.get<TMDbResponse>(`/discover/${preferences.mediaType}`, {
    params: {
      with_genres: preferences.genres?.join(','),
      [`${preferences.mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'}.gte`]: 
        preferences.yearStart ? `${preferences.yearStart}-01-01` : '1900-01-01',
      [`${preferences.mediaType === 'movie' ? 'primary_release_date' : 'first_air_date'}.lte`]: 
        preferences.yearEnd ? `${preferences.yearEnd}-12-31` : `${currentYear}-12-31`,
      'vote_average.gte': preferences.minRating || 0,
      'vote_average.lte': preferences.maxRating || 10,
      'with_original_language': preferences.language,
      'vote_count.gte': 100,
      'popularity.gte': preferences.minPopularity || 0,
      sort_by: 'popularity.desc',
      include_adult: preferences.includeAdult || false,
      page: 1
    },
  });

  const totalAvailablePages = initialResponse.data.total_pages;
  
  let startPage = 1;
  if (pageOffset) {
    startPage = pageOffset;
  } else if (totalAvailablePages > PAGES_TO_FETCH) {
    startPage = Math.floor(Math.random() * (totalAvailablePages - PAGES_TO_FETCH + 1)) + 1;
  }

  const pagesToFetch = Math.min(PAGES_TO_FETCH, totalAvailablePages - startPage + 1);
  const allItems: MediaItem[] = [];

  const pagePromises = Array.from({ length: pagesToFetch }, (_, i) =>
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
        'vote_count.gte': 100,
        'popularity.gte': preferences.minPopularity || 0,
        sort_by: 'popularity.desc',
        include_adult: preferences.includeAdult || false,
        page: startPage + i
      },
    }).then(response => {
      allItems.push(...response.data.results);
      if (onProgress) {
        onProgress({
          currentPage: i + 1,
          totalPages: pagesToFetch,
          totalMovies: initialResponse.data.total_results,
          moviesLoaded: allItems.length
        });
      }
      return response;
    })
  );

  await Promise.all(pagePromises);

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
  const response = await tmdbClient.get(`/movie/${movieId}`, {
    params: {
      append_to_response: 'credits,recommendations',
    },
  });
  return response.data;
}

export async function searchMovies(query: string): Promise<MediaItem[]> {
  const response = await tmdbClient.get('/search/movie', {
    params: {
      query,
      include_adult: false,
    },
  });
  return response.data.results;
}

export function getImageUrl(path: string | null, size: 'original' | 'w500' = 'w500'): string {
  if (!path) return '/placeholder-movie.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
} 