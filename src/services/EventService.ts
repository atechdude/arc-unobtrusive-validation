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
    IStateManager,
    IValidationService
} from "../interfaces";

@injectable()

/**
 * Manages event listeners for form controls and coordinates with validation and state management services.
 */
export class EventService implements IEventService {
    eventListenersMap: WeakMap<Element, Record<string, EventListener>> =
        new WeakMap();
    dirtyMap: { [key: string]: boolean } = {};
    debouncers: { [key: string]: Debouncer } = {};
    private validationInProgress: Set<string> = new Set();
    /**
     * Initializes a new instance of the EventService.
     * @param {IObservableCollection<IForm>} _observableFormsCollection - Collection of observable forms.
     * @param {IDebouncerFactory} _debounceFactory - Factory for creating debouncers.
     * @param {IValidationService} _validationService - Service for performing validation.
     * @param {IStateManager} _stateManager - State manager to track control dirty state.
     * @param {IDebouncerManager} _debouncerManager - Manager for debouncing validation calls.
     * @param {IDecoratedLogger} _logger - Logger for diagnostic messages.
     */
    constructor(
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
     * Reacts to notifications about form collection changes, setting up or cleaning up event listeners as necessary.
     * @param {IChange<IForm>} change - The change notification object containing the type of change and the form affected.
     */
    async notify(change: IChange<IForm>): Promise<void> {
        console.log("EventService notify");
        const { type: changeType, item: form } = change;

        if (changeType !== "add" || !form.formElement) {
            return;
        }
        // Cleanup any previous resources for the form.
        // This might be required to handle re-adding a form that was removed without proper cleanup.
        await this.cleanupResourcesForForm(form.formElement);

        // Setup the handlers for the form
        this.setupHandlers(form);

        // Add the listeners to the form.
        // Note: It might be a good idea to check if the form element has already listeners attached.
        // If listeners exist, you may not need to add them again or you might want to update them.
        const listeners = this.eventListenersMap.get(change.item.formElement);
        if (listeners) {
            await this.addListeners(form, listeners);
        }
    }
    /**
     * Sets up event handlers for all controls in the specified form.
     * @param {IForm} form - The form for which to set up event handlers.
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
                const focusEventHandler = this.focusEventHandler;

                // Accumulate listeners instead of re-initializing them
                listeners["input"] = inputEventHandler as EventListener;
                listeners["focus"] = focusEventHandler as EventListener;
                listeners["blur"] = blurEventHandler as EventListener;
            }
        });

        // Set the accumulated listeners for the form element after the loop
        this.eventListenersMap.set(form.formElement, listeners);
    }

    createInputHandler(debounceTime: number): EventListener {
        return (event: Event) => {
            const control = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

            // Check if the value has changed from the initial value to mark as dirty.
            if (this._stateManager.hasValueChanged(control.name, control.value)) {
                this._stateManager.makeControlDirty(control.name);
                // Reset the validated state since the value has changed.
                this._stateManager.clearControlValidatedState(control.name);
                // Update the initial value to the new value
                this._stateManager.setInitialValue(control.name, control.value);
                this.debouncedValidate(control, debounceTime);
            }
        };
    }


    createBlurHandler(): EventListener {
        return async (event: Event) => {
            console.log("Executing blur handler");

            const focusEvent = event as FocusEvent;
            const target = focusEvent.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const relatedTarget = focusEvent.relatedTarget as Element;

            // Check if the related target is within the same form as the target.
            if (!relatedTarget || !target.form?.contains(relatedTarget)) {
                console.log("Focus moved outside the form or to a non-focusable element. Canceling blur validation.");
                return;
            }


            // Only proceed with blur validation if the control is dirty (value changed)
            // and has not been previously validated since the last change.
            if (this._stateManager.isControlDirty(target.name) && !this._stateManager.isControlValidated(target.name)) {
                try {
                    await this._validationService.validateControl(target);

                    // After validation, clear the dirty state and mark the control as validated.
                    this._stateManager.clearControlDirtyState(target.name);
                    this._stateManager.setControlValidated(target.name);
                } catch (error) {
                    this._logger.getLogger().error(
                        error instanceof Error ? error : new Error("Error in blurEventHandler: " + error)
                    );
                }
            } else {
                console.log(`Skipping validation for ${target.name} as it hasn't changed or has been previously validated.`);
            }
        };
    }

    /**
     * Handles the focus event, which can be useful for adding some CSS styling or other focus-related logic.
     * @param {Event} event - The focus event object.
     */
    focusEventHandler(event: Event): void { }

    /**
     * Performs a debounced validation on the specified control.
     * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} input - The control to validate.
     * @param {number} debounceTime - The debounce time in milliseconds.
     */
    debouncedValidate(
        input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
        debounceTime: number
    ): void {
        //// Set the flag when validation starts
        //this.validationInProgress.add(input.name);

        this._debouncerManager
            .getDebouncerForControl(input.name)
            .debounce(async () => {
                try {
                    // Add a CSS class to indicate validation is in progress
                   // input.classList.add("validating");

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
                } finally {
                    // Remove the CSS class once validation is complete
                    //input.classList.remove("validating");
                    //// Clear the flag when validation is done
                    //this.validationInProgress.delete(input.name);
                }
            }, debounceTime);
    }

    /**
     * Adds event listeners to the form based on the specified eventListeners record.
     * @param {IForm} form - The form to which event listeners should be added.
     * @param {Record<string, EventListener>} eventListeners - A record of event types and corresponding listeners.
     * @returns {Promise<IForm>} - The form with listeners added.
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
