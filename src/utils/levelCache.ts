import Dexie, { Table } from 'dexie';

// Define the database schema
interface CachedLevel {
  id: string; // Composite key: siteId_levelId
  siteId: number;
  levelId: number;
  parentId: number | null;
  data: any;
  hasChildren: boolean;
  childrenCount: number;
  lastUpdated: Date;
  expiresAt: Date;
}

interface CachedTreeNode {
  id: string; // Composite key: siteId_parentId_depth
  siteId: number;
  parentId: number | null;
  depth: number;
  data: any[];
  lastUpdated: Date;
  expiresAt: Date;
}

interface SiteStats {
  siteId: number;
  stats: any;
  lastUpdated: Date;
  expiresAt: Date;
}

// Create the database class
class LevelCacheDB extends Dexie {
  levels!: Table<CachedLevel>;
  treeNodes!: Table<CachedTreeNode>;
  siteStats!: Table<SiteStats>;

  constructor() {
    super('LevelCacheDB');

    this.version(1).stores({
      levels: 'id, siteId, levelId, parentId, lastUpdated, expiresAt',
      treeNodes: 'id, siteId, parentId, lastUpdated, expiresAt',
      siteStats: 'siteId, lastUpdated, expiresAt'
    });
  }
}

// Create database instance
const db = new LevelCacheDB();

// Cache expiration time (in milliseconds)
const CACHE_DURATION = {
  LEVEL: 5 * 60 * 1000,      // 5 minutes for individual levels
  TREE_NODE: 3 * 60 * 1000,   // 3 minutes for tree nodes
  STATS: 10 * 60 * 1000,      // 10 minutes for statistics
};

export class LevelCache {
  // Clear expired cache entries
  static async clearExpired(): Promise<void> {
    const now = new Date();

    await db.levels.where('expiresAt').below(now).delete();
    await db.treeNodes.where('expiresAt').below(now).delete();
    await db.siteStats.where('expiresAt').below(now).delete();
  }

  // Cache a single level
  static async cacheLevel(siteId: number, level: any): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION.LEVEL);

    await db.levels.put({
      id: `${siteId}_${level.id}`,
      siteId,
      levelId: level.id,
      parentId: level.superiorId || null,
      data: level,
      hasChildren: level.hasChildren || false,
      childrenCount: level.childrenCount || 0,
      lastUpdated: now,
      expiresAt
    });
  }

  // Get a cached level
  static async getLevel(siteId: number, levelId: number): Promise<any | null> {
    const cached = await db.levels.get(`${siteId}_${levelId}`);

    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }

    return null;
  }

  // Cache a tree node (lazy loaded chunk)
  static async cacheTreeNode(
    siteId: number,
    parentId: number | null,
    depth: number,
    data: any[]
  ): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION.TREE_NODE);

    const id = `${siteId}_${parentId || 'root'}_${depth}`;

    await db.treeNodes.put({
      id,
      siteId,
      parentId,
      depth,
      data,
      lastUpdated: now,
      expiresAt
    });

    // Also cache individual levels
    for (const level of data) {
      await this.cacheLevel(siteId, level);
    }
  }

  // Get a cached tree node
  static async getTreeNode(
    siteId: number,
    parentId: number | null,
    depth: number
  ): Promise<any[] | null> {
    const id = `${siteId}_${parentId || 'root'}_${depth}`;
    const cached = await db.treeNodes.get(id);

    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }

    return null;
  }

  // Cache site statistics
  static async cacheStats(siteId: number, stats: any): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION.STATS);

    await db.siteStats.put({
      siteId,
      stats,
      lastUpdated: now,
      expiresAt
    });
  }

  // Get cached statistics
  static async getStats(siteId: number): Promise<any | null> {
    const cached = await db.siteStats.get(siteId);

    if (cached && cached.expiresAt > new Date()) {
      return cached.stats;
    }

    return null;
  }

  // Clear all cache for a specific site
  static async clearSiteCache(siteId: number): Promise<void> {
    await db.levels.where('siteId').equals(siteId).delete();
    await db.treeNodes.where('siteId').equals(siteId).delete();
    await db.siteStats.where('siteId').equals(siteId).delete();
  }

  // Get children from cache
  static async getCachedChildren(siteId: number, parentId: number): Promise<any[] | null> {
    const children = await db.levels
      .where('siteId').equals(siteId)
      .and(level => level.parentId === parentId)
      .toArray();

    // Check if all are still valid
    const now = new Date();
    const allValid = children.every(child => child.expiresAt > now);

    if (allValid && children.length > 0) {
      return children.map(child => child.data);
    }

    return null;
  }

  // Check if we have a complete cache for a node's children
  static async hasCompleteChildrenCache(
    siteId: number,
    parentId: number,
    expectedCount: number
  ): Promise<boolean> {
    const children = await this.getCachedChildren(siteId, parentId);
    return children !== null && children.length === expectedCount;
  }

  // Get cache size info
  static async getCacheInfo(): Promise<{
    levelCount: number;
    treeNodeCount: number;
    statsCount: number;
    estimatedSize: number;
  }> {
    const levelCount = await db.levels.count();
    const treeNodeCount = await db.treeNodes.count();
    const statsCount = await db.siteStats.count();

    // Rough estimate of cache size in bytes
    const estimatedSize = (levelCount * 500) + (treeNodeCount * 2000) + (statsCount * 100);

    return {
      levelCount,
      treeNodeCount,
      statsCount,
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
LevelCache.startCleanupInterval();