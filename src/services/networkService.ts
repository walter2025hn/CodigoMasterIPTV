import { Capacitor } from '@capacitor/core';

export class NetworkService {
  /**
   * Check if running in a native mobile/desktop environment (Capacitor Android/iOS)
   */
  public static isNative(): boolean {
    try {
      if (Capacitor.isNativePlatform()) return true;
      const origin = window.location.origin;
      const isCapacitorLocal =
        origin.includes('capacitor://') ||
        origin.includes('http://localhost') ||
        origin.includes('file://') ||
        window.location.protocol === 'file:';
      return isCapacitorLocal;
    } catch {
      return false;
    }
  }

  /**
   * Cleans and formats URLs
   */
  public static cleanUrl(url: string): string {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'http://' + clean;
    }
    return clean;
  }

  /**
   * Build stream URL - Never use relative /api/proxy in native APKs
   */
  public static getStreamUrl(targetUrl: string, allowWebProxy: boolean = false): string {
    if (!targetUrl) return '';
    const clean = this.cleanUrl(targetUrl);

    // On native Android/iOS APK, ALWAYS return direct stream URL
    if (this.isNative() || !allowWebProxy) {
      return clean;
    }

    // In web browser development, check if proxy is available or use direct
    return clean;
  }

  /**
   * Robust fetch that works in both Native APK and Web Browser
   */
  public static async fetchText(url: string, preferProxy: boolean = false): Promise<string> {
    const targetUrl = this.cleanUrl(url);

    // 1. If in native Android APK, always do direct fetch
    if (this.isNative()) {
      try {
        const res = await fetch(targetUrl);
        if (res.ok) {
          return await res.text();
        }
      } catch (err) {
        console.warn('Native direct fetch failed, trying alternative:', err);
      }
    }

    // 2. Direct fetch attempt
    try {
      const res = await fetch(targetUrl);
      if (res.ok) {
        const text = await res.text();
        // Check if returned valid response or fallback HTML error
        if (text && !text.includes('Cannot GET /api/proxy')) {
          return text;
        }
      }
    } catch {
      // CORS or mixed-content network error on web, continue to server proxy
    }

    // 3. If in web browser, always try local Express server proxy /api/proxy
    if (!this.isNative()) {
      try {
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const text = await res.text();
          if (text && !text.startsWith('<!doctype html') && !text.startsWith('<!DOCTYPE html')) {
            return text;
          }
        }
      } catch {
        // Continue to public proxy
      }
    }

    // 4. Public CORS Proxies for Web Browser preview fallback
    const corsProxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
    ];

    for (const pUrl of corsProxies) {
      try {
        const res = await fetch(pUrl);
        if (res.ok) {
          const text = await res.text();
          if (text && !text.startsWith('<!doctype html') && !text.startsWith('<!DOCTYPE html')) {
            return text;
          }
        }
      } catch {
        // try next
      }
    }

    // Final direct fetch attempt to capture specific HTTP error status
    const finalRes = await fetch(targetUrl);
    if (!finalRes.ok) {
      throw new Error(`Error de conexión HTTP (${finalRes.status}): ${finalRes.statusText}`);
    }
    return await finalRes.text();
  }

  /**
   * Robust JSON fetch with automatic deserialization & error handling
   */
  public static async fetchJson<T = any>(url: string, preferProxy: boolean = false): Promise<T> {
    const rawText = await this.fetchText(url, preferProxy);
    const trimmed = rawText.trim();

    if (trimmed.startsWith('<') || trimmed.startsWith('<!doctype') || trimmed.startsWith('<!DOCTYPE')) {
      throw new Error(
        'El servidor respondió con una página web HTML en lugar de datos JSON. Verifica que la URL del servidor, puerto y credenciales sean correctos.'
      );
    }

    try {
      return JSON.parse(trimmed) as T;
    } catch (parseError: any) {
      throw new Error(
        `Error al procesar respuesta del servidor IPTV: Formato no válido (${parseError.message})`
      );
    }
  }
}
