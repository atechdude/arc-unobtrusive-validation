import { ILogger } from "./ILogger";
export interface IDecoratedLogger {
    getLogger: () => ILogger;
}
