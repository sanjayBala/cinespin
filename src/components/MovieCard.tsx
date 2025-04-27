'use client';

import { MediaItem } from '@/lib/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { useState } from 'react';
import { FaHeart, FaRegHeart, FaCheck, FaStar } from 'react-icons/fa';
import Image from 'next/image';

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
      onClick={() => setIsHovered(!isHovered)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3]">
        <Image
          src={getImageUrl(movie.poster_path)}
          alt={title || 'Movie Poster'}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 640px) 100vw, 350px"
          priority={true}
        />
        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-90 p-3 sm:p-4 text-white overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-[#FFD700]">{title}</h3>
            <p className="text-xs sm:text-sm mb-2 text-gray-300">{movie.overview}</p>
            <div className="flex items-center gap-2 text-[#FFD700] text-sm">
              <FaStar />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-base sm:text-lg font-semibold truncate text-[#FFD700] flex-1">{title}</h3>
          <span className="text-xs sm:text-sm text-[#FF4081] ml-2">
            {releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'}
          </span>
        </div>

        <div className="mt-3 sm:mt-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaStar className="text-[#FFD700] text-sm sm:text-base" />
            <span className="text-white text-sm sm:text-base">{movie.vote_average.toFixed(1)}</span>
          </div>

          <div className="flex gap-2">
            {onToggleWatched && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWatched(movie.id);
                }}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                  isWatched
                    ? 'bg-[#FFD700] text-[#1a1a1a]'
                    : 'bg-[#3a3a3a] text-[#FFD700] hover:bg-[#4a4a4a]'
                }`}
              >
                <FaCheck className="text-sm sm:text-base" />
              </button>
            )}

            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(movie.id);
                }}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                  isFavorite
                    ? 'bg-[#FF4081] text-white'
                    : 'bg-[#3a3a3a] text-[#FF4081] hover:bg-[#4a4a4a]'
                }`}
              >
                {isFavorite ? <FaHeart className="text-sm sm:text-base" /> : <FaRegHeart className="text-sm sm:text-base" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 