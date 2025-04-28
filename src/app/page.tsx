'use client';

import { useState, useEffect } from 'react';
import MoviePreferencesForm from '@/components/MoviePreferencesForm';
import { MediaPreferencesFilter, MediaItem } from '@/lib/tmdb';
import { FaArrowLeft, FaHome, FaSearch, FaChevronDown, FaChevronUp, FaExclamationCircle, FaInfoCircle, FaTimes, FaTrash } from 'react-icons/fa';
import MovieCard from '@/components/MovieCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const MAX_RETRIES = 3; // Limit retries for fetching a different recommendation
const MAX_HISTORY_SIZE = 100; // Limit the number of movies we store in history

// Define interface for history items that includes media type
interface ViewedItem {
  id: number;
  type: 'movie' | 'tv';
}

// Define the API response type
interface RecommendationResponse {
  movie: MediaItem;
  totalCount: number;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [searchingAgain, setSearchingAgain] = useState(false);
  const [recommendation, setRecommendation] = useState<MediaItem | null>(null);
  const [currentPreferences, setCurrentPreferences] = useState<MediaPreferencesFilter | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [viewedItems, setViewedItems] = useState<ViewedItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [showClearHistoryPopup, setShowClearHistoryPopup] = useState(false);
  const [showClearHistorySuccess, setShowClearHistorySuccess] = useState(false);

