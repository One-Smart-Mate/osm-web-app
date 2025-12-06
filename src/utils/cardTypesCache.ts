import Dexie, { Table } from 'dexie';

// Define the database schema
interface CachedCardType {
  id: string; // Composite key: siteId_cardTypeId
  siteId: string;
  cardTypeId: string;
  data: any;
  hasPreclassifiers: boolean;
  preclassifiersCount: number;
  lastUpdated: Date;
  expiresAt: Date;
}

interface CachedPreclassifier {
  id: string; // Composite key: cardTypeId_preclassifierId
  cardTypeId: string;
  preclassifierId: string;
  data: any;
  lastUpdated: Date;
  expiresAt: Date;
}

interface CardTypeSiteData {
  id: string; // siteId
  siteId: string;
  cardTypes: any[];
  lastUpdated: Date;
  expiresAt: Date;
}

// Create the database class
class CardTypesCacheDB extends Dexie {
  cardTypes!: Table<CachedCardType>;
  preclassifiers!: Table<CachedPreclassifier>;
  siteData!: Table<CardTypeSiteData>;

  constructor() {
    super('CardTypesCacheDB');

    this.version(1).stores({
      cardTypes: 'id, siteId, cardTypeId, lastUpdated, expiresAt',
      preclassifiers: 'id, cardTypeId, preclassifierId, lastUpdated, expiresAt',
      siteData: 'id, siteId, lastUpdated, expiresAt'
    });
  }
}

// Create database instance
const db = new CardTypesCacheDB();

// Cache expiration time (in milliseconds)
const CACHE_DURATION = {
  CARD_TYPE: 5 * 60 * 1000,      // 5 minutes for card types
  PRECLASSIFIER: 5 * 60 * 1000,  // 5 minutes for preclassifiers
  SITE_DATA: 3 * 60 * 1000,      // 3 minutes for site data
};

export class CardTypesCache {
  // Clear expired cache entries
  static async clearExpired(): Promise<void> {
    const now = new Date();

    await db.cardTypes.where('expiresAt').below(now).delete();
    await db.preclassifiers.where('expiresAt').below(now).delete();
    await db.siteData.where('expiresAt').below(now).delete();
  }

  // Cache all card types for a site
  static async cacheSiteCardTypes(siteId: string, cardTypes: any[]): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION.SITE_DATA);

    await db.siteData.put({
      id: siteId,
      siteId,
      cardTypes,
      lastUpdated: now,
      expiresAt
    });

    // Also cache individual card types
    for (const cardType of cardTypes) {
      await this.cacheCardType(siteId, cardType);
    }
  }

  // Get cached card types for a site
  static async getSiteCardTypes(siteId: string): Promise<any[] | null> {
    const cached = await db.siteData.get(siteId);

    if (cached && cached.expiresAt > new Date()) {
      return cached.cardTypes;
    }

    return null;
  }

  // Cache a single card type
  static async cacheCardType(siteId: string, cardType: any): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION.CARD_TYPE);

    await db.cardTypes.put({
      id: `${siteId}_${cardType.id}`,
      siteId,
      cardTypeId: cardType.id,
      data: cardType,
      hasPreclassifiers: cardType.hasPreclassifiers || false,
      preclassifiersCount: cardType.preclassifiersCount || 0,
      lastUpdated: now,
      expiresAt
    });
  }

  // Get a cached card type
  static async getCardType(siteId: string, cardTypeId: string): Promise<any | null> {
    const cached = await db.cardTypes.get(`${siteId}_${cardTypeId}`);

    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }

    return null;
  }

  // Cache preclassifiers for a card type
  static async cachePreclassifiers(cardTypeId: string, preclassifiers: any[]): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION.PRECLASSIFIER);

    for (const preclassifier of preclassifiers) {
      await db.preclassifiers.put({
        id: `${cardTypeId}_${preclassifier.id}`,
        cardTypeId,
        preclassifierId: preclassifier.id,
        data: preclassifier,
        lastUpdated: now,
        expiresAt
      });
    }
  }

  // Get cached preclassifiers for a card type
  static async getPreclassifiers(cardTypeId: string): Promise<any[] | null> {
    const preclassifiers = await db.preclassifiers
      .where('cardTypeId').equals(cardTypeId)
      .toArray();

    // Check if all are still valid
    const now = new Date();
    const allValid = preclassifiers.every(p => p.expiresAt > now);

    if (allValid && preclassifiers.length > 0) {
      return preclassifiers.map(p => p.data);
    }

    return null;
  }

  // Clear all cache for a specific site
  static async clearSiteCache(siteId: string): Promise<void> {
    // Get all card type IDs for this site first
    const cardTypes = await db.cardTypes
      .where('siteId').equals(siteId)
      .toArray();

    // Delete preclassifiers for each card type
    for (const ct of cardTypes) {
      await db.preclassifiers
        .where('cardTypeId').equals(ct.cardTypeId)
        .delete();
    }

    // Delete card types and site data
    await db.cardTypes.where('siteId').equals(siteId).delete();
    await db.siteData.where('siteId').equals(siteId).delete();
  }

  // Clear preclassifiers cache for a specific card type
  static async clearCardTypePreclassifiers(cardTypeId: string): Promise<void> {
    await db.preclassifiers.where('cardTypeId').equals(cardTypeId).delete();
  }

  // Get cache size info
  static async getCacheInfo(): Promise<{
    cardTypeCount: number;
    preclassifierCount: number;
    siteDataCount: number;
    estimatedSize: number;
  }> {
    const cardTypeCount = await db.cardTypes.count();
    const preclassifierCount = await db.preclassifiers.count();
    const siteDataCount = await db.siteData.count();

    // Rough estimate of cache size in bytes
    const estimatedSize = (cardTypeCount * 500) + (preclassifierCount * 300) + (siteDataCount * 2000);

    return {
      cardTypeCount,
      preclassifierCount,
      siteDataCount,
      estimatedSize
    };
  }

  // Clear old cache entries periodically
  static startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    setInterval(async () => {
      await this.clearExpired();
    }, 5 * 60 * 1000);
  }
}

// Initialize cleanup
CardTypesCache.startCleanupInterval();
