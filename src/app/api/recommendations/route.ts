import { NextResponse } from 'next/server';
import { MediaPreferencesFilter, discoverMedia } from '@/lib/tmdb';
import logger, { requestLogger } from '@/lib/logger';

// Keep track of recently returned recommendations to avoid repeating them too often
const RECENT_RECOMMENDATIONS_KEY = 'recent_recommendations';
const MAX_RECENT_RECOMMENDATIONS = 10;

export async function POST(request: Request) {
  const reqLogger = requestLogger(request);
  
  try {
    const preferences: MediaPreferencesFilter = await request.json();
    logger.info('Fetching recommendations', { preferences });

    const { media, totalResults } = await discoverMedia(preferences);

    if (!media || media.length === 0) {
      logger.warn('No recommendations found', { preferences });
      reqLogger.end(404);
      return NextResponse.json(
        { error: 'No recommendations found matching your preferences' },
        { status: 404 }
      );
    }

    // Load recent recommendations (server-side memory to prevent repeats within same process)
    let recentRecommendations: number[] = [];
    try {
      // @ts-expect-error - Use global namespace for server-side memory
      if (global[RECENT_RECOMMENDATIONS_KEY]) {
        // @ts-expect-error - Use global namespace for server-side memory
        recentRecommendations = global[RECENT_RECOMMENDATIONS_KEY];
      }
    } catch {
      // Ignore errors with server memory
    }

    // Use a more unique randomization strategy with memory
    let recommendation;
    
    // First, build a list of candidates that haven't been recently shown
    const candidates = media.filter(item => !recentRecommendations.includes(item.id));
    
    if (candidates.length > 0) {
      // We have fresh candidates, use them
      if (candidates.length === 1) {
        recommendation = candidates[0];
      } else {
        // For multiple candidates, use proper randomization
        const randomIndex = Math.floor(Math.random() * candidates.length);
        recommendation = candidates[randomIndex];
      }
    } else if (media.length === 1) {
      // Only one result available (and was recently shown), so use it
      recommendation = media[0];
    } else {
      // All available movies were recently shown, select randomly but try to
      // avoid the most recently shown ones
      // Sort by least recently shown
      const sortedMedia = [...media].sort((a, b) => {
        const aIndex = recentRecommendations.indexOf(a.id);
        const bIndex = recentRecommendations.indexOf(b.id);
        // If not in history, rank highest
        if (aIndex === -1) return -1;
        if (bIndex === -1) return 1;
        // Otherwise sort by least recently shown
        return aIndex - bIndex;
      });
      
      // Take the 50% least recently shown items
      const lessRecentItems = sortedMedia.slice(0, Math.ceil(sortedMedia.length / 2));
      const randomIndex = Math.floor(Math.random() * lessRecentItems.length);
      recommendation = lessRecentItems[randomIndex];
    }

    // Update recent recommendations list
    if (recommendation) {
      // Add to front of array (most recent)
      recentRecommendations.unshift(recommendation.id);
      // Keep list to max size
      recentRecommendations = recentRecommendations.slice(0, MAX_RECENT_RECOMMENDATIONS);
      
      // Save back to global
      try {
        // @ts-expect-error - Use global namespace for server-side memory
        global[RECENT_RECOMMENDATIONS_KEY] = recentRecommendations;
      } catch {
        // Ignore errors with server memory
      }
    }

    logger.info('Recommendation found', {
      movieId: recommendation.id,
      title: recommendation.title || recommendation.name,
      totalResults,
      totalFetched: media.length
    });

    reqLogger.end(200);
    return NextResponse.json({
      movie: recommendation,
      totalCount: media.length
    });
  } catch (error) {
    logger.error('Error in recommendations API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    reqLogger.end(500);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
} 