/**
 * Production-ready logging service for SpotSync
 * Provides different log levels and environment-aware logging
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  metadata?: any;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = __DEV__;
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(level: LogLevel, message: string, context?: string, metadata?: any): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const contextStr = context ? `[${context}]` : '';
    const metadataStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
    
    return `${timestamp} ${levelName}${contextStr}: ${message}${metadataStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private log(level: LogLevel, message: string, context?: string, metadata?: any): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context, metadata);

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.log(formattedMessage);
        }
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }

    // In production, you could send logs to a service like Sentry, LogRocket, etc.
    if (!this.isDevelopment && level >= LogLevel.ERROR) {
      this.sendToLoggingService(level, message, context, metadata);
    }
  }

  private sendToLoggingService(level: LogLevel, message: string, context?: string, metadata?: any): void {
    // TODO: Implement production logging service integration
    // Example: Sentry, LogRocket, or custom logging endpoint
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      metadata,
    };

    // For now, we'll just store in memory for potential future implementation
    // In a real app, you'd send this to your logging service
    if (global.__spotSyncLogs) {
      global.__spotSyncLogs.push(logEntry);
    } else {
      global.__spotSyncLogs = [logEntry];
    }
  }

  debug(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, context?: string, metadata?: any): void {
    this.log(LogLevel.ERROR, message, context, metadata);
  }

  // Convenience methods for specific contexts
  auth(message: string, metadata?: any): void {
    this.info(message, 'Auth', metadata);
  }

  weather(message: string, metadata?: any): void {
    this.info(message, 'Weather', metadata);
  }

  venue(message: string, metadata?: any): void {
    this.info(message, 'Venue', metadata);
  }

  api(message: string, metadata?: any): void {
    this.info(message, 'API', metadata);
  }

  performance(message: string, metadata?: any): void {
    this.debug(message, 'Performance', metadata);
  }

  // Method to get logs for debugging (development only)
  getLogs(): LogEntry[] {
    if (!this.isDevelopment) return [];
    return global.__spotSyncLogs || [];
  }

  // Method to clear logs (development only)
  clearLogs(): void {
    if (this.isDevelopment) {
      global.__spotSyncLogs = [];
    }
  }
}

export const logger = new Logger();

// Type declaration for global logs
declare global {
  var __spotSyncLogs: LogEntry[];
} 