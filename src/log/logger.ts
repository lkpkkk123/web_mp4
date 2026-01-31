// Simplified logger implementation to avoid dependency issues

export interface LoggerConfig {
  /**
   * Log level (e.g., 'debug', 'info', 'warn', 'error')
   * Default: 'info'
   */
  level?: string;
  /**
   * Path to the log file. If not provided, file logging is disabled.
   */
  filePath?: string;
  /**
   * Whether to log to the console (terminal).
   * Default: true
   */
  logToConsole?: boolean;
  limitSize?: string;
  limitCount?: number;
}

export class Logger {
  private level: string;

  constructor(config?: LoggerConfig) {
    this.level = (config?.level || 'info').toLowerCase();
  }

  public debug(msg: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', msg, ...args);
    }
  }

  public info(msg: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', msg, ...args);
    }
  }

  public warn(msg: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', msg, ...args);
    }
  }

  public error(msg: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', msg, ...args);
    }
  }

  public fatal(msg: string, ...args: any[]): void {
    if (this.shouldLog('fatal')) {
      console.error('[FATAL]', msg, ...args);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(this.level);
    const testLevelIndex = levels.indexOf(level);
    
    return testLevelIndex >= currentLevelIndex;
  }
}

let logger: Logger;
function createLogger(config: LoggerConfig): void {
  logger = new Logger(config);
}
export { createLogger, logger };