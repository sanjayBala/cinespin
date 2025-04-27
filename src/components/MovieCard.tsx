'use client';

import { MediaItem } from '@/lib/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { useState } from 'react';
import { FaHeart, FaRegHeart, FaCheck, FaStar } from 'react-icons/fa';

interface Props {
  movie: MediaItem;
  onToggleWatched?: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  isWatched?: boolean;
  isFavorite?: boolean;
}

export default function MovieCard({
  movie,
  onToggleWatched,
  onToggleFavorite,
  isWatched = false,
  isFavorite = false,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;

  return (
    <div
      className="relative bg-[#2a2a2a] rounded-lg shadow-xl overflow-hidden transition-transform duration-200 hover:scale-105 border-2 border-[#FFD700]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3]">
        <img
          src={getImageUrl(movie.poster_path)}
          alt={title}
          className="w-full h-full object-cover"
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-90 p-4 text-white overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2 text-[#FFD700]">{title}</h3>
            <p className="text-sm mb-2 text-gray-300">{movie.overview}</p>
            <div className="flex items-center gap-2 text-[#FFD700]">
              <FaStar />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold truncate text-[#FFD700]">{title}</h3>
          <span className="text-sm text-[#FF4081]">
            {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
          </span>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaStar className="text-[#FFD700]" />
            <span className="text-white">{movie.vote_average.toFixed(1)}</span>
          </div>

          <div className="flex gap-2">
            {onToggleWatched && (
              <button
                onClick={() => onToggleWatched(movie.id)}
                className={`p-2 rounded-full transition-colors ${
                  isWatched
                    ? 'bg-[#FFD700] text-[#1a1a1a]'
                    : 'bg-[#3a3a3a] text-[#FFD700] hover:bg-[#4a4a4a]'
                }`}
              >
                <FaCheck />
              </button>
            )}

            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(movie.id)}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite
                    ? 'bg-[#FF4081] text-white'
                    : 'bg-[#3a3a3a] text-[#FF4081] hover:bg-[#4a4a4a]'
                }`}
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 