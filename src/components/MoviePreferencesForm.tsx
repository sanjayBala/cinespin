'use client';

import { useState } from 'react';
import { MediaPreferencesFilter } from '@/lib/tmdb';
import { FaChevronDown, FaChevronUp, FaFilm, FaTv } from 'react-icons/fa';

const MOVIE_GENRES = [
  { id: 28, name: 'Action', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 12, name: 'Adventure', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 16, name: 'Animation', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 35, name: 'Comedy', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 80, name: 'Crime', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 99, name: 'Documentary', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 18, name: 'Drama', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 10751, name: 'Family', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 14, name: 'Fantasy', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 36, name: 'History', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 27, name: 'Horror', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 10402, name: 'Music', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 9648, name: 'Mystery', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 10749, name: 'Romance', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 878, name: 'Science Fiction', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 53, name: 'Thriller', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 10752, name: 'War', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 37, name: 'Western', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
];

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 16, name: 'Animation', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 35, name: 'Comedy', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 80, name: 'Crime', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 99, name: 'Documentary', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 18, name: 'Drama', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 10751, name: 'Family', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 10762, name: 'Kids', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 9648, name: 'Mystery', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 10763, name: 'News', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 10764, name: 'Reality', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 10765, name: 'Sci-Fi & Fantasy', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 10766, name: 'Soap', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
  { id: 10767, name: 'Talk', color: 'bg-[#FF4081] hover:bg-[#F50057] text-white' },
  { id: 10768, name: 'War & Politics', color: 'bg-[#FFD700] hover:bg-[#FFC107] text-[#1a1a1a]' },
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

interface Props {
  onSubmit: (preferences: MediaPreferencesFilter) => void;
  initialPreferences?: MediaPreferencesFilter;
}

export default function MoviePreferencesForm({ onSubmit, initialPreferences }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [preferences, setPreferences] = useState<MediaPreferencesFilter>(
    initialPreferences || {
      mediaType: 'movie',
      genres: [],
      yearStart: 1990,
      yearEnd: new Date().getFullYear(),
      language: 'en',
      minRating: 7,
      maxRating: 10,
      minPopularity: 10,
      includeAdult: false,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  const currentGenres = preferences.mediaType === 'movie' ? MOVIE_GENRES : TV_GENRES;
  const displayGenres = showAllGenres ? currentGenres : currentGenres.slice(0, 8);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4 sm:p-8 bg-[#2a2a2a] rounded-xl shadow-2xl border-2 border-[#FFD700] border-dashed">
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          type="button"
          onClick={() => setPreferences(prev => ({ ...prev, mediaType: 'movie', genres: [] }))}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-righteous text-lg transition-all duration-200 ${
            preferences.mediaType === 'movie'
              ? 'bg-[#FFD700] text-[#1a1a1a]'
              : 'bg-[#3a3a3a] text-[#FFD700] hover:bg-[#4a4a4a]'
          }`}
        >
          <FaFilm />
          Movies
        </button>
        <button
          type="button"
          onClick={() => setPreferences(prev => ({ ...prev, mediaType: 'tv', genres: [] }))}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-righteous text-lg transition-all duration-200 ${
            preferences.mediaType === 'tv'
              ? 'bg-[#FFD700] text-[#1a1a1a]'
              : 'bg-[#3a3a3a] text-[#FFD700] hover:bg-[#4a4a4a]'
          }`}
        >
          <FaTv />
          TV Series
        </button>
      </div>

      <div>
        <label className="block text-xl font-righteous text-[#FFD700] mb-4">
          🎭 Pick Your {preferences.mediaType === 'movie' ? 'Movie' : 'TV'} Genres
        </label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayGenres.map((genre) => (
            <label
              key={genre.id}
              className={`${
                preferences.genres?.includes(genre.id)
                  ? genre.color
                  : 'bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#FFD700]'
              } cursor-pointer rounded-lg p-3 transition-all duration-200 transform hover:scale-105 font-medium tracking-wide text-center`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={preferences.genres?.includes(genre.id)}
                onChange={(e) => {
                  const newGenres = e.target.checked
                    ? [...(preferences.genres || []), genre.id]
                    : preferences.genres?.filter((id) => id !== genre.id);
                  setPreferences({ ...preferences, genres: newGenres });
                }}
              />
              <span>{genre.name}</span>
            </label>
          ))}
        </div>
        {currentGenres.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllGenres(!showAllGenres)}
            className="mt-4 w-full py-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#FFD700] rounded-lg font-medium tracking-wide text-center transition-all duration-200"
          >
            {showAllGenres ? '▲ Show Less' : '▼ Show More'}
          </button>
        )}
      </div>

      <div>
        <label className="block text-xl font-righteous text-[#FFD700] mb-4">🌍 Find Movies in This Language (with English Display)</label>
        <select
          value={preferences.language}
          onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
          className="w-full rounded-lg bg-[#3a3a3a] text-white border-2 border-[#FFD700] py-3 px-4 focus:ring-2 focus:ring-[#FF4081] focus:border-[#FF4081]"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t-2 border-[#FFD700] border-dashed pt-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-[#FFD700] hover:text-[#FF4081] transition-colors font-righteous"
        >
          {showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
          <span>⚙️ Advanced Settings</span>
        </button>

        {showAdvanced && (
          <div className="mt-6 space-y-6 bg-[#3a3a3a] p-4 sm:p-6 rounded-lg border border-[#FFD700]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-righteous text-[#FFD700] mb-3">📅 Year Range</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={preferences.yearStart}
                    onChange={(e) =>
                      setPreferences({ ...preferences, yearStart: parseInt(e.target.value) })
                    }
                    className="w-full rounded-lg bg-[#2a2a2a] text-white border-2 border-[#FFD700] focus:ring-2 focus:ring-[#FF4081] focus:border-[#FF4081] px-3 py-2"
                  />
                  <span className="text-[#FF4081]">to</span>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={preferences.yearEnd}
                    onChange={(e) =>
                      setPreferences({ ...preferences, yearEnd: parseInt(e.target.value) })
                    }
                    className="w-full rounded-lg bg-[#2a2a2a] text-white border-2 border-[#FFD700] focus:ring-2 focus:ring-[#FF4081] focus:border-[#FF4081] px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-righteous text-[#FFD700] mb-3">⭐ Rating Range</label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={preferences.minRating}
                    onChange={(e) =>
                      setPreferences({ ...preferences, minRating: parseFloat(e.target.value) })
                    }
                    className="w-full rounded-lg bg-[#2a2a2a] text-white border-2 border-[#FFD700] focus:ring-2 focus:ring-[#FF4081] focus:border-[#FF4081]"
                  />
                  <span className="text-[#FF4081]">to</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={preferences.maxRating}
                    onChange={(e) =>
                      setPreferences({ ...preferences, maxRating: parseFloat(e.target.value) })
                    }
                    className="w-full rounded-lg bg-[#2a2a2a] text-white border-2 border-[#FFD700] focus:ring-2 focus:ring-[#FF4081] focus:border-[#FF4081]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-righteous text-[#FFD700] mb-3">
                  🌟 Minimum Popularity
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={preferences.minPopularity}
                  onChange={(e) =>
                    setPreferences({ ...preferences, minPopularity: parseFloat(e.target.value) })
                  }
                  className="w-full rounded-lg bg-[#2a2a2a] text-white border-2 border-[#FFD700] focus:ring-2 focus:ring-[#FF4081] focus:border-[#FF4081]"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.includeAdult}
                    onChange={(e) =>
                      setPreferences({ ...preferences, includeAdult: e.target.checked })
                    }
                    className="rounded bg-[#2a2a2a] text-[#FF4081] border-2 border-[#FFD700] focus:ring-2 focus:ring-[#FF4081]"
                  />
                  <span className="text-lg font-righteous text-[#FFD700]">🔞 Include Adult Content</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          className="px-12 py-4 bg-[#FF69B4] text-white rounded-lg font-righteous text-xl tracking-wider hover:bg-[#FF1493] transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FF4081] focus:ring-offset-2 focus:ring-offset-[#2a2a2a]"
        >
          🎬 Pick Your {preferences.mediaType === 'movie' ? 'Movie' : 'TV Show'}!
        </button>
      </div>
    </form>
  );
} 