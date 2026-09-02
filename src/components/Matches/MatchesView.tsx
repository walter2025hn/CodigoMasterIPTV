import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy,
  Tv,
  Calendar,
  Clock,
  MapPin,
  Flame,
  Search,
  Plus,
  Play,
  Radio,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Activity,
  ExternalLink,
  ChevronRight,
  Shield,
  Volume2,
  Zap,
  Layers,
  Filter,
} from 'lucide-react';
import { ChannelItem, MatchChannel, SportType, SportsMatch, UserSettings } from '../../types/iptv';
import { StorageService } from '../../services/storageService';
import { EventosService } from '../../services/eventosService';
import { AddMatchModal } from './AddMatchModal';
import { DateTimeWidget } from '../Common/DateTimeWidget';

interface MatchesViewProps {
  channels: ChannelItem[];
  onPlayChannel: (channel: ChannelItem) => void;
  settings: UserSettings;
}

export const MatchesView: React.FC<MatchesViewProps> = ({
  channels,
  onPlayChannel,
  settings,
}) => {
  const [matches, setMatches] = useState<SportsMatch[]>(() => StorageService.getMatches());
  const [selectedSport, setSelectedSport] = useState<SportType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'today' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddMatchModalOpen, setIsAddMatchModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'matches' | 'event_channels'>('event_channels');
  const [selectedEventGroup, setSelectedEventGroup] = useState<string>('all');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Extract all event channels from the loaded playlist
  const eventChannels = useMemo(() => {
    return EventosService.getEventChannels(channels);
  }, [channels]);

  // Extract distinct playlist groups categorized as "Eventos"
  const eventGroupsMap = useMemo(() => {
    return EventosService.getEventGroups(channels);
  }, [channels]);

  const eventGroupNames = useMemo(() => {
    return Object.keys(eventGroupsMap);
  }, [eventGroupsMap]);

  // Automatically sync / import matches from "Eventos Del Día" channels
  useEffect(() => {
    if (channels.length > 0) {
      const extracted = EventosService.extractMatchesFromChannels(channels);
      if (extracted.length > 0) {
        const storedMatches = StorageService.getMatches();
        // Merge extracted matches with stored matches (avoiding duplicates)
        const combined = [...storedMatches];
        extracted.forEach((ext) => {
          const exists = combined.some(
            (m) =>
              m.homeTeam.toLowerCase() === ext.homeTeam.toLowerCase() &&
              (m.awayTeam || '').toLowerCase() === (ext.awayTeam || '').toLowerCase()
          );
          if (!exists) {
            combined.unshift(ext);
          }
        });
        setMatches(combined);
      }
    }
  }, [channels]);

  // Sport category buttons
  const sportsCategories: { id: SportType | 'all'; label: string; icon: string; count: number }[] = [
    { id: 'all', label: 'Todos', icon: '🏆', count: matches.length },
    { id: 'football', label: 'Fútbol', icon: '⚽', count: matches.filter((m) => m.sport === 'football').length },
    { id: 'motor', label: 'Motor / F1', icon: '🏎️', count: matches.filter((m) => m.sport === 'motor').length },
    { id: 'basketball', label: 'Baloncesto', icon: '🏀', count: matches.filter((m) => m.sport === 'basketball').length },
    { id: 'combat', label: 'UFC / Boxeo', icon: '🥊', count: matches.filter((m) => m.sport === 'combat').length },
    { id: 'tennis', label: 'Tenis', icon: '🎾', count: matches.filter((m) => m.sport === 'tennis').length },
  ];

  // Helper to match broadcast channel against user loaded channels
  const findMatchingChannel = (channelName: string): ChannelItem | undefined => {
    if (!channelName || channels.length === 0) return undefined;
    const cleanSearch = channelName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Direct exact or substring match
    const found = channels.find((ch) => {
      const cleanCh = ch.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanCh.includes(cleanSearch) || cleanSearch.includes(cleanCh);
    });

    if (found) return found;

    // 2. Specific keywords search (ESPN, DAZN, FOX, TNT, TUDN, MOVISTAR, DSPORTS, SKY)
    const keywords = ['espn', 'dazn', 'fox', 'tnt', 'tudn', 'movistar', 'dsports', 'directv', 'sky', 'claro', 'vix', 'evento'];
    const matchedKeyword = keywords.find((k) => cleanSearch.includes(k));
    if (matchedKeyword) {
      return channels.find((ch) => ch.name.toLowerCase().includes(matchedKeyword));
    }

    return undefined;
  };

  // Play channel action from match card
  const handleLaunchChannel = (matchChannel: MatchChannel, match: SportsMatch) => {
    if (matchChannel.customUrl) {
      onPlayChannel({
        id: `match-ch-${Date.now()}`,
        name: `${match.homeTeam} vs ${match.awayTeam || ''} (${matchChannel.name})`,
        group: 'Eventos Del Día',
        streamType: 'live',
        url: matchChannel.customUrl,
        sourceId: 'sports-guide',
      });
      return;
    }

    if (matchChannel.channelId) {
      const found = channels.find((c) => c.id === matchChannel.channelId);
      if (found) {
        onPlayChannel(found);
        return;
      }
    }

    const matched = findMatchingChannel(matchChannel.name);
    if (matched) {
      onPlayChannel(matched);
      return;
    }

    const fallbackSports = channels.find(
      (c) =>
        c.group.toLowerCase().includes('evento') ||
        c.group.toLowerCase().includes('deport') ||
        c.group.toLowerCase().includes('sport') ||
        c.name.toLowerCase().includes('sport') ||
        c.name.toLowerCase().includes('deport')
    );

    if (fallbackSports) {
      onPlayChannel({
        ...fallbackSports,
        name: `${matchChannel.name} • ${match.homeTeam} vs ${match.awayTeam || ''}`,
      });
      return;
    }

    if (channels.length > 0) {
      onPlayChannel(channels[0]);
    }
  };

  // Scan & sync "Eventos Del Día" channels manually
  const handleSyncEventos = () => {
    const extracted = EventosService.extractMatchesFromChannels(channels);
    const stored = StorageService.getMatches();
    const merged = [...extracted, ...stored.filter((s) => !extracted.some((e) => e.homeTeam === s.homeTeam))];
    StorageService.saveMatches(merged);
    setMatches(merged);
    setSyncNotice(`¡Sincronizado! Se encontraron ${eventChannels.length} canales en "Eventos Del Día".`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  // Add new match callback
  const handleSaveNewMatch = (newMatch: SportsMatch) => {
    StorageService.addMatch(newMatch);
    setMatches(StorageService.getMatches());
  };

  // Delete match
  const handleDeleteMatch = (e: React.MouseEvent, matchId: string) => {
    e.stopPropagation();
    StorageService.deleteMatch(matchId);
    setMatches(StorageService.getMatches());
  };

  // Reset to default matches
  const handleResetMatches = () => {
    StorageService.resetMatches();
    setMatches(StorageService.getMatches());
  };

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Sport Filter
      if (selectedSport !== 'all' && m.sport !== selectedSport) return false;

      // Status Filter
      if (statusFilter === 'live' && m.status !== 'live') return false;
      if (statusFilter === 'today' && m.date.toLowerCase() !== 'hoy' && m.status !== 'live') return false;
      if (statusFilter === 'upcoming' && m.status !== 'upcoming') return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inHome = m.homeTeam.toLowerCase().includes(q);
        const inAway = m.awayTeam?.toLowerCase().includes(q) || false;
        const inTourn = m.tournament.toLowerCase().includes(q);
        const inStadium = m.stadiumOrLocation?.toLowerCase().includes(q) || false;
        const inChannels = m.channels.some((c) => c.name.toLowerCase().includes(q));
        if (!inHome && !inAway && !inTourn && !inStadium && !inChannels) return false;
      }

      return true;
    });
  }, [matches, selectedSport, statusFilter, searchQuery]);

  // Filtered Event Channels
  const filteredEventChannels = useMemo(() => {
    return eventChannels.filter((ch) => {
      if (selectedEventGroup !== 'all' && ch.group !== selectedEventGroup) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = ch.name.toLowerCase().includes(q);
        const inGroup = ch.group.toLowerCase().includes(q);
        if (!inName && !inGroup) return false;
      }
      return true;
    });
  }, [eventChannels, selectedEventGroup, searchQuery]);

  // Featured Hot Match (Live or most important upcoming)
  const featuredMatch = useMemo(() => {
    return (
      matches.find((m) => m.status === 'live' && m.isHot) ||
      matches.find((m) => m.status === 'live') ||
      matches.find((m) => m.isHot) ||
      matches[0]
    );
  }, [matches]);

  const liveMatchesCount = matches.filter((m) => m.status === 'live').length;
  const todayMatchesCount = matches.filter((m) => m.date.toLowerCase() === 'hoy').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-5">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border border-zinc-800/80 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Partidos y Eventos Del Día
              </h1>
              {eventChannels.length > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  {eventChannels.length} Canales de Eventos
                </span>
              )}
              {liveMatchesCount > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-black uppercase tracking-wider animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {liveMatchesCount} En Vivo
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Búsqueda automática en <span className="text-amber-400 font-bold">Eventos Del Día</span> y transmisión directa de partidos
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <DateTimeWidget variant="compact" className="hidden sm:flex" />

          <button
            onClick={handleSyncEventos}
            className="px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Escanear categorías de Eventos Del Día en tus listas"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin-hover" />
            <span>Sincronizar Eventos Del Día</span>
          </button>

          <button
            onClick={() => setIsAddMatchModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Partido</span>
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncNotice && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* View Switcher: Canales Eventos Del Día vs Cartelera de Partidos */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('event_channels')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
              viewMode === 'event_channels'
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Canales "Eventos Del Día" ({eventChannels.length})</span>
          </button>

          <button
            onClick={() => setViewMode('matches')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
              viewMode === 'matches'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Cartelera de Partidos ({matches.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder={
              viewMode === 'event_channels'
                ? 'Buscar en Eventos Del Día...'
                : 'Buscar equipo, torneo o canal...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* VIEW MODE 1: CANALES DIRECTOS DE "EVENTOS DEL DÍA" */}
      {viewMode === 'event_channels' && (
        <div className="space-y-4">
          {/* Sub-groups Filter (e.g. EVENTOS DEL DÍA, EVENTOS PPV, DEPORTES) */}
          {eventGroupNames.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-1 shrink-0">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Grupos:</span>
              </span>
              <button
                onClick={() => setSelectedEventGroup('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                  selectedEventGroup === 'all'
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Todos los grupos ({eventChannels.length})
              </button>
              {eventGroupNames.map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedEventGroup(grp)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                    selectedEventGroup === grp
                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {grp} ({eventGroupsMap[grp]?.length || 0})
                </button>
              ))}
            </div>
          )}

          {/* Event Channels Grid */}
          {filteredEventChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl text-center">
              <Zap className="w-12 h-12 text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                No se encontraron canales de Eventos Del Día
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mb-4">
                Comprueba si tu lista M3U o Xtream Codes tiene categorías de "Eventos Del Día", "Agenda Deportiva" o canales deportivos en directo.
              </p>
              <button
                onClick={handleSyncEventos}
                className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Escanear Listas Nuevamente
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredEventChannels.map((channel, idx) => {
                const sport = EventosService.detectSport(channel.name);
                const sportIcon =
                  sport === 'football' ? '⚽' : sport === 'motor' ? '🏎️' : sport === 'basketball' ? '🏀' : sport === 'combat' ? '🥊' : '🏆';

                return (
                  <div
                    key={channel.id || idx}
                    tabIndex={0}
                    role="button"
                    onClick={() => onPlayChannel(channel)}
                    onFocus={(e) => {
                      e.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onPlayChannel(channel);
                      }
                    }}
                    className="bg-zinc-900/90 hover:bg-zinc-850 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 border border-zinc-800/90 hover:border-amber-500/50 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all duration-200 shadow-md group cursor-pointer relative overflow-hidden"
                  >
                    {/* Top Group & Live Indicator */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider truncate">
                        {channel.group || 'Eventos Del Día'}
                      </span>

                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[9px] font-black uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        <span>EN DIRECTO</span>
                      </span>
                    </div>

                    {/* Channel Title with Sport Icon */}
                    <div className="flex items-start gap-3 my-1">
                      <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt=""
                            className="w-full h-full object-contain p-1 rounded-xl"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{sportIcon}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                          {channel.name}
                        </h3>
                        <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1.5">
                          <span className="text-zinc-500">Canal #{idx + 1}</span>
                          <span>• Transmisión activa</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>Listo para reproducir</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayChannel(channel);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Ver Ahora</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: CARTELERA DE PARTIDOS Y ENCUENTROS */}
      {viewMode === 'matches' && (
        <div className="space-y-5">
          {/* Featured Match Hero Card (if available) */}
          {featuredMatch && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-indigo-950/60 to-purple-950/60 border border-indigo-500/30 p-5 sm:p-6 shadow-2xl">
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Match Information */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black uppercase tracking-wider">
                      {featuredMatch.tournament}
                    </span>
                    {featuredMatch.category && (
                      <span className="text-xs font-semibold text-zinc-400">
                        • {featuredMatch.category}
                      </span>
                    )}
                    {featuredMatch.status === 'live' ? (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        EN VIVO {featuredMatch.liveMinute && `(${featuredMatch.liveMinute})`}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {featuredMatch.date} • {featuredMatch.time}
                      </span>
                    )}
                  </div>

                  {/* Main Teams & Score Display */}
                  <div className="flex items-center gap-4 sm:gap-6 py-2">
                    <div className="flex-1 text-right">
                      <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                        {featuredMatch.homeTeam}
                      </h2>
                    </div>

                    <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-black/50 border border-white/10 shrink-0">
                      {featuredMatch.score ? (
                        <span className="font-mono text-xl sm:text-3xl font-black text-amber-400 tracking-wider">
                          {featuredMatch.score}
                        </span>
                      ) : (
                        <span className="font-bold text-sm sm:text-base text-zinc-400 uppercase tracking-widest">
                          VS
                        </span>
                      )}
                      {featuredMatch.status === 'live' && (
                        <span className="text-[10px] text-rose-400 font-bold tracking-tight mt-0.5">
                          {featuredMatch.liveMinute || 'En Juego'}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                        {featuredMatch.awayTeam || 'Evento Principal'}
                      </h2>
                    </div>
                  </div>

                  {featuredMatch.stadiumOrLocation && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{featuredMatch.stadiumOrLocation}</span>
                    </div>
                  )}
                </div>

                {/* Channels Broadcasting This Featured Match */}
                <div className="lg:w-96 bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 space-y-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                      <Tv className="w-4 h-4 text-emerald-400" />
                      <span>Canales de Transmisión</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {featuredMatch.channels.length} opciones
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {featuredMatch.channels.map((ch, idx) => {
                      const inPlaylist = findMatchingChannel(ch.name);

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-indigo-500/50 rounded-xl p-2.5 transition-all group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                inPlaylist ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-indigo-400'
                              }`}
                            />
                            <div className="truncate">
                              <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                {ch.name}
                              </p>
                              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                                <span>{ch.quality || 'HD'}</span>
                                {ch.language && <span>• {ch.language}</span>}
                                {inPlaylist && (
                                  <span className="text-emerald-400 font-semibold">• En tu lista</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleLaunchChannel(ch, featuredMatch)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Ver Canal</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sport Categories Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {sportsCategories.map((cat) => {
              const isSelected = selectedSport === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSport(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102'
                      : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-indigo-800 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Todos ({matches.length})
            </button>
            <button
              onClick={() => setStatusFilter('live')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                statusFilter === 'live'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>En Vivo ({liveMatchesCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('today')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'today'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hoy ({todayMatchesCount})
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'upcoming'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Próximos
            </button>
          </div>

          {/* Matches Grid */}
          {filteredMatches.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl text-center">
              <Trophy className="w-12 h-12 text-zinc-600 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                No se encontraron partidos
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mb-4">
                No hay encuentros que coincidan con los filtros seleccionados o la búsqueda actual.
              </p>
              <button
                onClick={() => {
                  setSelectedSport('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMatches.map((match) => {
                const isLive = match.status === 'live';

                return (
                  <div
                    key={match.id}
                    className="bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/40 rounded-3xl p-4.5 flex flex-col justify-between transition-all duration-200 shadow-md group relative overflow-hidden"
                  >
                    {match.isHot && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500" />
                    )}

                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-indigo-400 truncate">
                            {match.tournament}
                          </span>
                          {match.category && (
                            <span className="text-[10px] text-zinc-500 truncate hidden sm:inline">
                              • {match.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isLive ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                              <span>{match.liveMinute || 'EN VIVO'}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                              <Clock className="w-2.5 h-2.5 text-indigo-400" />
                              <span>{match.date} {match.time}</span>
                            </span>
                          )}

                          <button
                            onClick={(e) => handleDeleteMatch(e, match.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition-opacity"
                            title="Eliminar partido"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Teams Row */}
                      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-3.5 mb-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-black text-white group-hover:text-indigo-200 transition-colors leading-snug">
                              {match.homeTeam}
                            </p>
                          </div>

                          <div className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 text-center">
                            {match.score ? (
                              <span className="font-mono text-sm font-black text-amber-400 tracking-wider">
                                {match.score}
                              </span>
                            ) : (
                              <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wider">
                                VS
                              </span>
                            )}
                          </div>

                          <div className="flex-1 text-right">
                            <p className="text-sm font-black text-white group-hover:text-indigo-200 transition-colors leading-snug">
                              {match.awayTeam || 'Principal'}
                            </p>
                          </div>
                        </div>

                        {match.stadiumOrLocation && (
                          <p className="text-[10px] text-zinc-500 mt-2 text-center truncate">
                            📍 {match.stadiumOrLocation}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Broadcasting Channels List */}
                    <div className="space-y-2 pt-1 border-t border-zinc-800/70">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold px-0.5">
                        <span className="flex items-center gap-1 text-zinc-300">
                          <Tv className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Transmiten en vivo:</span>
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {match.channels.length} canales
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5">
                        {match.channels.map((ch, idx) => {
                          const inPlaylist = findMatchingChannel(ch.name);

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-indigo-500/40 rounded-xl px-2.5 py-1.5 transition-all"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    inPlaylist ? 'bg-emerald-400' : 'bg-indigo-400'
                                  }`}
                                />
                                <div className="truncate">
                                  <span className="text-xs font-bold text-zinc-200 truncate">
                                    {ch.name}
                                  </span>
                                  {inPlaylist && (
                                    <span className="ml-1.5 text-[9px] text-emerald-400 font-medium hidden sm:inline">
                                      ✓ En tu lista
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => handleLaunchChannel(ch, match)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all cursor-pointer shrink-0"
                                title={`Reproducir canal ${ch.name}`}
                              >
                                <Play className="w-2.5 h-2.5 fill-white" />
                                <span>Ver</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Match Modal */}
      <AddMatchModal
        isOpen={isAddMatchModalOpen}
        onClose={() => setIsAddMatchModalOpen(false)}
        onSaveMatch={handleSaveNewMatch}
        availableChannels={channels}
      />
    </div>
  );
};
