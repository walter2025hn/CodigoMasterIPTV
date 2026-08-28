import { ChannelItem } from '../types/iptv';

const DB_NAME = 'CodigoMasterIPTV_DB';
const DB_VERSION = 1;
const CHANNELS_STORE = 'channels';

export class DBService {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  private static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(CHANNELS_STORE)) {
          db.createObjectStore(CHANNELS_STORE, { keyPath: 'sourceId' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  public static async saveChannels(sourceId: string, channels: ChannelItem[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CHANNELS_STORE], 'readwrite');
        const store = transaction.objectStore(CHANNELS_STORE);
        const record = {
          sourceId,
          channels,
          updatedAt: Date.now(),
        };
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('DBService saveChannels error:', err);
    }
  }

  public static async getChannels(sourceId: string): Promise<ChannelItem[] | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CHANNELS_STORE], 'readonly');
        const store = transaction.objectStore(CHANNELS_STORE);
        const request = store.get(sourceId);

        request.onsuccess = () => {
          if (request.result && Array.isArray(request.result.channels)) {
            resolve(request.result.channels);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('DBService getChannels error:', err);
      return null;
    }
  }

  public static async removeChannels(sourceId: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([CHANNELS_STORE], 'readwrite');
        const store = transaction.objectStore(CHANNELS_STORE);
        const request = store.delete(sourceId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('DBService removeChannels error:', err);
    }
  }
}
