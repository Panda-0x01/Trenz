import { NextRequest } from 'next/server';
import { RateLimitError } from './error-handler';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  private getKey(req: NextRequest): string {
    // Use IP address or user ID for rate limiting
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
    return ip;
  }

  check(req: NextRequest): boolean {
    const key = this.getKey(req);
    const now = Date.now();
    
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return true;
    }

    this.store[key].count++;
    return this.store[key].count <= this.maxRequests;
  }

  getRemainingRequests(req: NextRequest): number {
    const key = this.getKey(req);
    const entry = this.store[key];
    
    if (!entry || entry.resetTime < Date.now()) {
      return this.maxRequests;
    }
    
    return Math.max(0, this.maxRequests - entry.count);
  }

  getResetTime(req: NextRequest): number {
    const key = this.getKey(req);
    const entry = this.store[key];
    
    if (!entry || entry.resetTime < Date.now()) {
      return Date.now() + this.windowMs;
    }
    
    return entry.resetTime;
  }
}

// Create different rate limiters for different endpoints
export const generalLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes
export const authLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 auth attempts per 15 minutes
export const uploadLimiter = new RateLimiter(10, 60 * 1000); // 10 uploads per minute

export function rateLimit(limiter: RateLimiter) {
  return (req: NextRequest) => {
    if (!limiter.check(req)) {
      throw new RateLimitError('Too many requests. Please try again later.');
    }
  };
}

export function getRateLimitHeaders(req: NextRequest, limiter: RateLimiter) {
  return {
    'X-RateLimit-Limit': (limiter as any).maxRequests.toString(),
    'X-RateLimit-Remaining': limiter.getRemainingRequests(req).toString(),
    'X-RateLimit-Reset': Math.ceil(limiter.getResetTime(req) / 1000).toString(),
  };
}