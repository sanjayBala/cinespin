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

    // Pick a random result from the first page
    const randomIndex = Math.floor(Math.random() * media.length);
    const recommendation = media[randomIndex];

    logger.info('Recommendation found', {
      movieId: recommendation.id,
      title: recommendation.title || recommendation.name,
      totalResults
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