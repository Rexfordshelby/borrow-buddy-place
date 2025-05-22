
/**
 * Logger utility for consistent logging across the application
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
}

// Set this to 'debug' for development and 'info' for production
const currentLogLevel: LogLevel = 'debug';

const logLevelPriority = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const shouldLog = (level: LogLevel): boolean => {
  return logLevelPriority[level] >= logLevelPriority[currentLogLevel];
};

const formatLog = (level: LogLevel, message: string, data?: any): void => {
  const timestamp = new Date().toISOString();
  const logPrefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (data !== undefined) {
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `${logPrefix} ${message}`,
      data
    );
  } else {
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `${logPrefix} ${message}`
    );
  }
};

export const logger: Logger = {
  debug: (message: string, data?: any) => {
    if (shouldLog('debug')) {
      formatLog('debug', message, data);
    }
  },
  
  info: (message: string, data?: any) => {
    if (shouldLog('info')) {
      formatLog('info', message, data);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (shouldLog('warn')) {
      formatLog('warn', message, data);
    }
  },
  
  error: (message: string, data?: any) => {
    if (shouldLog('error')) {
      formatLog('error', message, data);
    }
  }
};

export default logger;
