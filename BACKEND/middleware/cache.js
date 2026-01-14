const NodeCache = require('node-cache');

// Create cache instance
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default TTL

// Cache middleware
const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(`Cache hit for: ${key}`);
      return res.json(cachedResponse);
    }

    console.log(`Cache miss for: ${key}`);
    
    // Override res.send to cache the response
    res.sendResponse = res.send;
    res.send = (body) => {
      cache.set(key, JSON.parse(body), duration);
      res.sendResponse(body);
    };

    next();
  };
};

// Clear cache for specific keys
const clearCache = (keys) => {
  if (Array.isArray(keys)) {
    cache.del(keys);
  } else {
    cache.del(keys);
  }
};

// Clear all cache
const clearAllCache = () => {
  cache.flushAll();
};

module.exports = { cacheMiddleware, clearCache, clearAllCache, cache };