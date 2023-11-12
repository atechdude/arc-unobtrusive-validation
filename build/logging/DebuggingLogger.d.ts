import { IDecoratedLogger, ILogger, IOptions } from "../interfaces";
export declare class DebuggingLogger implements IDecoratedLogger {
    private readonly _logger;
    private readonly _options;
    private readonly loggerProxy;
    constructor(_logger: ILogger, _options: IOptions);
    getLogger(): ILogger;
}
