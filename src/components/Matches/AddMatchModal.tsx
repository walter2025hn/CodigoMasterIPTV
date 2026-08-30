import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Trash2,
  Tv,
  Calendar,
  Clock,
  MapPin,
  Activity,
  Flame,
  Radio,
} from 'lucide-react';
import { ChannelItem, MatchChannel, SportType, SportsMatch } from '../../types/iptv';

interface AddMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMatch: (match: SportsMatch) => void;
  availableChannels: ChannelItem[];
}

export const AddMatchModal: React.FC<AddMatchModalProps> = ({
  isOpen,
  onClose,
  onSaveMatch,
  availableChannels,
}) => {
  const [sport, setSport] = useState<SportType>('football');
  const [tournament, setTournament] = useState<string>('');
  const [homeTeam, setHomeTeam] = useState<string>('');
  const [awayTeam, setAwayTeam] = useState<string>('');
  const [date, setDate] = useState<string>('Hoy');
  const [time, setTime] = useState<string>('20:00');
  const [status, setStatus] = useState<'live' | 'upcoming'>('upcoming');
  const [stadiumOrLocation, setStadiumOrLocation] = useState<string>('');
  const [score, setScore] = useState<string>('');
  const [liveMinute, setLiveMinute] = useState<string>('');
  const [isHot, setIsHot] = useState<boolean>(false);

  // Channels list for this match
  const [channels, setChannels] = useState<MatchChannel[]>([
    { name: 'ESPN', quality: 'FHD', language: 'Español' },
  ]);

  // Channel input state
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [selectedPlaylistChannel, setSelectedPlaylistChannel] = useState<string>('');

  if (!isOpen) return null;

  const handleAddChannel = () => {
    if (selectedPlaylistChannel) {
      const found = availableChannels.find((c) => c.id === selectedPlaylistChannel);
      if (found) {
        setChannels((prev) => [
          ...prev,
          {
            name: found.name,
            quality: 'HD',
            language: 'Español',
            channelId: found.id,
            customUrl: found.url,
          },
        ]);
        setSelectedPlaylistChannel('');
        return;
      }
    }

    if (newChannelName.trim()) {
      setChannels((prev) => [
        ...prev,
        {
          name: newChannelName.trim(),
          quality: 'HD',
          language: 'Español',
        },
      ]);
      setNewChannelName('');
    }
  };

  const handleRemoveChannel = (index: number) => {
    setChannels((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !tournament.trim()) return;

    const newMatch: SportsMatch = {
      id: `match-custom-${Date.now()}`,
      sport,
      tournament: tournament.trim(),
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim() || undefined,
      status,
      date: date.trim() || 'Hoy',
      time: time.trim() || '20:00',
      timestamp: Date.now(),
      stadiumOrLocation: stadiumOrLocation.trim() || undefined,
      score: score.trim() || undefined,
      liveMinute: liveMinute.trim() || undefined,
      isHot,
      channels: channels.length > 0 ? channels : [{ name: 'Transmisión en Vivo', quality: 'HD' }],
    };

    onSaveMatch(newMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Top Gradient Banner */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />

        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Añadir Nuevo Partido / Evento
              </h3>
              <p className="text-xs text-zinc-400">
                Programa el encuentro y los canales donde se transmitirá
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Deporte y Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Deporte
              </label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="football">⚽ Fútbol</option>
                <option value="motor">🏎️ Motor / F1</option>
                <option value="basketball">🏀 Baloncesto</option>
                <option value="combat">🥊 UFC / Boxeo</option>
                <option value="tennis">🎾 Tenis</option>
                <option value="other">🏆 Otro Deporte</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Estado del Partido
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'live' | 'upcoming')}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="upcoming">⏳ Próximo / Por Jugar</option>
                <option value="live">🔴 En Vivo Ahora</option>
              </select>
            </div>
          </div>

          {/* Torneo / Competición */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Torneo / Liga <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. UEFA Champions League, LaLiga, Premier League, F1"
              value={tournament}
              onChange={(e) => setTournament(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Equipos / Rivales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Equipo Local / Evento <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Real Madrid"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Equipo Visitante (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Barcelona"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Fecha, Hora y Estadio */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Fecha
              </label>
              <input
                type="text"
                placeholder="Hoy, Mañana..."
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Hora
              </label>
              <input
                type="text"
                placeholder="20:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Estadio / Sede
              </label>
              <input
                type="text"
                placeholder="Bernabéu..."
                value={stadiumOrLocation}
                onChange={(e) => setStadiumOrLocation(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Si está en vivo: Marcador y Minuto */}
          {status === 'live' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <div>
                <label className="block text-[11px] font-semibold text-rose-300 mb-1">
                  Marcador Actual
                </label>
                <input
                  type="text"
                  placeholder="Ej. 2 - 1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full bg-zinc-950 border border-rose-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-rose-300 mb-1">
                  Minuto / Tiempo
                </label>
                <input
                  type="text"
                  placeholder="Ej. 65' o 2T"
                  value={liveMinute}
                  onChange={(e) => setLiveMinute(e.target.value)}
                  className="w-full bg-zinc-950 border border-rose-500/30 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Canales de Transmisión */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                <span>Canales de Transmisión</span>
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                {channels.length} canales
              </span>
            </div>

            {/* Existing Channels List */}
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {channels.map((ch, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-white">{ch.name}</span>
                    {ch.quality && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300">
                        {ch.quality}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveChannel(idx)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Channel Controls */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {availableChannels.length > 0 && (
                <select
                  value={selectedPlaylistChannel}
                  onChange={(e) => setSelectedPlaylistChannel(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 truncate"
                >
                  <option value="">Seleccionar de tus canales...</option>
                  {availableChannels.slice(0, 100).map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  placeholder="O escribe nombre (ej. ESPN 2)"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddChannel}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Destacado / Hot match toggle */}
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isHot}
              onChange={(e) => setIsHot(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-700 text-rose-500 focus:ring-rose-500"
            />
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Marcar como Partido Destacado / Clásico</span>
          </label>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Guardar Partido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
