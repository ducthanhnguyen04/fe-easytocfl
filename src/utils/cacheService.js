class CacheService {
  get(key) {
    try {
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (parsed.expiry && parsed.expiry < Date.now()) {
        sessionStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    } catch (e) {
      return null;
    }
  }

  set(key, value, ttlMs = 300000) { // default 5 minutes
    try {
      const data = {
        value,
        expiry: ttlMs ? Date.now() + ttlMs : null
      };
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // Storage quota exceeded or disabled
    }
  }

  remove(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {}
  }

  clear() {
    try {
      sessionStorage.clear();
    } catch (e) {}
  }
}

export const cacheService = new CacheService();
