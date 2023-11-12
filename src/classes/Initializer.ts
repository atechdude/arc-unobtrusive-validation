import { inject, injectable } from "inversify";

import {
    IAppEvents,
    IEventEmitter,
    IEventService,
    IFormManager,
    IFormObserver,
    IInitializer,
    IOptions,
    IStateManager,
    ISubmitHandler
} from "../interfaces";
import { TYPES } from "../di/container-types";
/**
 * Initializer class responsible for setting up the form validation system.
 * It initializes form management, starts observing for form changes, and sets up submit handlers.
 */
@injectable()
export class Initializer implements IInitializer {
    /**
     * Creates an instance of Initializer.
     * @param {IOptions} _options - Configuration options.
     * @param {IFormManager} _formManager - The form manager to handle form-related operations.
     * @param {IFormObserver} _formObserver - Observer for monitoring form changes.
     * @param {IEventService} _eventService - Service for managing events related to forms.
     * @param {IStateManager} _stateManager - State manager for form states.
     * @param {IEventEmitter<IAppEvents>} _eventEmitter - Event emitter for application-level events.
     */
    constructor(
        @inject(TYPES.Options) private readonly _options: IOptions,
        @inject(TYPES.FormManager) private readonly _formManager: IFormManager,
        @inject(TYPES.FormObserver)
        private readonly _formObserver: IFormObserver,
        @inject(TYPES.EventService)
        private readonly _eventService: IEventService,
        @inject(TYPES.StateManager)
        private readonly _stateManager: IStateManager,
        @inject(TYPES.EventEmitter)
        private readonly _eventEmitter: IEventEmitter<IAppEvents>
    ) { }

    /**
     * Initializes the form system. This includes starting the form observer and initializing the form manager.
     * Emits an "Initialized" event upon completion.
     * @returns {Promise<IFormManager>} The initialized FormManager instance.
     */
    async init(): Promise<IFormManager> {
        // If the DOM is already loaded
        if (document.readyState === "loading") {
            // The document is still loading, add an event listener
            document.addEventListener("DOMContentLoaded", () => {
                this.onDOMLoaded();
            });
        } else {
            // The DOM is already loaded
            await this.onDOMLoaded();
        }

        this._eventEmitter.emit("Initialized", {
            source: "Initializer",
            message: "System Intialized"
        });
        return this._formManager; // Return the FormManager instance
    }

    /**
     * Handles tasks to be performed once the DOM is fully loaded.
     * This includes starting form observation and initiating the form manager.
     */
    private async onDOMLoaded(): Promise<void> {
        this._formObserver.startObserving();
        this._formManager.init();
    }

    /**
     * Sets a custom submit handler for a specific form.
     * If the form is already managed, the handler is set immediately.
     * Otherwise, the handler is queued for later assignment.
     * @param {string} formName - The name of the form to set the submit handler for.
     * @param {ISubmitHandler} handler - The submit handler function to be set.
     * @returns {Promise<void>}
     */
    async setSubmitHandler(formName: string, handler: ISubmitHandler): Promise<void> {
        if (!this._formManager) {
            console.error("FormManager is not initialized");
            return;
        }

        const form = this._formManager.getFormByName(formName);
        if (form) {
            form.submitHandler = handler;
        } else {
            // Queue the handler for later assignment using EventService
            this._eventService.queueSubmitHandler(formName, handler);
        }
    }
}
