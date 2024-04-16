import { debug, error, info, trace, warn } from 'loglevel';

export const defaultLogger = {
    error,
    debug,
    info,
    warn,
    trace,
} as const;

export type Logger = typeof defaultLogger;
