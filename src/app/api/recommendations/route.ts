import { NextResponse } from 'next/server';
import { MediaPreferencesFilter, discoverMedia } from '@/lib/tmdb';

export async function POST(request: Request) {
  try {
    const preferences: MediaPreferencesFilter = await request.json();
    const { media, totalResults } = await discoverMedia(preferences);

    if (!media || media.length === 0) {
      return NextResponse.json(
        { error: 'No recommendations found matching your preferences' },
        { status: 404 }
      );
    }

    // Pick a random result from the first page
    const randomIndex = Math.floor(Math.random() * media.length);
    const recommendation = media[randomIndex];

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Error in recommendations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
} 