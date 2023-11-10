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
 * Manages event handling for form validation, including setting up and removing listeners, and debouncing validation calls.
 */
@injectable()
export class EventService implements IEventService {
    eventListenersMap: WeakMap<Element, Record<string, EventListener>> =
        new WeakMap();
    dirtyMap: { [key: string]: boolean } = {};
    debouncers: { [key: string]: Debouncer } = {};


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
     * Responds to changes in the form collection, such as when a form is added.
     * @param {IChange<IForm>} change - The object describing the change that occurred in the form collection.
     * @returns {Promise<void>}
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
        this.setupHandlers(form);

        // Add Listeners for the form
        const listeners = this.eventListenersMap.get(change.item.formElement);
        if (listeners) {
            await this.addListeners(form, listeners);
        }
    }
    /**
     * Attaches event listeners to a form based on a provided map of event types and listeners.
     * @param {IForm} form - The form to attach listeners to.
     * @param {Record<string, EventListener>} eventListeners - A record of event types and their corresponding event listeners.
     * @returns {Promise<IForm>} - The form with the event listeners attached.
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
     * Sets up event handlers for all interactive elements within a form.
     * @param {IForm} form - The form for which event handlers are to be set up.
     */
    setupHandlers(form: IForm): void {
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
                if (this._options.useDefaultFormSubmitter) {
                    const submitEventHandler = this.createSubmitHandler(form);
                    listeners["submit"] = submitEventHandler as EventListener;
                }



                // Accumulate listeners instead of re-initializing them
                listeners["input"] = inputEventHandler as EventListener;
                listeners["focus"] = focusEventHandler as EventListener;
                listeners["blur"] = blurEventHandler as EventListener;

            }
        });

        // Set the accumulated listeners for the form element after the loop
        this.eventListenersMap.set(form.formElement, listeners);
    }

    /**
     * Creates a submit event handler for the form. Please note that this handler is only used if the useDefaultFormSubmitter option is set to true, which is the default.
     * @param {IForm} form - The form for which to create the submit handler.
     * @returns {EventListener} - An event listener that handles the submit event for the form.
     */
    createSubmitHandler(form: IForm): EventListener {
        return async (event: Event) => {
            if (this._options.useDefaultFormSubmitter) {
                event.preventDefault();
            }
            // Perform validation before submission
            const isFormValid = await this._validationService.validateForm(form);

            if (isFormValid) {

                if (this._options.useDefaultFormSubmitter) {
                    form.formElement.submit();
                } else {
                    const validationEvent = new CustomEvent("form-valid", {
                        detail: form,
                        bubbles: true, // This allows the event to bubble up through the DOM
                        cancelable: true // This allows the event to be cancelable

                    });
                    form.formElement.dispatchEvent(validationEvent);
                }
            }
            else {
                // Form is invalid
                const validationEvent = new CustomEvent("form-invalid", {
                    detail: form,
                    bubbles: true, // This allows the event to bubble up through the DOM
                    cancelable: true // This allows the event to be cancelable
                });

                form.formElement.dispatchEvent(validationEvent);
            }
        };
    }
    /**
     * Creates a debounced event handler for input events on form controls.
     * @param {number} debounceTime - The time in milliseconds to wait before triggering the validation after the last input event.
     * @returns {EventListener}
     */
    createInputHandler(debounceTime: number): EventListener {
        return (event: Event) => {
            const control = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

            // Mark the control as interacted upon user input. Dont confuse focus with input people.
            this._stateManager.makeControlInteracted(control.name);

            // Check if the value has changed from the initial value to mark as dirty.
            if (this._stateManager.hasValueChanged(control.name, control.value)) {
                this._stateManager.makeControlDirty(control.name);
                // Reset the validated state since the value has changed.
                this._stateManager.clearControlValidatedState(control.name);
                // Debounce the validation logic to avoid excessive validation calls
                this.debouncedValidate(control, debounceTime);
            }

            // You may want to always set the initial value when the control is first interacted with
            // This can be done when the form is first loaded or here if not done previously
            if (!this._stateManager.hasInitialValue(control.name)) {
                this._stateManager.setInitialValue(control.name, control.value);
            }
        };
    }
    /**
     * Creates a blur event handler for form controls.
     * The handler triggers validation under certain conditions when the control loses focus.
     * @returns {EventListener} An event listener that handles the blur event for a form control.
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
     * Creates a focus event handler for form controls.
     * Currently, this handler does not perform any action, but it is set up for future enhancements.
     * @returns {EventListener} An event listener that handles the focus event for a form control.
     */
    createFocusHandler(): EventListener {
        return async (event: Event) => { };
    }

    /**
     * Validates a control with a debounced call to prevent excessive validation triggers during user input.
     * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} input - The control to validate.
     * @param {number} debounceTime - The time in milliseconds to debounce the validation calls.
     */
    debouncedValidate(
        input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
        debounceTime: number
    ): void {
        this._debouncerManager
            .getDebouncerForControl(input.name)
            .debounce(async () => {
                try {
                    this._logger.getLogger().info(`Debouncing ${input.name}`);
                    await this._validationService.validateControl(
                        input as HTMLInputElement
                    );
                } catch (error) {
                    this._logger
                        .getLogger()
                        .error(
                            error instanceof Error
                                ? error
                                : new Error(
                                    `Error in debouncedValidate for control ${input.name}: ${error}`
                                )
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
