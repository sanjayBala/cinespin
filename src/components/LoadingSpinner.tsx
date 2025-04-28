import { FaFilm } from 'react-icons/fa';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-[#1a1a1a]/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#2a2a2a] rounded-2xl p-12 shadow-2xl border-2 border-[#FFD700] border-dashed">
        <div className="animate-spin text-8xl text-[#FFD700] mb-6">
          <FaFilm />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-2xl font-righteous text-[#FFD700] animate-pulse">
            🎬 Searching the multiverse...
          </p>
          <p className="text-lg text-[#FF4081]">Finding your perfect feature</p>
        </div>
      </div>
    </div>
  );
} 