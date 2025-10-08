import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CardInterface } from '../data/card/card';

interface CardCacheDB extends DBSchema {
  cards: {
    key: string; // Format: "siteId-cardId"
    value: {
      key: string;
      card: CardInterface;
      timestamp: number;
      siteId: number;
    };
    indexes: {
      'bySite': number;
      'byTimestamp': number;
    };
  };
  cardPages: {
    key: string; // Format: "siteId-page-limit-filters"
    value: {
      key: string;
      cards: CardInterface[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
      timestamp: number;
      siteId: number;
    };
    indexes: {
      'bySite': number;
      'byTimestamp': number;
    };
  };
  cardStats: {
    key: number; // siteId
    value: {
      total: number;
      timestamp: number;
    };
  };
}

const DB_NAME = 'card-cache-db';
const DB_VERSION = 1;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class CardCache {
  private static dbPromise: Promise<IDBPDatabase<CardCacheDB>> | null = null;

  private static async getDB(): Promise<IDBPDatabase<CardCacheDB>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<CardCacheDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Store for individual cards
          if (!db.objectStoreNames.contains('cards')) {
            const cardStore = db.createObjectStore('cards', { keyPath: 'key' });
            cardStore.createIndex('bySite', 'siteId');
            cardStore.createIndex('byTimestamp', 'timestamp');
          }

          // Store for paginated results
          if (!db.objectStoreNames.contains('cardPages')) {
            const pageStore = db.createObjectStore('cardPages', { keyPath: 'key' });
            pageStore.createIndex('bySite', 'siteId');
            pageStore.createIndex('byTimestamp', 'timestamp');
          }

          // Store for card statistics
          if (!db.objectStoreNames.contains('cardStats')) {
            db.createObjectStore('cardStats');
          }
        },
      });
    }
    return this.dbPromise;
  }

  // Cache individual card
  static async cacheCard(siteId: number, card: CardInterface): Promise<void> {
    const db = await this.getDB();
    const key = `${siteId}-${card.id}`;
    await db.put('cards', {
      key,
      card,
      timestamp: Date.now(),
      siteId,
    });
  }

  // Get cached card
  static async getCachedCard(siteId: number, cardId: number): Promise<CardInterface | null> {
    const db = await this.getDB();
    const key = `${siteId}-${cardId}`;
    const cached = await db.get('cards', key);

    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      await db.delete('cards', key);
      return null;
    }

    return cached.card;
  }

  // Cache paginated results
  static async cachePage(
    siteId: number,
    page: number,
    limit: number,
    filters: any,
    result: {
      cards: CardInterface[];
      total: number;
      totalPages: number;
      hasMore: boolean;
    }
  ): Promise<void> {
    const db = await this.getDB();
    const filterKey = JSON.stringify(filters || {});
    const key = `${siteId}-${page}-${limit}-${filterKey}`;

    await db.put('cardPages', {
      key,
      cards: result.cards,
      total: result.total,
      page,
      limit,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
      timestamp: Date.now(),
      siteId,
    });

    // Also cache individual cards
    for (const card of result.cards) {
      await this.cacheCard(siteId, card);
    }
  }

  // Get cached page
  static async getCachedPage(
    siteId: number,
    page: number,
    limit: number,
    filters: any
  ): Promise<{
    cards: CardInterface[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  } | null> {
    const db = await this.getDB();
    const filterKey = JSON.stringify(filters || {});
    const key = `${siteId}-${page}-${limit}-${filterKey}`;

    const cached = await db.get('cardPages', key);

    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      await db.delete('cardPages', key);
      return null;
    }

    return {
      cards: cached.cards,
      total: cached.total,
      page: cached.page,
      limit: cached.limit,
      totalPages: cached.totalPages,
      hasMore: cached.hasMore,
    };
  }

  // Cache stats
  static async cacheStats(siteId: number, total: number): Promise<void> {
    const db = await this.getDB();
    await db.put('cardStats', {
      total,
      timestamp: Date.now(),
    }, siteId);
  }

  // Get cached stats
  static async getStats(siteId: number): Promise<{ total: number } | null> {
    const db = await this.getDB();
    const cached = await db.get('cardStats', siteId);

    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      await db.delete('cardStats', siteId);
      return null;
    }

    return { total: cached.total };
  }

  // Clear all cache for a site
  static async clearSiteCache(siteId: number): Promise<void> {
    const db = await this.getDB();

    // Clear cards
    const cardKeys = await db.getAllKeysFromIndex('cards', 'bySite', siteId);
    for (const key of cardKeys) {
      await db.delete('cards', key);
    }

    // Clear pages
    const pageKeys = await db.getAllKeysFromIndex('cardPages', 'bySite', siteId);
    for (const key of pageKeys) {
      await db.delete('cardPages', key);
    }

    // Clear stats
    await db.delete('cardStats', siteId);
  }

  // Clear all cache
  static async clearAllCache(): Promise<void> {
    const db = await this.getDB();
    await db.clear('cards');
    await db.clear('cardPages');
    await db.clear('cardStats');
  }

  // Clean old entries (older than CACHE_DURATION)
  static async cleanOldEntries(): Promise<void> {
    const db = await this.getDB();
    const now = Date.now();

    // Clean cards
    const cardTimestamps = await db.getAllFromIndex('cards', 'byTimestamp');
    for (const entry of cardTimestamps) {
      if (now - entry.timestamp > CACHE_DURATION) {
        await db.delete('cards', entry.key);
      }
    }

    // Clean pages
    const pageTimestamps = await db.getAllFromIndex('cardPages', 'byTimestamp');
    for (const entry of pageTimestamps) {
      if (now - entry.timestamp > CACHE_DURATION) {
        await db.delete('cardPages', entry.key);
      }
    }
  }
}
