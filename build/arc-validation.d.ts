import "reflect-metadata";
import { IOptions, ISubmitHandler } from "./interfaces";
/**
 * UnobtrusiveValidation class provides a central point of control for form validation in an application.
 * It manages form validation settings and handlers, and coordinates with other components.
 */
export default class UnobtrusiveValidation {
    private static _currentInstance;
    private pendingSubmitHandlers;
    private _options;
    private _logger;
    private _initializer;
    private _initialized;
    private _formManager;
    private static defaultOptions;
    /**
     * Constructs an instance of UnobtrusiveValidation with specified options.
     * @param {Partial<IOptions>} options - Options for validation configuration.
     */
    constructor(options: Partial<IOptions>);
    /**
     * Initializes the validation system. Binds options to the container and initializes other components.
     * @param {boolean} force - Flag to force re-initialization.
     */
    init(force?: boolean): Promise<void>;
    /**
     * Retrieves the current instance of UnobtrusiveValidation, creating it if it doesn't exist.
     * @param {Partial<IOptions>} options - Options to configure the instance.
     * @returns {Promise<UnobtrusiveValidation>} The current instance of UnobtrusiveValidation.
     */
    static getInstance(options?: Partial<IOptions>): Promise<UnobtrusiveValidation>;
    /**
     * Sets a custom submit handler for a form.
     * @param {string} formName - The name of the form.
     * @param {ISubmitHandler} handler - The custom submit handler function.
     */
    setSubmitHandler(formName: string, handler: ISubmitHandler): Promise<void>;
    /**
     * Configures the instance with new options.
     * @param {Partial<IOptions>} options - New options to apply.
     */
    private configure;
    /**
     * De-initializes the UnobtrusiveValidation instance.
     */
    deinit(): Promise<void>;
}
