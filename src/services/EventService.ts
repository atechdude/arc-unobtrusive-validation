import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
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
import { Debouncer } from "../util/Debouncer";
@injectable()

// TODO: Create Interface and setup container.
export class EventService implements IEventService {
    eventListenersMap: WeakMap<Element, Record<string, EventListener>> =
        new WeakMap();
    dirtyMap: { [key: string]: boolean } = {};
    debouncers: { [key: string]: Debouncer } = {};

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
        console.log("EventService constructor");
        this._observableFormsCollection.addObserver(this);
    }

    // Add Listeners When We Get a Notification of a New Form
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
            const control = event.target as
                | HTMLInputElement
                | HTMLTextAreaElement
                | HTMLSelectElement;
            this._stateManager.makeControlDirty(control.name);
            this.debouncedValidate(control, debounceTime);
        };
    }

    createBlurHandler(): EventListener {
        return (event: Event) => {
            // Immediately Invoked Function Expression (IIFE)
            (async (event: Event) => {
                const focusEvent = event as FocusEvent;
                const target = focusEvent.target as
                    | HTMLInputElement
                    | HTMLTextAreaElement
                    | HTMLSelectElement;
                const relatedTarget = focusEvent.relatedTarget as HTMLElement;

                if (
                    relatedTarget &&
                    (relatedTarget.tagName === "INPUT" ||
                        relatedTarget.tagName === "SELECT" ||
                        relatedTarget.tagName === "TEXTAREA" ||
                        relatedTarget.isContentEditable)
                ) {
                    this._stateManager.makeControlDirty(target.name);
                    try {
                        await this._validationService.validateControl(
                            target as HTMLInputElement
                        );
                    } catch (error) {
                        this._logger
                            .getLogger()
                            .error(
                                error instanceof Error
                                    ? error
                                    : new Error(
                                        "Error in blurEventHandler: " + error
                                    )
                            );
                    }
                }
            })(event).catch((e) => {
                // Handle any errors that occurred during initialization
                this._logger.getLogger().error("Error in IIFE: " + e);
            });
        };
    }
    // Non-debounced focus event handler ("Useful for adding some CSS stuff.")
    focusEventHandler(event: Event): void {}

    debouncedValidate(
        input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
        debounceTime: number
    ): void {
        this._debouncerManager
            .getDebouncerForControl(input.name)
            .debounce(async () => {
                try {
                    console.log(`Debouncing ${input.name}`);
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

    // Add the listeners to the form
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
 *
 * @param element
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
