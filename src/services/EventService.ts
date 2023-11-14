import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { Debouncer } from "../utils/Debouncer";
import {
    IChange,
    IDebouncerFactory,
    IDebouncerManager,
    IDecoratedLogger,
    IEventService,
    IForm,
    IObservableCollection,
    IOptions,
    IStateManager,
    IValidationService
} from "../interfaces";
/**
 * Manages event handling and validation for forms.
 * Observes form collection changes and applies necessary event listeners
 * and validation logic to forms and their controls.
 */
@injectable()
export class EventService implements IEventService {
    eventListenersMap: WeakMap<Element, Record<string, EventListener>> =
        new WeakMap();
    dirtyMap: { [key: string]: boolean } = {};
    debouncers: { [key: string]: Debouncer } = {};

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
    constructor(
        @inject(TYPES.Options) private readonly _options: IOptions,
        @inject(TYPES.ObservableFormsCollection)
        private readonly _observableFormsCollection: IObservableCollection<IForm>,
        @inject(TYPES.DebouncerFactory)
        private readonly _debounceFactory: IDebouncerFactory,
        @inject(TYPES.ValidationService)
        private readonly _validationService: IValidationService,
        @inject(TYPES.StateManager)
        private readonly _stateManager: IStateManager,
        @inject(TYPES.DebouncerManager)
        private readonly _debouncerManager: IDebouncerManager,
        @inject(TYPES.DebuggingLogger)
        private readonly _logger: IDecoratedLogger
    ) {
        this._observableFormsCollection.addObserver(this);
    }
    /**
     * Responds to changes in the form collection. Sets up or removes event handlers as needed.
     * @param {IChange<IForm>} change - The change object describing what has changed in the form collection.
     */
    async notify(change: IChange<IForm>): Promise<void> {
        const { type: changeType, item: form } = change;

        if (changeType !== "add" || !form.formElement) {
            return;
        }

        // Cleanup any previous resources for the form.
        // This might be required to handle re-adding a form that was removed without proper cleanup.
        await this.cleanupResourcesForForm(form.formElement);

        // Setup the handlers for the form
        await this.setupHandlers(form);

        // Add Listeners for the form
        const listeners = this.eventListenersMap.get(change.item.formElement);
        if (listeners) {
            await this.addListeners(form, listeners);
        }
    }

    /**
     * Sets up event handlers for all interactive elements within a form.
     * @param {IForm} form - The form for which to set up event handlers.
     */
    async setupHandlers(form: IForm): Promise<void> {
        this._logger.getLogger().info("Setting up handlers for form: " + form.name);

        // Loop over each control in the form
        const controls = Array.from(form.elements);

        // Initialize listeners outside the loop
        const listeners: Record<string, EventListener> = {};

        controls.forEach((element) => {
            if (
                element instanceof HTMLInputElement ||
                element instanceof HTMLTextAreaElement ||
                element instanceof HTMLSelectElement
            ) {
                // Add the event handlers for the control
                const inputEventHandler = this.createInputHandler(500);
                const blurEventHandler = this.createBlurHandler();
                const focusEventHandler = this.createFocusHandler();

                // Accumulate listeners instead of re-initializing them
                listeners["input"] = inputEventHandler as EventListener;
                listeners["focus"] = focusEventHandler as EventListener;
                listeners["blur"] = blurEventHandler as EventListener;

            }
        });

        // Add the submit handler for the form
        const submitEventHandler = this.createSubmitHandler(form);
        listeners["submit"] = submitEventHandler as EventListener;


        // Set the accumulated listeners for the form element after the loop
        this.eventListenersMap.set(form.formElement, listeners);
    }
    /**
     * Attaches event listeners to a form based on a provided map of event types and listeners.
     * Listeners for 'focus' and 'blur' events are specially handled to use 'focusin' and 'focusout' respectively.
     * This ensures better event capturing, especially useful for dynamically added content.
     * @param {IForm} form - The form to which event listeners are to be attached.
     * @param {Record<string, EventListener>} eventListeners - A record mapping event types to their corresponding event listeners.
     * @returns {Promise<IForm>} - The form with event listeners attached, useful for chaining or further processing.
     */
    private async addListeners(
        form: IForm,
        eventListeners: Record<string, EventListener>
    ): Promise<IForm> {
        // Add event listeners and store them in the map
        for (const [eventType, listener] of Object.entries(eventListeners)) {
            if (eventType === "focus") {
                // For focus, you might want to listen to focusin event instead
                form.formElement.addEventListener("focusin", listener);
            } else if (eventType === "blur") {
                // For blur, you might want to listen to focusout event instead
                form.formElement.addEventListener("focusout", listener);
            } else {
                // For other events, add them normally
                form.formElement.addEventListener(eventType, listener);
            }
        }
        return form;
    }


