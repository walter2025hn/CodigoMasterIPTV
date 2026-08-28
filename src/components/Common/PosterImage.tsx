import React, { useState } from 'react';
import { Film, Clapperboard, Tv } from 'lucide-react';
import { StreamType } from '../../types/iptv';

interface PosterImageProps {
  src?: string;
  alt: string;
  type?: StreamType;
  className?: string;
  year?: string | number;
  category?: string;
}

export const PosterImage: React.FC<PosterImageProps> = ({
  src,
  alt,
  type = 'movie',
  className = 'w-full h-full object-cover',
  year,
  category,
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Derive an aesthetic gradient based on the title string
  const getGradient = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'from-indigo-900 via-slate-900 to-zinc-950',
      'from-purple-900 via-zinc-900 to-neutral-950',
      'from-fuchsia-950 via-slate-900 to-black',
      'from-rose-950 via-zinc-900 to-zinc-950',
      'from-cyan-950 via-slate-900 to-zinc-950',
      'from-blue-950 via-zinc-900 to-zinc-950',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const IconComponent =
    type === 'movie' ? Film : type === 'series' ? Clapperboard : Tv;

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br ${getGradient(
          alt
        )} border border-white/5 flex flex-col justify-between p-3 relative overflow-hidden select-none`}
      >
        {/* Background Decorative Element */}
        <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
          <IconComponent className="w-24 h-24" />
        </div>

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1 z-10">
          <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 backdrop-blur-xs">
            {type === 'movie' ? 'Película' : type === 'series' ? 'Serie' : 'Canal'}
          </span>
          {year && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-amber-300">
              {year}
            </span>
          )}
        </div>

        {/* Center Icon */}
        <div className="flex items-center justify-center my-auto z-10">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
            <IconComponent className="w-5 h-5" />
          </div>
        </div>

        {/* Bottom Title Info */}
        <div className="z-10 mt-auto">
          <p className="text-[11px] font-bold text-white line-clamp-2 leading-tight">
            {alt}
          </p>
          {category && (
            <p className="text-[9px] text-zinc-400 truncate mt-0.5">{category}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-zinc-900 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
          <IconComponent className="w-6 h-6 text-zinc-700" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
