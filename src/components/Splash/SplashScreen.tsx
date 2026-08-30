import React, { useEffect, useState } from 'react';
import { PerformanceProfile } from '../../types/iptv';
import { Tv } from 'lucide-react';

interface SplashScreenProps {
  performanceMode: PerformanceProfile;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  performanceMode = 'medium',
  onFinish,
}) => {
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Listen for any key or click to dismiss immediately
    const handleDismiss = () => {
      onFinish();
    };

    window.addEventListener('keydown', handleDismiss, { passive: true });
    window.addEventListener('click', handleDismiss, { passive: true });
    window.addEventListener('touchstart', handleDismiss, { passive: true });

    let tFade: NodeJS.Timeout;
    let tFinish: NodeJS.Timeout;

    if (performanceMode === 'potato') {
      tFinish = setTimeout(onFinish, 100);
    } else if (performanceMode === 'low') {
      tFinish = setTimeout(onFinish, 500);
    } else {
      // Medium / High: Quick and smooth 900ms intro
      tFade = setTimeout(() => setIsFadingOut(true), 750);
      tFinish = setTimeout(onFinish, 1000);
    }

    return () => {
      window.removeEventListener('keydown', handleDismiss);
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('touchstart', handleDismiss);
      clearTimeout(tFade);
      clearTimeout(tFinish);
    };
  }, [performanceMode, onFinish]);

  return (
    <div
      onClick={onFinish}
      className={`fixed inset-0 z-50 w-full h-full min-w-full min-h-full bg-zinc-950 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        width: '100%',
        height: '100%',
        minWidth: '100%',
        minHeight: '100%',
        backgroundColor: '#09090b',
        outline: 'none',
        border: 'none',
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl opacity-60" />
      </div>

      <div className="relative flex flex-col items-center z-10 px-4 max-w-sm text-center">
        {/* Logo Card */}
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-black border border-indigo-500/40 shadow-2xl p-1 mb-4 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Codigo Master IPTV"
            className="w-full h-full object-cover rounded-2xl"
            loading="eager"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
          CODIGO MASTER
        </h1>

        <div className="flex items-center justify-center gap-2 mt-1 mb-4">
          <div className="h-px w-6 bg-indigo-500/50" />
          <span className="text-[11px] sm:text-xs font-black tracking-[0.25em] text-indigo-400 uppercase">
            IPTV PLAYER
          </span>
          <div className="h-px w-6 bg-indigo-500/50" />
        </div>

        {/* Loading Progress Bar */}
        <div className="w-32 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative mb-3">
          <div className="w-full h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 animate-pulse" />
        </div>

        <p className="text-[10px] text-zinc-500">
          {performanceMode === 'potato'
            ? '🥔 Modo Patata 500MB'
            : 'Presiona OK o pulsa para continuar'}
        </p>
      </div>

      {/* Bottom Hint for TV */}
      <div className="absolute bottom-4 sm:bottom-6 text-[10px] text-zinc-600 flex items-center gap-1.5">
        <Tv className="w-3 h-3 text-zinc-500" />
        <span>Listo para Smart TV & Android TV</span>
      </div>
    </div>
  );
};

