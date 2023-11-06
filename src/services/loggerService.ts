import * as log from "loglevel";
import { injectable } from "inversify";
import { ILoggerService } from "../interfaces";

@injectable()
export class LoggerService implements ILoggerService {
    constructor() {
        console.log("LoggerService constructor");
        log.setLevel(log.levels.INFO);
    }

    get levels(): log.LogLevel {
        return log.levels; // Assuming 'levels' is accessible and refers to the corresponding property in 'loglevel'.
    }

    get methodFactory(): log.MethodFactory {
        return log.methodFactory; // Delegates to the actual 'methodFactory' in 'loglevel'.
    }

    getLevel(): 0 | 2 | 1 | 3 | 4 | 5 {
        return log.getLevel();
    }

    trace(...msg: any[]): void {
        log.trace(...msg);
    }

    debug(...msg: any[]): void {
        log.debug(...msg);
    }

    log(...msg: any[]): void {
        // 'log' method is not standard in 'loglevel'. If you need a generic log, you could map to a specific level, or remove this.
        log.info(...msg); // Example mapping to 'info' level.
    }

    info(...msg: any[]): void {
        log.info(...msg);
    }

    warn(...msg: any[]): void {
        log.warn(...msg);
    }

    error(...msg: any[]): void {
        log.error(...msg);
    }

    setLevel(level: log.LogLevelDesc, persist?: boolean): void {
        log.setLevel(level, persist);
    }

    setDefaultLevel(level: log.LogLevelDesc): void {
        log.setDefaultLevel(level);
    }

    resetLevel(): void {
        log.setDefaultLevel(log.levels.SILENT); // or another appropriate default
    }

    enableAll(persist?: boolean): void {
        log.enableAll(persist);
    }

    disableAll(persist?: boolean): void {
        log.disableAll(persist);
    }
}
