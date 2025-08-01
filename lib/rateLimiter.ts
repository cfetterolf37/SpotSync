interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly DEFAULT_LIMIT = 10; // requests per window
  private readonly DEFAULT_WINDOW = 60 * 1000; // 1 minute window

  canMakeRequest(key: string, limit: number = this.DEFAULT_LIMIT, window: number = this.DEFAULT_WINDOW): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + window
      });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(key: string): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return this.DEFAULT_LIMIT;
    }
    return Math.max(0, this.DEFAULT_LIMIT - entry.count);
  }

  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    return entry ? entry.resetTime : Date.now();
  }

  clear(): void {
    this.limits.clear();
  }
}

export const rateLimiter = new RateLimiter(); 