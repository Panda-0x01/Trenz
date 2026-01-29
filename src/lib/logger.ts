type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: number;
  ip?: string;
  userAgent?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  private output(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    const logString = JSON.stringify(entry, null, this.isDevelopment ? 2 : 0);
    
    switch (entry.level) {
      case 'error':
        console.error(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'info':
        console.info(logString);
        break;
      case 'debug':
        console.debug(logString);
        break;
    }
  }

  debug(message: string, data?: any) {
    this.output(this.formatMessage('debug', message, data));
  }

  info(message: string, data?: any) {
    this.output(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any) {
    this.output(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: Error | any, data?: any) {
    const logData = {
      ...data,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    
    this.output(this.formatMessage('error', message, logData));
  }

  // API-specific logging methods
  apiRequest(method: string, path: string, userId?: number, ip?: string) {
    this.info(`API Request: ${method} ${path}`, {
      method,
      path,
      userId,
      ip,
    });
  }

  apiResponse(method: string, path: string, status: number, duration: number, userId?: number) {
    this.info(`API Response: ${method} ${path} - ${status} (${duration}ms)`, {
      method,
      path,
      status,
      duration,
      userId,
    });
  }

  apiError(method: string, path: string, error: Error, userId?: number, ip?: string) {
    this.error(`API Error: ${method} ${path}`, error, {
      method,
      path,
      userId,
      ip,
    });
  }

  // Security-related logging
  securityEvent(event: string, details: any, userId?: number, ip?: string) {
    this.warn(`Security Event: ${event}`, {
      event,
      details,
      userId,
      ip,
    });
  }

  // Database-related logging
  dbQuery(query: string, duration: number, error?: Error) {
    if (error) {
      this.error(`Database Query Failed: ${query}`, error, { duration });
    } else {
      this.debug(`Database Query: ${query} (${duration}ms)`, { duration });
    }
  }
}

export const logger = new Logger();

// Middleware to log API requests
export function logApiRequest(req: Request, userId?: number) {
  const url = new URL(req.url);
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  logger.apiRequest(req.method, url.pathname, userId, ip);
  
  return {
    startTime: Date.now(),
    logResponse: (status: number) => {
      const duration = Date.now() - Date.now();
      logger.apiResponse(req.method, url.pathname, status, duration, userId);
    },
    logError: (error: Error) => {
      logger.apiError(req.method, url.pathname, error, userId, ip);
    },
  };
}