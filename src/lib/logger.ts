import winston from 'winston';

// Create different logger configurations for server and client
const logger = typeof window === 'undefined' 
  ? winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    })
  : {
      info: (...args: any[]) => console.log(...args),
      error: (...args: any[]) => console.error(...args),
      warn: (...args: any[]) => console.warn(...args),
      debug: (...args: any[]) => console.debug(...args),
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