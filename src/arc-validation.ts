import "reflect-metadata";
import { IDecoratedLogger, IInitializer, IOptions } from "./interfaces";
import { container } from "./di/container-config";
import { TYPES } from "./di/container-types";

export default class UnobtrusiveValidation {
    private static _currentInstance: UnobtrusiveValidation | null = null;
    private _options: IOptions;
    private _logger: IDecoratedLogger | undefined;
    private _initializer: IInitializer | undefined;
    private _initialized: boolean = false;

    private static defaultOptions: IOptions = {
        debug: true,
        logLevel: "info",
        autoInit: true,
        useDefaultFormSubmitter: true
    };

    constructor(options: Partial<IOptions>) {
        this._options = { ...UnobtrusiveValidation.defaultOptions, ...options };
        if (this._options.autoInit !== false) {
            this.init().catch((err) =>
                console.error("Initialization failed", err)
            );
        }
    }

    async init(force = false): Promise<void> {
        if (this._initialized && !force) {
            this._logger
                ?.getLogger()
                .info("UnobtrusiveValidation already initialized, skipping...");
            return;
        }

        this._initialized = true;

        // Contaianer is already has options bound, unbind them
        if (container.isBound(TYPES.Options)) {
            container.unbind(TYPES.Options);
        }
        // Bind the options to the container
        container.bind<IOptions>(TYPES.Options).toConstantValue(this._options);

        // Get the logger from the container
        this._logger = container.get<IDecoratedLogger>(TYPES.DebuggingLogger);

        // Get the initializer from the container
        this._initializer = container.get<IInitializer>(TYPES.Initializer);

        // Initialize the initializer
        await this._initializer.init();
        this._initialized = true;
    }

    static getInstance(options: Partial<IOptions> = {}): UnobtrusiveValidation {
        const effectiveOptions =
            Object.keys(options).length === 0
                ? UnobtrusiveValidation.defaultOptions
                : { ...UnobtrusiveValidation.defaultOptions, ...options };

        if (!this._currentInstance) {
            this._currentInstance = new UnobtrusiveValidation(effectiveOptions);
        } else {
            // Handle case when options are passed after the instance was created.
            // This can be a full reconfiguration, or you might want to ignore it,
            // or handle specific properties like autoInit, based on your application's needs.
            this._currentInstance.configure(effectiveOptions);
        }

        return this._currentInstance;
    }
    configure(options: Partial<IOptions>): void {
        // First, check if options actually need updating to prevent unnecessary re-initialization.
        const optionsChanged = Object.keys(options).some(
            (key) => this._options[key] !== options[key]
        );
        if (!optionsChanged) {
            return; // No changes, so no need to re-initialize.
        }

        // Update the internal options with the new settings.
        this._options = { ...this._options, ...options };

        // check for specific options that require re-initialization.
        if (options.autoInit !== undefined) {
            if (options.autoInit) {
                // Call the init method to re-initialize.
                this.init().catch((err) =>
                    console.error("Re-initialization failed", err)
                );
            } else {
                // Handle the case where autoInit is false, such as cleaning up resources.
                this.deinit().catch((err) =>
                    console.error("De-initialization failed", err)
                );
            }
        }

        // Other options can be handled here as well if they require special logic when changed.
    }
    async deinit(): Promise<void> {
        // De-initialization logic here
        // Nothing to do here for now
    }
}
