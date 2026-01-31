import pino from 'pino';
import path from 'path';
import fs from 'fs';

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
  private logger: pino.Logger;

  constructor(config: LoggerConfig) {
    const {
      level = 'info',
      filePath,
      logToConsole = true,
      limitSize = '10m',
      limitCount = 5,
    } = config;

    const targets: pino.TransportTargetOptions[] = [];

    // Add console target if enabled
    if (logToConsole) {
      targets.push({
        target: 'pino-pretty', // Use pino-pretty for readable terminal output
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l', // Human-readable time
          ignore: 'pid,hostname', // Clean up output
        },
        level: level,
      });
    }

    // Add file target if path is provided
    if (filePath) {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      targets.push({
        target: path.join(__dirname, 'formatted-roll.js'), // Point to the compiled JS file in dist/
        options: {
          file: filePath,
          size: limitSize,
          limit: {
            count: limitCount,
          },
          mkdir: true,
          // pino-pretty options pass-through
          colorize: false,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
        level: level,
      });
    }

    // Create the transport
    const transport = pino.transport({
      targets: targets,
    });

    // Initialize pino with the transport
    this.logger = pino(
      {
        level: level,
        timestamp: pino.stdTimeFunctions.isoTime, // Standard ISO time for raw JSON logs (file)
      },
      transport
    );
  }

  public debug(msg: string, ...args: any[]): void {
    this.logger.debug(msg, ...args);
  }

  public info(msg: string, ...args: any[]): void {
    this.logger.info(msg, ...args);
  }

  public warn(msg: string, ...args: any[]): void {
    this.logger.warn(msg, ...args);
  }

  public error(msg: string, ...args: any[]): void {
    this.logger.error(msg, ...args);
  }

  public fatal(msg: string, ...args: any[]): void {
    this.logger.fatal(msg, ...args);
  }

  // Expose raw pino instance if needed
  public getRawLogger(): pino.Logger {
    return this.logger;
  }
}

let logger: Logger;
function createLogger(config: LoggerConfig): void {
  logger = new Logger(config);
}
export { createLogger, logger };
