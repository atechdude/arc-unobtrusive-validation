import { Debouncer } from "../utils/Debouncer";
import { IChange, IDebouncerFactory, IDebouncerManager, IDecoratedLogger, IEventService, IForm, IObservableCollection, IOptions, IStateManager, ISubmitHandler, IValidationService } from "../interfaces";
/**
 * Manages event handling and validation for forms.
 * Observes form collection changes and applies necessary event listeners
 * and validation logic to forms and their controls.
 */
export declare class EventService implements IEventService {
    private readonly _options;
    private readonly _observableFormsCollection;
    private readonly _debounceFactory;
    private readonly _validationService;
    private readonly _stateManager;
    private readonly _debouncerManager;
    private readonly _logger;
    eventListenersMap: WeakMap<Element, Record<string, EventListener>>;
    dirtyMap: {
        [key: string]: boolean;
    };
    debouncers: {
        [key: string]: Debouncer;
    };
    private pendingSubmitHandlers;
    /**
     * Initializes a new instance of the EventService.
     * @param {IOptions} _options - The configuration options for the service.
     * @param {IObservableCollection<IForm>} _observableFormsCollection - The collection of observable forms.
     * @param {IDebouncerFactory} _debounceFactory - The factory for creating debouncers.
     * @param {IValidationService} _validationService - The service for performing validation.
     * @param {IStateManager} _stateManager - The manager for form control states.
     * @param {IDebouncerManager} _debouncerManager - The manager for debouncers.
     * @param {IDecoratedLogger} _logger - The logger for logging information and errors.
     */
    constructor(_options: IOptions, _observableFormsCollection: IObservableCollection<IForm>, _debounceFactory: IDebouncerFactory, _validationService: IValidationService, _stateManager: IStateManager, _debouncerManager: IDebouncerManager, _logger: IDecoratedLogger);
    /**
     * Responds to changes in the form collection. Sets up or removes event handlers as needed.
     * @param {IChange<IForm>} change - The change object describing what has changed in the form collection.
     */
    notify(change: IChange<IForm>): Promise<void>;
    /**
     * Sets up event handlers for all interactive elements within a form.
     * @param {IForm} form - The form for which to set up event handlers.
     */
    setupHandlers(form: IForm): Promise<void>;
    /**
     * Attaches event listeners to a form based on a provided map of event types and listeners.
     * Listeners for 'focus' and 'blur' events are specially handled to use 'focusin' and 'focusout' respectively.
     * This ensures better event capturing, especially useful for dynamically added content.
     * @param {IForm} form - The form to which event listeners are to be attached.
     * @param {Record<string, EventListener>} eventListeners - A record mapping event types to their corresponding event listeners.
     * @returns {Promise<IForm>} - The form with event listeners attached, useful for chaining or further processing.
     */
    private addListeners;
    /**
     * Creates a submit event handler for a form. Uses a custom submit handler if provided, otherwise defaults to standard form submission.
     * @param {IForm} form - The form for which to create the submit handler.
     * @returns {EventListener} The event listener handling the submit event.
     */
    createSubmitHandler(form: IForm): EventListener;
    /**
     * Creates an event listener for handling input events on form controls.
     * The listener marks the control as interacted with, checks for value changes,
     * and triggers validation based on the control type and debounce settings.
     * @param {number} debounceTime - The time in milliseconds to wait before triggering validation after the last input event for debouncable controls.
     * @returns {EventListener} An event listener function that handles input events.
     */
    createInputHandler(debounceTime: number): EventListener;
    /**
     * Creates an event listener for blur events on form controls.
     * This handler triggers validation when a control loses focus under certain conditions.
     * It checks if the control losing focus (or its related target) is within the same form and validates if necessary.
     * Controls are validated if they are dirty (changed) and not yet validated, or if they have been interacted with.
     * @returns {EventListener} An event listener that handles the blur event for form controls.
     */
    createBlurHandler(): EventListener;
    /**
     * Creates an event listener for focus events on form controls.
     * Currently, this handler does not perform any specific action upon receiving a focus event.
     * It is set up for potential future enhancements where focus-related logic might be required.
     * @returns {EventListener} An event listener that handles the focus event for form controls.
     *                          Currently, it performs no action.
     */
    createFocusHandler(): EventListener;
    /**
     * Initiates a debounced validation for a given form control. This method is designed to limit the rate
     * at which validation logic is executed, improving performance for controls that trigger validation
     * on frequent events, like typing in a text field.
     *
     * The validation is deferred until the specified debounce time has elapsed since the last invocation.
     * This prevents over-validation when the user is actively interacting with the control (e.g., typing).
     * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} input - The control to be validated.
     *        This can be any input, textarea, or select element.
     * @param control
     * @param {number} debounceTime - The time in milliseconds to wait before the validation is triggered
     *        after the last input event.
     * @param validateControl
     */
    debouncedValidate(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, debounceTime: number, validateControl: () => Promise<void>): void;
    /**
     * Sets a custom submit handler for a specific form identified by its name.
     * If the form is already present in the collection, the handler is attached immediately.
     * Otherwise, the handler is queued and will be applied when the form becomes available.
     * @param {string} formName - The name of the form to set the submit handler for.
     * @param {ISubmitHandler} handler - The custom submit handler to be applied to the form.
     */
    setSubmitHandler(formName: string, handler: ISubmitHandler): void;
    /**
     * Queues a submit handler for later application to a form.
     * This method is used to provisionally store a handler for a form that may not yet be present in the collection.
     * @param {string} formName - The name of the form for which to queue the submit handler.
     * @param {ISubmitHandler} handler - The submit handler to be queued for later application.
     */
    queueSubmitHandler(formName: string, handler: ISubmitHandler): void;
    /**
     * Clears any queued or assigned submit handler for a specific form identified by its name.
     * This is useful for cleaning up or resetting the form's custom submission logic.
     * @param {string} formName - The name of the form whose submit handler needs to be cleared.
     */
    clearSubmitHandler(formName: string): void;
    /**
     * Applies a queued submit handler to a form if one exists.
     * This is an internal method typically called when a new form is added to ensure any pending handlers are applied.
     * @param {IForm} form - The form to which a queued submit handler may be applied.
     * @returns {Promise<void>}
     */
    private applyPendingSubmitHandlers;
    /**
     * Removes all event listeners from the specified form element.
     * @param {HTMLFormElement} formElement - The form element from which to remove event listeners.
     */
    removeListeners(formElement: HTMLFormElement): Promise<void>;
    /**
     * Cleans up resources associated with the specified form element.
     * This involves removing event listeners and clearing any associated state.
     * @param {HTMLFormElement} formElement - The form element for which to clean up resources.
     */
    cleanupResourcesForForm(formElement: HTMLFormElement): Promise<void>;
    /**
     * Validates a specified control and handles its post-validation state.
     * This method is called during various event handlers (like blur) to perform validation on the control.
     * If the validation is successful, it clears the control's dirty state and marks it as validated.
     * In case of an error during validation, the error is logged.
     * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} control - The control to validate.
     *        Can be any input, textarea, or select element.
     * @returns {Promise<void>} A promise that resolves when the validation and subsequent state update are complete.
     * @throws {Error} Throws an error if the validation process encounters an issue.
     */
    validateAndHandleControl(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): Promise<void>;
}
