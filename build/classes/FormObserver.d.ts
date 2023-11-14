import { IDecoratedLogger } from "../interfaces";
/**
 * Observes the DOM for changes and notifies the FormManager when form elements are added or removed.
 */
export declare class FormObserver {
    private readonly _logger;
    private mutationObserver;
    constructor(_logger: IDecoratedLogger);
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
