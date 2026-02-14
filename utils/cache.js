/**
 * Simple in-memory cache utility with TTL support.
 * Used for caching frequently accessed, rarely changing data
 * (e.g. clinic configs, subscription plans) to reduce DB load.
 */

class Cache {
    constructor() {
        this.store = new Map();
    }

    /**
     * Set a value in cache with optional TTL (seconds).
     * @param {string} key
     * @param {*} value
     * @param {number} ttl - Time to live in seconds (default: 300 = 5 min)
     */
    set(key, value, ttl = 300) {
        const expiresAt = Date.now() + ttl * 1000;
        this.store.set(key, { value, expiresAt });
    }

    /**
     * Get a value from cache. Returns null if expired or not found.
     * @param {string} key
     * @returns {*|null}
     */
    get(key) {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }

    /**
     * Delete a key from cache.
     * @param {string} key
     */
    del(key) {
        this.store.delete(key);
    }

    /**
     * Clear all cache entries.
     */
    clear() {
        this.store.clear();
    }

    /**
     * Get or set pattern: fetch from cache or compute and cache.
     * @param {string} key
     * @param {Function} fetchFn - Async function to fetch data if not cached
     * @param {number} ttl - TTL in seconds
     * @returns {Promise<*>}
     */
    async getOrSet(key, fetchFn, ttl = 300) {
        const cached = this.get(key);
        if (cached !== null) return cached;
        const value = await fetchFn();
        this.set(key, value, ttl);
        return value;
    }

    /**
     * Get cache size (number of entries).
     * @returns {number}
     */
    size() {
        return this.store.size;
    }
}

// Export singleton instance
module.exports = new Cache();
