import { FaFilm } from 'react-icons/fa';

interface LoadingSpinnerProps {
  size?: 'full' | 'small' | 'medium';
}

export default function LoadingSpinner({ size = 'full' }: LoadingSpinnerProps) {
  const isSmall = size === 'small';
  const isMedium = size === 'medium';
  
  return (
    <div className={`fixed inset-0 bg-[#1a1a1a]/90 backdrop-blur-sm z-50 flex items-center justify-center ${
      isSmall ? 'bg-opacity-70' : isMedium ? 'bg-opacity-80' : ''
    }`}>
      <div className={`bg-[#2a2a2a] rounded-2xl ${
        isSmall ? 'p-6 scale-50' : isMedium ? 'p-8 scale-75' : 'p-12'
      } shadow-2xl border-2 border-[#FFD700] border-dashed`}>
        <div className={`animate-spin ${
          isSmall ? 'text-5xl' : isMedium ? 'text-6xl' : 'text-8xl'
        } text-[#FFD700] mb-6`}>
          <FaFilm />
        </div>
        <div className="space-y-2 text-center">
          <p className={`${
            isSmall ? 'text-xl' : isMedium ? 'text-xl' : 'text-2xl'
          } font-righteous text-[#FFD700] animate-pulse`}>
            🎬 Searching the film universe...
          </p>
          <p className={`${
            isSmall ? 'text-base' : isMedium ? 'text-base' : 'text-lg'
          } text-[#FF4081]`}>Hang tight!</p>
        </div>
      </div>
    </div>
  );
} 