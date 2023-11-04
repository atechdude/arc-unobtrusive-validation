import "reflect-metadata";
import { container } from "./di/container-config";
import { TYPES } from "./di/container-types";
import { IDecoratedLogger, IInitializer, IOptions } from "./interfaces";
export default class UnobtrusiveValidation {
    _logger: IDecoratedLogger | undefined;
    _initializer: IInitializer | undefined;
    _options?: Partial<IOptions>;

    constructor(options?: Partial<IOptions>) {
        this._options = options; // Save the passed options
    }

    async init(): Promise<void> {
        // Merge the provided options with defaults
        const finalOptions: IOptions = {
            debug: false,
            logLevel: "info",
            ...this._options // Use the options saved in the constructor
        };

        if (container.isBound(TYPES.Options)) {
            container.unbind(TYPES.Options);
        }
        container.bind<IOptions>(TYPES.Options).toConstantValue(finalOptions);

        this._logger = container.get<IDecoratedLogger>(TYPES.DebuggingLogger);
        this._initializer = container.get<IInitializer>(TYPES.Initializer);
        this._logger.getLogger().info("UnobtrusiveValidation initialized");
        await this._initializer.init();
    }
}



async function initializeUnobtrusiveValidation(): Promise<void> {
    const defaultOptions: Partial<IOptions> = {
        debug: true
    };

    // Pass the defaultOptions to the constructor
    const validationInstance = new UnobtrusiveValidation(defaultOptions);
    await validationInstance.init();
}
initializeUnobtrusiveValidation();