    /**
     * Creates a submit event handler for a form. Uses a custom submit handler if provided, otherwise defaults to standard form submission.
     * @param {IForm} form - The form for which to create the submit handler.
     * @returns {EventListener} The event listener handling the submit event.
     */
    createSubmitHandler(form: IForm): EventListener {
        this._logger.getLogger().info("Creating Submit Handler");


        return async (event: Event) => {
            event.preventDefault();

            // Run validation on the form
            const isValid = await this._validationService.validateForm(form);

            // Add isValid flag to the form element
            form.formElement.isValid = isValid;

            // Check if a custom submit handler has been provided
            if (form.submitHandler) {
                // Call the custom submit handler and pass the form element
                await form.submitHandler(form.formElement, isValid);
            } else {
                // If no custom handler, proceed with default form submission
                if (isValid && this._options.useDefaultFormSubmitter) {
                    form.formElement.submit();
                }
                // Optionally, handle the case where the form is not valid
            }
        };
    }

    /**
     * Creates an event listener for handling input events on form controls.
     * The listener marks the control as interacted with, checks for value changes,
     * and triggers validation based on the control type and debounce settings.
     * @param {number} debounceTime - The time in milliseconds to wait before triggering validation after the last input event for debouncable controls.
     * @returns {EventListener} An event listener function that handles input events.
     */
    createInputHandler(debounceTime: number): EventListener {
        return (event: Event) => {
            const control = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

            // Mark the control as interacted upon user input.
            this._stateManager.makeControlInteracted(control.name);

            // Check if the value has changed from the initial value to mark as dirty.
            if (this._stateManager.hasValueChanged(control.name, control.value)) {
                this._stateManager.makeControlDirty(control.name);
                // Reset the validated state since the value has changed.
                this._stateManager.clearControlValidatedState(control.name);

                // Define a common validation logic
                const validateControl = async () => {
                    await this.validateAndHandleControl(control);
                };

                // Debounce the validation logic for text-based controls
                if (control.type === "text" || control.type === "textarea" || control.type === "email" || control.type === "password") {
                    this.debouncedValidate(control, debounceTime, validateControl);
                } else {
                    // For other types (checkbox, radio, select, etc.), validate immediately
                    validateControl();
                }
            }

            // Set the initial value when the control is first interacted with
            if (!this._stateManager.hasInitialValue(control.name)) {
                this._stateManager.setInitialValue(control.name, control.value);
            }
        };
    }

