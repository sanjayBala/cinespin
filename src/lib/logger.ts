// Simple isomorphic logger for Next.js
// Handles both client and server environments without requiring fs

// Define log level interface
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Define logger interface
export interface Logger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

// Helper to format meta objects for console logging
const formatMeta = (meta?: any): string => {
  if (!meta) return '';
  try {
    return typeof meta === 'object' ? ` ${JSON.stringify(meta)}` : ` ${meta}`;
  } catch {
    return ' [Object cannot be stringified]';
  }
};

// Create an isomorphic logger that works in both environments
const logger: Logger = {
  debug(message, meta) {
    console.debug(`[DEBUG] ${message}${formatMeta(meta)}`);
  },
  info(message, meta) {
    console.info(`[INFO] ${message}${formatMeta(meta)}`);
  },
  warn(message, meta) {
    console.warn(`[WARN] ${message}${formatMeta(meta)}`);
  },
  error(message, meta) {
    console.error(`[ERROR] ${message}${formatMeta(meta)}`);
  }
};

// Add request logging middleware (server-side only)
export const requestLogger = (req: Request) => {
  if (typeof window !== 'undefined') {
    return {
      end: () => {},
    };
  }

  const start = Date.now();
  return {
    end: (status: number) => {
      const duration = Date.now() - start;
      logger.info('API Request', {
        method: req.method,
        url: req.url,
        status,
        duration: `${duration}ms`,
      });
    },
  };
};

export default logger; 