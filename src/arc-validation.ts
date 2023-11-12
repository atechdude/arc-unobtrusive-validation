import "reflect-metadata";
import { IDecoratedLogger, IFormManager, IInitializer, IOptions, ISubmitHandler } from "./interfaces";
import { container } from "./di/container-config";
import { TYPES } from "./di/container-types";

/**
 * UnobtrusiveValidation class provides a central point of control for form validation in an application.
 * It manages form validation settings and handlers, and coordinates with other components.
 */
export default class UnobtrusiveValidation {
    private static _currentInstance: UnobtrusiveValidation | null = null;
    private pendingSubmitHandlers: Record<string, ISubmitHandler> = {};
    private _options: IOptions;
    private _logger: IDecoratedLogger | undefined;
    private _initializer: IInitializer | undefined;
    private _initialized: boolean = false;
    private _formManager: IFormManager | undefined;
    private static defaultOptions: IOptions = {
        debug: false,
        autoInit: true,
        logLevel: "info",
        useDefaultFormSubmitter: true
    };

    /**
     * Constructs an instance of UnobtrusiveValidation with specified options.
     * @param {Partial<IOptions>} options - Options for validation configuration.
     */
    constructor(options: Partial<IOptions>) {
        this._options = { ...UnobtrusiveValidation.defaultOptions, ...options };
    }

    /**
     * Initializes the validation system. Binds options to the container and initializes other components.
     * @param {boolean} force - Flag to force re-initialization.
     */
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

        this._formManager = await this._initializer.init();
    }

    /**
     * Retrieves the current instance of UnobtrusiveValidation, creating it if it doesn't exist.
     * @param {Partial<IOptions>} options - Options to configure the instance.
     * @returns {Promise<UnobtrusiveValidation>} The current instance of UnobtrusiveValidation.
     */
    static async getInstance(options: Partial<IOptions> = {}): Promise<UnobtrusiveValidation> {
        const effectiveOptions =
            Object.keys(options).length === 0
                ? UnobtrusiveValidation.defaultOptions
                : { ...UnobtrusiveValidation.defaultOptions, ...options };

        if (!this._currentInstance) {
            this._currentInstance = new UnobtrusiveValidation(effectiveOptions);
        } else {
            this._currentInstance.configure(effectiveOptions);
        }

        // Perform initialization based on the autoInit option
        if (effectiveOptions.autoInit && !this._currentInstance._initialized) {
            await this._currentInstance.init();
        }

        return this._currentInstance;
    }

    /**
     * Sets a custom submit handler for a form.
     * @param {string} formName - The name of the form.
     * @param {ISubmitHandler} handler - The custom submit handler function.
     */
    async setSubmitHandler(formName: string, handler: ISubmitHandler): Promise<void> {
        if (!this._initializer) {
            console.error("Initializer is not available");
            return;
        }

        await this._initializer.setSubmitHandler(formName, handler);
    }

    /**
     * Configures the instance with new options.
     * @param {Partial<IOptions>} options - New options to apply.
     */
    private configure(options: Partial<IOptions>): void {
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
                    this._logger?.getLogger().error("Initialization failed", err)
                );
            } else {
                // Handle the case where autoInit is false, such as cleaning up resources.
                this.deinit().catch((err) =>
                    this._logger?.getLogger().error("De-initialization failed", err)
                );
            }
        }

        // Other options can be handled here as well if they require special logic when changed.
    }
    /**
     * De-initializes the UnobtrusiveValidation instance.
     */
    async deinit(): Promise<void> {
        // De-initialization logic here
        // Nothing to do here for now
    }
}
