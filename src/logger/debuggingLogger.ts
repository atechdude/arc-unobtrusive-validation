import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IDecoratedLogger, ILoggerService, IOptions } from "../interfaces";

@injectable()
export class DebuggingLogger implements IDecoratedLogger {
    private readonly loggerProxy: ILoggerService;

    constructor(
        @inject(TYPES.Logger) private readonly _logger: ILoggerService,
        @inject(TYPES.Options) private readonly _options: IOptions
    ) {
        const handler: ProxyHandler<ILoggerService> = {
            get: (target, propertyKey: string | symbol) => {
                if (typeof propertyKey === "symbol") {
                    return undefined;
                }

                const actualKey = propertyKey as keyof ILoggerService;
                const originalProperty = target[actualKey];

                if (typeof originalProperty === "function") {
                    // Asserting the function type more clearly for TypeScript
                    const originalMethod = originalProperty as (
                        ...args: any[]
                    ) => any;

                    // If 'info' method, and debug is true, we want to intercept and change its behavior.
                    if (propertyKey === "info" && !this._options.debug) {
                        return (...args: any[]): void => {};
                    }

                    // For methods other than 'info' or if debug is true, we keep the original behavior.
                    return originalMethod.bind(target); // now TypeScript recognizes the 'bind' method
                }

                // If dealing with non-function properties (like 'levels'), we return them as is.
                return originalProperty;
            }
        };

        this.loggerProxy = new Proxy(_logger, handler);
    }

    getLogger(): ILoggerService {
        return this.loggerProxy;
    }
}
