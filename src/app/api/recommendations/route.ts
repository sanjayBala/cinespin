import { NextResponse } from 'next/server';
import { MediaPreferencesFilter, discoverMedia } from '@/lib/tmdb';
import logger, { requestLogger } from '@/lib/logger';

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

    // Use a more unique randomization for small result sets
    // This helps avoid recommending the same movie repeatedly
    let recommendation;
    
    if (media.length === 1) {
      // Only one result, so use it
      recommendation = media[0];
    } else if (media.length <= 5) {
      // For small result sets, use timestamp to vary results
      const timestamp = new Date().getTime();
      const index = timestamp % media.length;
      recommendation = media[index];
    } else {
      // For larger result sets, use proper randomization
      const randomIndex = Math.floor(Math.random() * media.length);
      recommendation = media[randomIndex];
    }

    logger.info('Recommendation found', {
      movieId: recommendation.id,
      title: recommendation.title || recommendation.name,
      totalResults,
      totalFetched: media.length
    });

    reqLogger.end(200);
    return NextResponse.json(recommendation);
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