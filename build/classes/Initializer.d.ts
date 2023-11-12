import { IAppEvents, IEventEmitter, IEventService, IFormManager, IFormObserver, IInitializer, IOptions, IStateManager, ISubmitHandler } from "../interfaces";
/**
 * Initializer class responsible for setting up the form validation system.
 * It initializes form management, starts observing for form changes, and sets up submit handlers.
 */
export declare class Initializer implements IInitializer {
    private readonly _options;
    private readonly _formManager;
    private readonly _formObserver;
    private readonly _eventService;
    private readonly _stateManager;
    private readonly _eventEmitter;
    /**
     * Creates an instance of Initializer.
     * @param {IOptions} _options - Configuration options.
     * @param {IFormManager} _formManager - The form manager to handle form-related operations.
     * @param {IFormObserver} _formObserver - Observer for monitoring form changes.
     * @param {IEventService} _eventService - Service for managing events related to forms.
     * @param {IStateManager} _stateManager - State manager for form states.
     * @param {IEventEmitter<IAppEvents>} _eventEmitter - Event emitter for application-level events.
     */
    constructor(_options: IOptions, _formManager: IFormManager, _formObserver: IFormObserver, _eventService: IEventService, _stateManager: IStateManager, _eventEmitter: IEventEmitter<IAppEvents>);
    /**
     * Initializes the form system. This includes starting the form observer and initializing the form manager.
     * Emits an "Initialized" event upon completion.
     * @returns {Promise<IFormManager>} The initialized FormManager instance.
     */
    init(): Promise<IFormManager>;
    /**
     * Handles tasks to be performed once the DOM is fully loaded.
     * This includes starting form observation and initiating the form manager.
     */
    private onDOMLoaded;
    /**
     * Sets a custom submit handler for a specific form.
     * If the form is already managed, the handler is set immediately.
     * Otherwise, the handler is queued for later assignment.
     * @param {string} formName - The name of the form to set the submit handler for.
     * @param {ISubmitHandler} handler - The submit handler function to be set.
     * @returns {Promise<void>}
     */
    setSubmitHandler(formName: string, handler: ISubmitHandler): Promise<void>;
}
