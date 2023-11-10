import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IDecoratedLogger, IFormManager } from "../interfaces";
/**
 * Observes the DOM for changes and notifies the FormManager when form elements are added or removed.
 */
@injectable()
export class FormObserver {
    private mutationObserver: MutationObserver | null = null;
    /**
     * Creates a FormObserver instance with dependencies injected for form management and logging.
     * @param {IFormManager} _formManager - The form manager that will handle form-related mutations.
     * @param {IDecoratedLogger} _logger - The logger for logging messages and errors.
     */
    constructor(
        @inject(TYPES.FormManager) private readonly _formManager: IFormManager,
        @inject(TYPES.DebuggingLogger)
        private readonly _logger: IDecoratedLogger
    ) {}
    /**
     * Starts the observation process for form elements within the body of the document.
     * If an observer is already running, it disconnects before starting a new one.
     */
    startObserving(): void {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        this.mutationObserver = new MutationObserver((mutationsList) => {
            // Let the FormManager handle the mutations
            this._formManager.handleFormMutations(mutationsList);
        });

        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    /**
     * Stops the observation process if it is currently running.
     */
    public stopObserving(): void {
        this.mutationObserver?.disconnect();
    }
}
