const DB_NAME = 'masti-music-offline';
const DB_VERSION = 1;
const TRACKS_STORE = 'offline_tracks';
const METADATA_STORE = 'metadata';

interface TrackData {
  id: string;
  url: string;
  [key: string]: any;
}

interface TrackMetadata {
  id: string;
  url: string;
  downloadDate: number;
  originalUrl?: string;
  source: string;
  [key: string]: any;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TRACKS_STORE)) {
        db.createObjectStore(TRACKS_STORE); // Audio Blob storage
      }
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'id' }); // Song Metadata storage
      }
    };
  });
}

/**
 * Downloads and saves a track to local IndexedDB, preventing direct file access.
 */
export async function saveTrackToOffline(trackData: TrackData, onProgress?: (p: number) => void): Promise<boolean> {
  try {
    const response = await fetch(trackData.url);
    if (!response.ok) throw new Error("Failed to fetch audio file");

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    
    // Convert directly to Blob without tracking progress if Content-Length is missing or simple fetch preferred
    const blob = await response.blob();
    if (onProgress) onProgress(100);

    const db = await getDB();
    
    // Start transaction
    return new Promise((resolve, reject) => {
      const tx = db.transaction([TRACKS_STORE, METADATA_STORE], 'readwrite');
      
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      
      // Save binary blob
      const tracksStore = tx.objectStore(TRACKS_STORE);
      tracksStore.put(blob, trackData.id);
      
      // Save metadata
      const metaStore = tx.objectStore(METADATA_STORE);
      metaStore.put({
        ...trackData,
        downloadDate: Date.now(),
        // Erase url since we'll rely on local blob url
        originalUrl: trackData.url, 
        source: 'local_offline'
      });
    });

  } catch (error) {
    console.error("Failed to save track for offline playback:", error);
    return false;
  }
}

/**
 * Removes a track from local IndexedDB.
 */
export async function removeOfflineTrack(trackId: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([TRACKS_STORE, METADATA_STORE], 'readwrite');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      
      tx.objectStore(TRACKS_STORE).delete(trackId);
      tx.objectStore(METADATA_STORE).delete(trackId);
    });
  } catch (e) {
    console.error("Error removing offline track", e);
    return false;
  }
}

/**
 * Gets a blob URL for local playback.
 * NOTE: Need to call URL.revokeObjectURL() later when track is unloaded to free memory,
 * or let the browser clean it up.
 */
export async function getOfflineTrackBlobUrl(trackId: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([TRACKS_STORE], 'readonly');
      const store = tx.objectStore(TRACKS_STORE);
      const request = store.get(trackId);
      
      request.onsuccess = () => {
        if (request.result) {
          // request.result is the Blob
          const url = URL.createObjectURL(request.result);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error retrieving offline track blob", e);
    return null;
  }
}

/**
 * Lists all tracks saved for offline playback.
 */
export async function getOfflineTracks(): Promise<TrackMetadata[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([METADATA_STORE], 'readonly');
      const store = tx.objectStore(METADATA_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error getting offline tracks list", e);
    return [];
  }
}
