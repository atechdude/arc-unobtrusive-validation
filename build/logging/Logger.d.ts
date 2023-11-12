import * as log from "loglevel";
import { ILogger } from "../interfaces";
export declare class Logger implements ILogger {
    constructor();
    get levels(): log.LogLevel;
    get methodFactory(): log.MethodFactory;
    getLevel(): 0 | 2 | 1 | 3 | 4 | 5;
    trace(...msg: any[]): void;
    debug(...msg: any[]): void;
    log(...msg: any[]): void;
    info(...msg: any[]): void;
    warn(...msg: any[]): void;
    error(...msg: any[]): void;
    setLevel(level: log.LogLevelDesc, persist?: boolean): void;
    setDefaultLevel(level: log.LogLevelDesc): void;
    resetLevel(): void;
    enableAll(persist?: boolean): void;
    disableAll(persist?: boolean): void;
}
