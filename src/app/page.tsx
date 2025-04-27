'use client';

import { useState } from 'react';
import MoviePreferencesForm from '@/components/MoviePreferencesForm';
import { MediaPreferencesFilter, discoverMedia, MediaItem } from '@/lib/tmdb';
import { FaSpinner, FaArrowLeft, FaHome, FaSearch } from 'react-icons/fa';
import MovieCard from '@/components/MovieCard';
import Image from 'next/image';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<MediaItem | null>(null);
  const [currentPreferences, setCurrentPreferences] = useState<MediaPreferencesFilter | null>(null);

  const handleSubmit = async (preferences: MediaPreferencesFilter) => {
    setLoading(true);
    setRecommendation(null);
    setCurrentPreferences(preferences);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const result = await response.json();
      setRecommendation(result);
    } catch (error) {
      console.error('Error:', error);
      setRecommendation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAgain = async () => {
    if (currentPreferences) {
      await handleSubmit(currentPreferences);
    }
  };

  const handleGoHome = () => {
    setRecommendation(null);
    setCurrentPreferences(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-[#FFD700] mx-auto mb-4" />
          <p className="text-[#FFD700] text-xl font-righteous">Finding the perfect match...</p>
        </div>
      </main>
    );
  }

  if (recommendation) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 text-[#FFD700] hover:text-[#FF4081] transition-colors mb-8 font-righteous"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </button>
          
          <h2 className="text-3xl md:text-4xl font-righteous text-center mb-8 text-[#FFD700]">
            🎬 Your Recommended {recommendation.title ? 'Movie' : 'TV Show'}
          </h2>

          <div className="max-w-[350px] mx-auto">
            <MovieCard movie={recommendation} />
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleSearchAgain}
              className="px-8 py-3 bg-[#FF4081] text-white rounded-lg font-righteous text-lg tracking-wider hover:bg-[#F50057] transform transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <FaSearch />
              <span>Search Again</span>
            </button>
            <button
              onClick={handleGoHome}
              className="px-8 py-3 bg-[#FFD700] text-[#1a1a1a] rounded-lg font-righteous text-lg tracking-wider hover:bg-[#FFC107] transform transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <FaHome />
              <span>Home</span>
            </button>
          </div>

          <footer className="mt-12 text-center space-y-4">
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
                This app uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
          </footer>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-righteous text-center mb-8 animate-glow">
          <span className="text-[#FF4081]">Cine</span>
          <span className="text-[#FFD700]">Spin</span> 🎬
        </h1>
        <p className="text-center text-xl text-[#FFD700] mb-12 font-righteous">
          Discover your next favorite movie or TV show!
        </p>

        <MoviePreferencesForm onSubmit={handleSubmit} initialPreferences={currentPreferences || undefined} />

        <footer className="mt-12 text-center space-y-4">
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
              This product uses the TMDB API to fetch all movie / tv show data.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