  // Load viewed items from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('cinespin_viewed_items');
    if (storedHistory) {
      try {
        setViewedItems(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Error parsing viewed history:', e);
        // Reset if corrupted
        localStorage.setItem('cinespin_viewed_items', JSON.stringify([]));
      }
    }
  }, []);

  // Update localStorage when viewedItems changes
  useEffect(() => {
    if (viewedItems.length > 0) {
      localStorage.setItem('cinespin_viewed_items', JSON.stringify(viewedItems));
    }
  }, [viewedItems]);

  // Add item to viewed history with media type
  const addToViewedHistory = (id: number, isMovie: boolean) => {
    setViewedItems(prev => {
      // Skip if already in history
      if (prev.some(item => item.id === id)) return prev;
      
      // Create new item with correct type
      const newItem: ViewedItem = { 
        id, 
        type: isMovie ? 'movie' : 'tv' 
      };
      
      // Add to beginning of array for recency (newest first)
      const updated: ViewedItem[] = [newItem, ...prev];
      
      // Keep history size manageable
      return updated.slice(0, MAX_HISTORY_SIZE);
    });
  };

  const handleSubmit = async (
    preferences: MediaPreferencesFilter,
    showLoading = true,
    isSearchAgain = false,
    retryCount = 0 // Initialize retry count
  ) => {
    if (showLoading) {
      setLoading(true);
    }
    if (!isSearchAgain || retryCount === 0) {
      setNoResultsFound(false);
    }

    if (!isSearchAgain) {
      setRecommendation(null);
    }

    setCurrentPreferences(preferences);
    let movieResult: MediaItem | null = null;
    let totalMoviesFound = 0;

    try {
      // Add viewedItems to the request payload
      const requestPayload = {
        ...preferences,
        excludeIds: viewedItems.map(item => item.id)
      };

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        console.error('API Error:', response.status, await response.text());
        throw new Error(`Failed to fetch recommendations (${response.status})`);
      }

      const apiResponse = await response.json() as RecommendationResponse; 

      // Extract movie and count from the response
      movieResult = apiResponse.movie;
      totalMoviesFound = apiResponse.totalCount;

      // Check for duplicates and retry if necessary
      if (movieResult && recommendation && movieResult.id === recommendation.id && retryCount < MAX_RETRIES) {
        console.log(`Duplicate found (ID: ${movieResult.id}), retrying... Attempt: ${retryCount + 1}`);
        await handleSearchAgain(retryCount + 1);
        return;
      }

      // If not a duplicate or retries exhausted, update state
      if (!movieResult) {
        setRecommendation(null);
        setTotalCount(0);
        setNoResultsFound(true);
      } else {
        // Add the movie to viewed history
        const isMovie = !!movieResult.title; // If it has a title, it's a movie, otherwise it's a TV show
        addToViewedHistory(movieResult.id, isMovie);
        setRecommendation(movieResult);
        setTotalCount(totalMoviesFound);
        setNoResultsFound(false);
      }

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendation(null);
      setNoResultsFound(true);
      setTotalCount(0);
    } finally {
      // Only stop top-level loading indicator
      if (showLoading) {
         setLoading(false);
      }
      // Only stop the search again spinner if it's the final attempt (not a retry)
      if (isSearchAgain && !(recommendation && movieResult && movieResult.id === recommendation.id && retryCount < MAX_RETRIES)) {
        setSearchingAgain(false);
      }
    }
  };

  const handleSearchAgain = async (retryCount = 0) => {
    if (currentPreferences) {
      if (retryCount === 0) {
        setSearchingAgain(true);
      }
      await handleSubmit(currentPreferences, false, true, retryCount);
    }
  };

  const handleSearchAgainClick = () => {
    handleSearchAgain();
  };

  const handleGoHome = () => {
    setRecommendation(null);
    setCurrentPreferences(null);
    setNoResultsFound(false);
  };

  // Updated to show confirmation popup instead of immediate clearing
  const handleClearHistory = () => {
    setShowClearHistoryPopup(true);
  };

  // Function to actually clear history after confirmation
  const confirmClearHistory = () => {
    setViewedItems([]);
    localStorage.removeItem('cinespin_viewed_items');
    setShowClearHistoryPopup(false);
    setShowClearHistorySuccess(true);
    
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowClearHistorySuccess(false);
    }, 3000);
  };

  // This function returns the appropriate text based on viewed history
  const getViewedHistoryText = () => {
    if (viewedItems.length === 0) return "";
    
    // Count movies and TV shows
    const movieCount = viewedItems.filter(item => item.type === 'movie').length;
    const tvCount = viewedItems.filter(item => item.type === 'tv').length;
    
    if (movieCount > 0 && tvCount === 0) {
      return `${viewedItems.length} Movie${viewedItems.length !== 1 ? 's' : ''} viewed so far`;
    } else if (movieCount === 0 && tvCount > 0) {
      return `${viewedItems.length} TV Show${viewedItems.length !== 1 ? 's' : ''} viewed so far`;
    } else {
      return `${viewedItems.length} Titles viewed so far (${movieCount} Movies, ${tvCount} TV Shows)`;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (recommendation) {
    return (
      <>
        {searchingAgain && <LoadingSpinner size="full" />}
        
        {/* Clear History Confirmation Popup */}
        {showClearHistoryPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-xl border-2 border-[#FFD700] p-6 max-w-sm w-full shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-righteous text-[#FFD700]">Clear History?</h3>
                <button 
                  onClick={() => setShowClearHistoryPopup(false)}
                  className="text-[#FFD700] hover:text-[#FF4081] transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              <p className="text-white mb-6">
                This will remove all {viewedItems.length} items from your viewing history. You might start seeing these recommendations again.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowClearHistoryPopup(false)}
                  className="px-4 py-2 bg-[#3a3a3a] text-white rounded-lg hover:bg-[#4a4a4a] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmClearHistory}
                  className="px-4 py-2 bg-[#FF4081] text-white rounded-lg hover:bg-[#F50057] transition-colors flex items-center gap-2"
                >
                  <FaTrash size={14} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Message */}
        {showClearHistorySuccess && (
          <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
            <div className="bg-[#2a2a2a] text-[#FFD700] px-4 py-3 rounded-full shadow-lg border border-[#FFD700] flex items-center gap-2 animate-fade-in">
              <FaInfoCircle />
              <span>Your viewing history has been cleared!</span>
            </div>
          </div>
        )}
        
        <main className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] py-8 sm:py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 text-[#FFD700] hover:text-[#FF4081] transition-colors mb-6 sm:mb-8 font-righteous text-base sm:text-lg"
            >
              <FaArrowLeft />
              <span>Back to Home</span>
            </button>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-righteous text-center mb-6 sm:mb-8 text-[#FFD700]">
              🎬 Your Recommended {recommendation.title ? 'Movie' : 'TV Show'}
            </h2>

            {/* Add message for single result */}
            {totalCount === 1 && (
              <div className="max-w-lg mx-auto mb-6 p-3 bg-[#3a3a3a] border border-[#FFD700] rounded-lg text-center text-[#FFD700] flex items-center justify-center gap-2 shadow-md">
                <FaInfoCircle className="text-[#FFD700]" />
                <span>Unfortunately, this is the only result matching your criteria. Adjust the filters to find more options!</span>
              </div>
            )}

            <div className="max-w-[280px] sm:max-w-[350px] mx-auto">
              <MovieCard key={recommendation.id} movie={recommendation} />
            </div>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleSearchAgainClick}
                disabled={searchingAgain || totalCount === 1}
                className="px-6 sm:px-8 py-3 bg-[#FF4081] text-white rounded-lg font-righteous text-base sm:text-lg tracking-wider hover:bg-[#F50057] transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-80 disabled:hover:bg-[#FF4081] disabled:hover:scale-100"
              >
                <FaSearch />
                <span>Search Again</span>
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 sm:px-8 py-3 bg-[#FFD700] text-[#1a1a1a] rounded-lg font-righteous text-base sm:text-lg tracking-wider hover:bg-[#FFC107] transform transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
              >
                <FaHome />
                <span>Home</span>
              </button>
            </div>
            
            {/* Display viewed items count and clear history button if there are viewed items */}
            {viewedItems.length > 0 && (
              <div className="mt-6 sm:mt-8 max-w-md mx-auto bg-[#2a2a2a] border border-[#FFD700]/50 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="text-[#FFD700] font-medium">
                    {getViewedHistoryText()}
                  </div>
                </div>
                <div className="flex justify-center mt-3">
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-1 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#FF4081] rounded-full transition-colors duration-200 text-sm flex items-center gap-1.5"
                  >
                    <span>Clear history</span>
                  </button>
                </div>
              </div>
            )}

            <footer className="mt-8 sm:mt-12 text-center space-y-4">
              <p className="text-[#FFD700]">
                Created by{' '}
                <a
                  href="https://sanjaybalaji.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#FFC107] transition-colors duration-200"
                >
                  Sanjay Balaji
                </a>
              </p>
              <div className="flex flex-col items-center gap-2 text-sm text-[#FFD700]">
                <p className="text-xs opacity-80">
                  All Movie & Show Data is from https://www.themoviedb.org
                </p>
              </div>
            </footer>
          </div>
        </main>
      </>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-righteous text-center mb-6 sm:mb-8 animate-glow">
          <span className="text-[#FF4081]">Cine</span>
          <span className="text-[#FFD700]">Spin</span> 🎬
        </h1>
        <p className="text-center text-lg sm:text-xl text-[#FFD700] mb-8 sm:mb-12 font-righteous">
          Discover your next favorite movie or TV show!
        </p>

        <div className="max-w-lg mx-auto bg-[#2a2a2a]/50 border border-[#FF4081] rounded-lg mb-8 sm:mb-12 shadow-lg overflow-hidden">
          <button 
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex justify-between items-center p-4 text-left text-[#FFD700] font-righteous focus:outline-none"
          >
            <span>🤔 How this works?</span>
            {showExplanation ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {showExplanation && (
            <div className="p-4 pt-0">
              <p className="text-sm sm:text-base text-[#FFD700]">
                Tired of endless searching? CineSpin finds you a random movie or TV show based on your preferences without spoiling you with choices.
              </p>
            </div>
          )}
        </div>

        {noResultsFound && (
          <div className="max-w-lg mx-auto mb-8 p-4 bg-[#4a4a4a] border border-[#FF4081] rounded-lg text-center text-[#FFD700] flex items-center justify-center gap-2 shadow-md">
             <FaExclamationCircle className="text-[#FF4081]" />
            <span>No movies/shows found matching your criteria. Please adjust the filters and try again!</span>
          </div>
        )}

        <MoviePreferencesForm onSubmit={handleSubmit} initialPreferences={currentPreferences || undefined} />

        <footer className="mt-8 sm:mt-12 text-center space-y-4">
          <p className="text-[#FFD700]">
            Created by{' '}
            <a
              href="https://sanjaybalaji.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[#FFC107] transition-colors duration-200"
            >
              Sanjay Balaji
            </a>
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-[#FFD700]">
            <p className="text-xs opacity-80">
              All Movie & Show Data is from https://www.themoviedb.org
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