    /**
     * Creates an event listener for blur events on form controls.
     * This handler triggers validation when a control loses focus under certain conditions.
     * It checks if the control losing focus (or its related target) is within the same form and validates if necessary.
     * Controls are validated if they are dirty (changed) and not yet validated, or if they have been interacted with.
     * @returns {EventListener} An event listener that handles the blur event for form controls.
     */
    createBlurHandler(): EventListener {
        return async (event: Event) => {
            const focusEvent = event as FocusEvent;
            const target = focusEvent.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const relatedTarget = focusEvent.relatedTarget as Element;

            // Check if the related target is not within the same form as the target or if it's non-focusable.
            if (!relatedTarget || !target.form?.contains(relatedTarget)) {

                // If the control is dirty and not yet validated, validate it.
                if (this._stateManager.isControlDirty(target.name) && !this._stateManager.isControlValidated(target.name)) {
                    await this.validateAndHandleControl(target);
                }
                return;
            }

            // Proceed with validation if the control is dirty or interacted with.
            if (this._stateManager.isControlDirty(target.name) || this._stateManager.isControlInteracted(target.name)) {
                await this.validateAndHandleControl(target);
            }
        };
    }
    /**
     * Creates an event listener for focus events on form controls.
     * Currently, this handler does not perform any specific action upon receiving a focus event.
     * It is set up for potential future enhancements where focus-related logic might be required.
     * @returns {EventListener} An event listener that handles the focus event for form controls.
     *                          Currently, it performs no action.
     */
    createFocusHandler(): EventListener {
        return async (event: Event) => { };
    }

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
    debouncedValidate(
        control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
        debounceTime: number,
        validateControl: () => Promise<void>
    ): void {
        this._debouncerManager
            .getDebouncerForControl(control.name)
            .debounce(async () => {
                try {
                    // Log before starting the debounced validation
                    this._logger.getLogger().info(`Debouncing validation for ${control.name}`);

                    // Execute the validation logic
                    await validateControl();

                    // Optionally, log successful validation
                    this._logger.getLogger().info(`Validation successful for ${control.name}`);
                } catch (error) {
                    // Handle and log any errors that occur during validation
                    this._logger.getLogger().error(
                        error instanceof Error
                            ? error
                            : new Error(`Error during debounced validation for control ${control.name}: ${String(error)}`)
                    );
                }
            }, debounceTime);
    }

    /**
     * Removes all event listeners from the specified form element.
     * @param {HTMLFormElement} formElement - The form element from which to remove event listeners.
     */
    async removeListeners(formElement: HTMLFormElement): Promise<void> {
        const listeners = this.eventListenersMap.get(formElement);
        if (listeners) {
            for (const [eventType, listener] of Object.entries(listeners)) {
                // Ensure the listener is a function before attempting to remove
                if (typeof listener === "function") {
                    // Correctly map the event type for focus and blur
                    const domEventType =
                        eventType === "focus"
                            ? "focusin"
                            : eventType === "blur"
                                ? "focusout"
                                : eventType;
                    formElement.removeEventListener(domEventType, listener);
                }
            }
            this.eventListenersMap.delete(formElement);
        }
    }

    /**
     * Cleans up resources associated with the specified form element.
     * This involves removing event listeners and clearing any associated state.
     * @param {HTMLFormElement} formElement - The form element for which to clean up resources.
     */
    async cleanupResourcesForForm(formElement: HTMLFormElement): Promise<void> {
        await this.removeListeners(formElement);
        const controls = formElement.elements;
        const namesToClear = Array.from(controls)
            .filter(isNamedControlElement)
            .map((control) => control.name);

        this._stateManager.clearControlsDirtyState(namesToClear);
        this._debouncerManager.clearDebouncersForControls(namesToClear);
    }

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
    async validateAndHandleControl(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): Promise<void> {
        try {
            await this._validationService.validateControl(control);

            // After validation, clear the dirty state and mark the control as validated.
            this._stateManager.clearControlDirtyState(control.name);
            this._stateManager.setControlValidated(control.name);
        } catch (error) {
            this._logger.getLogger().error(
                error instanceof Error ? error : new Error("Error in blurEventHandler: " + error)
            );
        }
    }
}

/**
 * Determines if an element has a 'name' property and is an input, select, or textarea element.
 * @param {Element} element - The element to check.
 * @returns {boolean} - True if the element is a named control element, false otherwise.
 */
function isNamedControlElement(
    element: Element
): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
    return (
        "name" in element &&
        (element instanceof HTMLInputElement ||
            element instanceof HTMLSelectElement ||
            element instanceof HTMLTextAreaElement)
    );
}
