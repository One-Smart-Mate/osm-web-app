import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/**
 * Persistent cache for evidence media blobs.
 *
 * Evidence images/videos/audios of a card never change and are never deleted,
 * so once downloaded they can be stored in IndexedDB and reused across page
 * reloads instead of re-fetching from the network. The cache key is the
 * evidence's immutable service route (optionally suffixed for the thumbnail
 * variant), so thumbnails and full-resolution images are cached separately.
 */
interface EvidenceCacheDB extends DBSchema {
  media: {
    key: string; // evidence route (+ "|thumb" for the thumbnail variant)
    value: {
      key: string;
      blob: Blob;
      contentType: string;
      timestamp: number;
    };
  };
}

const DB_NAME = "evidence-media-cache";
const DB_VERSION = 1;
// Evidence is immutable, so entries can live long. Cap age only to bound disk
// usage (30 days); a re-fetch simply repopulates it.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

let dbPromise: Promise<IDBPDatabase<EvidenceCacheDB>> | null = null;

const getDB = (): Promise<IDBPDatabase<EvidenceCacheDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<EvidenceCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("media")) {
          db.createObjectStore("media", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
};

const cacheKey = (route: string, thumb: boolean): string =>
  thumb ? `${route}|thumb` : route;

/** Return a cached blob for an evidence route, or null if not cached / expired. */
export const getCachedEvidence = async (
  route: string,
  thumb: boolean
): Promise<Blob | null> => {
  try {
    const db = await getDB();
    const entry = await db.get("media", cacheKey(route, thumb));
    if (!entry) return null;
    if (Date.now() - entry.timestamp > MAX_AGE_MS) {
      await db.delete("media", cacheKey(route, thumb));
      return null;
    }
    return entry.blob;
  } catch {
    return null; // cache is best-effort; never block rendering
  }
};

/** Store an evidence blob so a later reload reuses it without a network fetch. */
export const putCachedEvidence = async (
  route: string,
  thumb: boolean,
  blob: Blob,
  contentType: string
): Promise<void> => {
  try {
    const db = await getDB();
    await db.put("media", {
      key: cacheKey(route, thumb),
      blob,
      contentType,
      timestamp: Date.now(),
    });
  } catch {
    // ignore — caching is best-effort
  }
};
