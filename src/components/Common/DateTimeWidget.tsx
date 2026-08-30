import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface DateTimeWidgetProps {
  variant?: 'header' | 'player' | 'compact' | 'badge';
  className?: string;
  showSeconds?: boolean;
}

export const DateTimeWidget: React.FC<DateTimeWidgetProps> = ({
  variant = 'header',
  className = '',
  showSeconds = true,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    // Update every second to keep the clock synchronized
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format date in Spanish
  const dateFormatted = currentDate.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const fullDateFormatted = currentDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Time format
  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  const seconds = currentDate.getSeconds().toString().padStart(2, '0');

  // Player OSD variant (sleek glass pill for video overlay)
  if (variant === 'player') {
    return (
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-zinc-200 shadow-lg ${className}`}
        title={`Fecha local: ${fullDateFormatted}`}
      >
        <div className="flex items-center gap-1 text-[10px] text-indigo-300 font-semibold capitalize">
          <Calendar className="w-3 h-3 text-indigo-400" />
          <span>{dateFormatted}</span>
        </div>
        <span className="text-zinc-600 text-xs">|</span>
        <div className="flex items-center gap-1 font-mono font-bold text-xs text-white tracking-wider">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>
            {hours}:{minutes}
            {showSeconds && <span className="text-[10px] text-zinc-400">:{seconds}</span>}
          </span>
        </div>
      </div>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div
        className={`flex items-center gap-1.5 text-xs text-zinc-300 font-medium ${className}`}
        title={fullDateFormatted}
      >
        <Clock className="w-3.5 h-3.5 text-indigo-400" />
        <span className="capitalize">{dateFormatted}</span>
        <span className="font-mono font-bold text-white">
          {hours}:{minutes}
        </span>
      </div>
    );
  }

  // Badge variant
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs ${className}`}
      >
        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
        <span className="capitalize text-zinc-300">{dateFormatted}</span>
        <span className="w-1 h-1 rounded-full bg-zinc-600" />
        <span className="font-mono font-bold text-white">
          {hours}:{minutes}:{seconds}
        </span>
      </div>
    );
  }

  // Default Header variant: high-end TV style
  return (
    <div
      className={`hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800/90 shadow-sm backdrop-blur-sm select-none ${className}`}
      title={`Fecha completa: ${fullDateFormatted}`}
    >
      <div className="flex flex-col items-end leading-none">
        <span className="text-[10px] text-zinc-400 font-medium capitalize tracking-tight flex items-center gap-1">
          <Calendar className="w-2.5 h-2.5 text-indigo-400" />
          {dateFormatted}
        </span>
        <div className="flex items-center gap-1 font-mono font-black text-sm text-white tracking-widest mt-0.5">
          <span>{hours}</span>
          <span className="animate-pulse text-indigo-400">:</span>
          <span>{minutes}</span>
          {showSeconds && (
            <span className="text-[11px] font-bold text-zinc-400">:{seconds}</span>
          )}
        </div>
      </div>
    </div>
  );
};
