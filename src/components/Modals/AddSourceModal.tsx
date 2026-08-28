import React, { useState } from 'react';
import {
  Server,
  Link,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Tv,
  Film,
  Clapperboard,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PlaylistSource, UserSettings } from '../../types/iptv';
import { XtreamService } from '../../services/xtreamService';
import { parseM3U } from '../../services/m3uParser';
import { StorageService } from '../../services/storageService';
import { NetworkService } from '../../services/networkService';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceAdded: (source: PlaylistSource) => void;
  settings: UserSettings;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onSourceAdded,
  settings,
}) => {
  const [tab, setTab] = useState<'xtream' | 'm3u_url' | 'm3u_file'>('xtream');

  // Xtream state
  const [xtreamName, setXtreamName] = useState<string>('Mi Servidor Xtream');
  const [xtreamHost, setXtreamHost] = useState<string>('');
  const [xtreamUser, setXtreamUser] = useState<string>('');
  const [xtreamPass, setXtreamPass] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isTestingXtream, setIsTestingXtream] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    accountInfo?: any;
  } | null>(null);

  // M3U URL state
  const [m3uName, setM3uName] = useState<string>('Mi Lista M3U');
  const [m3uUrl, setM3uUrl] = useState<string>('');
  const [epgUrl, setEpgUrl] = useState<string>('');

  // M3U File state
  const [fileName, setFileName] = useState<string>('Lista desde archivo');
  const [fileContent, setFileContent] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Loading & error
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Test Xtream Connection
  const handleTestXtream = async () => {
    if (!xtreamHost || !xtreamUser || !xtreamPass) {
      setErrorMessage('Por favor completa todos los campos del servidor Xtream');
      return;
    }

    setIsTestingXtream(true);
    setTestResult(null);
    setErrorMessage(null);

    try {
      const accountInfo = await XtreamService.authenticate(
        xtreamHost,
        xtreamUser,
        xtreamPass,
        settings.useProxy
      );

      const expDate = accountInfo.user_info?.exp_date
        ? new Date(parseInt(accountInfo.user_info.exp_date) * 1000).toLocaleDateString()
        : 'Ilimitada';

      setTestResult({
        success: true,
        message: `¡Conexión exitosa! Estado: ${accountInfo.user_info?.status || 'Activo'} | Expira: ${expDate} | Conexiones: ${accountInfo.user_info?.active_cons || 0}/${accountInfo.user_info?.max_connections || 1}`,
        accountInfo,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error al conectar con el servidor Xtream Codes.',
      });
    } finally {
      setIsTestingXtream(false);
    }
  };

  // Submit Xtream Codes Source
  const handleSubmitXtream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!xtreamHost || !xtreamUser || !xtreamPass) {
      setErrorMessage('Por favor ingresa Host, Usuario y Contraseña');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Authenticate to get server details
      const accountInfo = await XtreamService.authenticate(
        xtreamHost,
        xtreamUser,
        xtreamPass,
        settings.useProxy
      );

      const newSource: PlaylistSource = {
        id: `xtream-${Date.now()}`,
        name: xtreamName.trim() || 'Servidor Xtream',
        type: 'xtream',
        serverUrl: xtreamHost.trim(),
        username: xtreamUser.trim(),
        password: xtreamPass.trim(),
        createdAt: Date.now(),
        lastSync: Date.now(),
        accountInfo,
      };

      // Fetch live, vod and series
      const [liveChannels, vodMovies, seriesList] = await Promise.all([
        XtreamService.getLiveStreams(newSource, undefined, settings.useProxy).catch(() => []),
        XtreamService.getVodStreams(newSource, undefined, settings.useProxy).catch(() => []),
        XtreamService.getSeriesStreams(newSource, undefined, settings.useProxy).catch(() => []),
      ]);

      const allItems = [...liveChannels, ...vodMovies, ...seriesList];
      newSource.channelCount = liveChannels.length;
      newSource.moviesCount = vodMovies.length;
      newSource.seriesCount = seriesList.length;

      StorageService.addSource(newSource);
      StorageService.saveChannels(newSource.id, allItems);
      StorageService.setActiveSourceId(newSource.id);

      onSourceAdded(newSource);
      onClose();
    } catch (err: any) {
      setErrorMessage(`Error al guardar la cuenta: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit M3U URL Source
  const handleSubmitM3uUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m3uUrl) {
      setErrorMessage('Por favor ingresa la URL de la lista M3U');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const sourceId = `m3u-${Date.now()}`;
      const content = await NetworkService.fetchText(m3uUrl.trim(), settings.useProxy);
      const channels = parseM3U(content, sourceId);

      if (channels.length === 0) {
        throw new Error('No se encontraron canales válidos en el formato M3U provisto.');
      }

      const liveCount = channels.filter((c) => c.streamType === 'live').length;
      const movieCount = channels.filter((c) => c.streamType === 'movie').length;
      const seriesCount = channels.filter((c) => c.streamType === 'series').length;

      const newSource: PlaylistSource = {
        id: sourceId,
        name: m3uName.trim() || 'Lista M3U',
        type: 'm3u',
        url: m3uUrl.trim(),
        epgUrl: epgUrl.trim(),
        createdAt: Date.now(),
        lastSync: Date.now(),
        channelCount: liveCount,
        moviesCount: movieCount,
        seriesCount: seriesCount,
      };

      StorageService.addSource(newSource);
      StorageService.saveChannels(newSource.id, channels);
      StorageService.setActiveSourceId(newSource.id);

      onSourceAdded(newSource);
      onClose();
    } catch (err: any) {
      setErrorMessage(`Error al procesar la lista M3U: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setFileName(file.name.replace(/\.(m3u|m3u8|txt)$/i, ''));

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent((event.target?.result as string) || '');
    };
    reader.readAsText(file);
  };

  // Submit M3U File Source
  const handleSubmitM3uFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileContent) {
      setErrorMessage('Por favor sube un archivo o pega el contenido M3U');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const sourceId = `file-${Date.now()}`;
      const channels = parseM3U(fileContent, sourceId);

      if (channels.length === 0) {
        throw new Error('No se encontraron canales válidos en el archivo provisto.');
      }

      const liveCount = channels.filter((c) => c.streamType === 'live').length;
      const movieCount = channels.filter((c) => c.streamType === 'movie').length;
      const seriesCount = channels.filter((c) => c.streamType === 'series').length;

      const newSource: PlaylistSource = {
        id: sourceId,
        name: fileName.trim() || 'Lista Local',
        type: 'm3u',
        createdAt: Date.now(),
        lastSync: Date.now(),
        channelCount: liveCount,
        moviesCount: movieCount,
        seriesCount: seriesCount,
      };

      StorageService.addSource(newSource);
      StorageService.saveChannels(newSource.id, channels);
      StorageService.setActiveSourceId(newSource.id);

      onSourceAdded(newSource);
      onClose();
    } catch (err: any) {
      setErrorMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Añadir Lista o Servidor IPTV</h3>
              <p className="text-xs text-zinc-400">
                Soporte completo para Xtream Codes API y listas M3U / M3U8
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-2 bg-zinc-900/60 border-b border-zinc-800 gap-1 text-xs font-semibold">
          <button
            onClick={() => {
              setTab('xtream');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'xtream'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Xtream Codes</span>
          </button>

          <button
            onClick={() => {
              setTab('m3u_url');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'm3u_url'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>URL M3U</span>
          </button>

          <button
            onClick={() => {
              setTab('m3u_file');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              tab === 'm3u_file'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Archivo / Texto</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Xtream Codes */}
          {tab === 'xtream' && (
            <form onSubmit={handleSubmitXtream} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre de la Cuenta / Perfil
                </label>
                <input
                  type="text"
                  value={xtreamName}
                  onChange={(e) => setXtreamName(e.target.value)}
                  placeholder="Ej. Mi IPTV Premium"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL del Servidor / Host + Puerto
                </label>
                <input
                  type="text"
                  value={xtreamHost}
                  onChange={(e) => setXtreamHost(e.target.value)}
                  placeholder="Ej. http://iptv-server.com:8080 o http://dominio.tv"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Usuario</label>
                  <input
                    type="text"
                    value={xtreamUser}
                    onChange={(e) => setXtreamUser(e.target.value)}
                    placeholder="Usuario Xtream"
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={xtreamPass}
                      onChange={(e) => setXtreamPass(e.target.value)}
                      placeholder="Contraseña"
                      className="w-full px-3.5 py-2 pr-9 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Connection Button & Result */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTestXtream}
                  disabled={isTestingXtream}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isTestingXtream ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verificando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <Server className="w-3.5 h-3.5" />
                      <span>Probar Conexión con Servidor</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div
                    className={`mt-2.5 p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Descargando Canales, Películas y Series...</span>
                    </>
                  ) : (
                    <span>Guardar y Cargar Contenido Xtream</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: M3U URL */}
          {tab === 'm3u_url' && (
            <form onSubmit={handleSubmitM3uUrl} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre de la Lista
                </label>
                <input
                  type="text"
                  value={m3uName}
                  onChange={(e) => setM3uName(e.target.value)}
                  placeholder="Ej. Mi Lista M3U"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL de la Lista M3U / M3U8
                </label>
                <input
                  type="url"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  placeholder="https://servidor.com/get.php?username=...&type=m3u_plus"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL de Guía EPG (Opcional)
                </label>
                <input
                  type="url"
                  value={epgUrl}
                  onChange={(e) => setEpgUrl(e.target.value)}
                  placeholder="https://servidor.com/epg.xml"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Descargando y parseando lista M3U...</span>
                    </>
                  ) : (
                    <span>Cargar Lista M3U</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: M3U File / Text */}
          {tab === 'm3u_file' && (
            <form onSubmit={handleSubmitM3uFile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nombre de la Lista
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Ej. Mi Lista Local"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Drag and drop file */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Subir archivo .m3u o .m3u8
                </label>
                <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-xl cursor-pointer bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                  <Upload className="w-6 h-6 text-indigo-400 mb-1.5" />
                  <span className="text-xs font-medium text-zinc-300">
                    {uploadedFileName ? uploadedFileName : 'Seleccionar archivo .m3u'}
                  </span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">
                    o arrastra y suelta tu archivo aquí
                  </span>
                  <input
                    type="file"
                    accept=".m3u,.m3u8,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  O pegar contenido M3U directamente:
                </label>
                <textarea
                  rows={4}
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-name=&quot;Canal 1&quot; group-title=&quot;Deportes&quot;,Canal 1&#10;http://stream.m3u8"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Procesando archivo...</span>
                    </>
                  ) : (
                    <span>Cargar Contenido M3U</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
