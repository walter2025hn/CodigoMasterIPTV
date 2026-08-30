import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PerformanceProfile } from '../../types/iptv';
import { Zap, Tv, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  performanceMode: PerformanceProfile;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  performanceMode = 'medium',
  onFinish,
}) => {
  const [stage, setStage] = useState<'enter' | 'glow' | 'exit'>('enter');

  useEffect(() => {
    // Dynamic duration based on device power profile
    if (performanceMode === 'low') {
      // Very fast, light on CPU/GPU
      const t = setTimeout(() => {
        onFinish();
      }, 900);
      return () => clearTimeout(t);
    }

    if (performanceMode === 'medium') {
      const t1 = setTimeout(() => setStage('glow'), 400);
      const t2 = setTimeout(() => setStage('exit'), 1300);
      const t3 = setTimeout(() => onFinish(), 1600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }

    // High performance mode (Full cinematic experience)
    const t1 = setTimeout(() => setStage('glow'), 600);
    const t2 = setTimeout(() => setStage('exit'), 2000);
    const t3 = setTimeout(() => onFinish(), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [performanceMode, onFinish]);

  // LOW PERFORMANCE MODE (Minimalist, battery & 1GB RAM friendly)
  if (performanceMode === 'low') {
    return (
      <div
        onClick={onFinish}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      >
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-24 h-24 rounded-2xl overflow-hidden border border-indigo-500/40 bg-zinc-950 p-1 mb-4 shadow-md">
            <img
              src="/logo.png"
              alt="Codigo Master IPTV"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">CODIGO MASTER</h1>
          <span className="text-xs font-bold text-indigo-400 tracking-widest mt-1 uppercase">
            IPTV PLAYER
          </span>
          <p className="text-[10px] text-zinc-500 mt-4">Modo Ahorro de Recursos Activo</p>
        </div>
      </div>
    );
  }

  // MEDIUM & HIGH PERFORMANCE MODES (Rich motion, cyber glow, spring physics)
  return (
    <AnimatePresence>
      {stage !== 'exit' && (
        <motion.div
          key="splash-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: performanceMode === 'high' ? 0.4 : 0.25 }}
          onClick={onFinish}
          className="fixed inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
        >
          {/* Cybernetic Background Glow Effects (Only in High/Medium) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
            <div
              className={`w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-cyan-500/10 blur-[90px] ${
                performanceMode === 'high' ? 'animate-pulse' : ''
              }`}
            />
            {performanceMode === 'high' && (
              <>
                <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
                <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
              </>
            )}
          </div>

          {/* Logo Frame with Spring animation */}
          <motion.div
            initial={{ scale: 0.6, y: 25, opacity: 0 }}
            animate={{
              scale: stage === 'glow' ? 1.03 : 1,
              y: 0,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: performanceMode === 'high' ? 220 : 300,
              damping: 20,
            }}
            className="relative flex flex-col items-center z-10"
          >
            {/* Glowing Border Card */}
            <div className="relative group">
              {performanceMode === 'high' && (
                <motion.div
                  animate={{
                    opacity: [0.4, 0.9, 0.4],
                    scale: [0.98, 1.05, 0.98],
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 rounded-3xl blur-lg opacity-70"
                />
              )}

              <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl md:rounded-3xl overflow-hidden bg-black border-2 border-indigo-500/50 shadow-2xl p-1.5 ring-1 ring-white/20">
                <img
                  src="/logo.png"
                  alt="Codigo Master IPTV"
                  className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                />
              </div>
            </div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-6 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-md">
                  CODIGO MASTER
                </h1>
              </div>

              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-indigo-500" />
                <span className="text-xs md:text-sm font-black tracking-[0.25em] text-indigo-400 uppercase">
                  IPTV PLAYER
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-indigo-500" />
              </div>
            </motion.div>

            {/* Loading Indicator tailored to Mode */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-8 flex flex-col items-center gap-2"
            >
              <div className="w-36 h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    repeat: Infinity,
                    duration: performanceMode === 'high' ? 1.2 : 1,
                    ease: 'linear',
                  }}
                  className="w-1/2 h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 rounded-full"
                />
              </div>

              <span className="text-[10px] text-zinc-500 font-medium">
                {performanceMode === 'high'
                  ? 'Iniciando Motor Alta Definición...'
                  : 'Cargando canales y listas...'}
              </span>
            </motion.div>
          </motion.div>

          {/* Bottom Hint */}
          <div className="absolute bottom-6 text-[10px] text-zinc-600 flex items-center gap-1.5">
            <Tv className="w-3 h-3 text-zinc-500" />
            <span>Toca la pantalla o presiona OK para continuar</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
