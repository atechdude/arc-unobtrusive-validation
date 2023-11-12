import { IDecoratedLogger, IFormManager } from "../interfaces";
/**
 * Observes the DOM for changes and notifies the FormManager when form elements are added or removed.
 */
export declare class FormObserver {
    private readonly _formManager;
    private readonly _logger;
    private mutationObserver;
    /**
     * Creates a FormObserver instance with dependencies injected for form management and logging.
     * @param {IFormManager} _formManager - The form manager that will handle form-related mutations.
     * @param {IDecoratedLogger} _logger - The logger for logging messages and errors.
     */
    constructor(_formManager: IFormManager, _logger: IDecoratedLogger);
    /**
     * Starts the observation process for form elements within the body of the document.
     * If an observer is already running, it disconnects before starting a new one.
     */
    startObserving(): void;
    /**
     * Stops the observation process if it is currently running.
     */
    stopObserving(): void;
}
