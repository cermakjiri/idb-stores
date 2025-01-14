import { getLogger } from 'loglevel';

import pkg from '../../package.json';

export type LogLevel = 'error' | 'debug' | 'info' | 'silent';

export const defaultLogLevel: LogLevel = 'error';

const name = pkg.name;

export function createDefaultLogger(loglevel: LogLevel) {
    const { error, debug, info, setLevel } = getLogger(name);

    const defaultLogger = {
        error<Args extends unknown[]>(...args: Args) {
            error(`[${name}]`, ...args);
        },
        debug<Args extends unknown[]>(...args: Args) {
            debug(`[${name}]`, ...args);
        },
        info<Args extends unknown[]>(...args: Args) {
            info(`[${name}]`, ...args);
        },
    } as const;

    setLevel(loglevel, true);

    return defaultLogger;
}

export type Logger = ReturnType<typeof createDefaultLogger>;
