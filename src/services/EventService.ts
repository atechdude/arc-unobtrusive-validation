import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IChange, IDebouncerFactory, IDebouncerManager, IDecoratedLogger, IForm, IObservableCollection, IStateManager, IValidationService } from "../interfaces";
import { Debouncer } from "../util/Debouncer";
@injectable()

// TODO: Create Interface and setup container.
export class EventService {
    eventListenersMap: WeakMap<Element, Record<string, EventListener>> = new WeakMap();
    dirtyMap: { [key: string]: boolean } = {};
    debouncers: { [key: string]: Debouncer } = {};

    constructor(
        @inject(TYPES.ObservableFormsCollection) private readonly _observableFormsCollection: IObservableCollection<IForm>,
        @inject(TYPES.DebouncerFactory) private readonly _debounceFactory: IDebouncerFactory,
        @inject(TYPES.ValidationService) private readonly _validationService: IValidationService,
        @inject(TYPES.StateManager) private readonly _stateManager: IStateManager,
        @inject(TYPES.DebouncerManager) private readonly _debouncerManager: IDebouncerManager,
        @inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger){

        this._observableFormsCollection.addObserver(this);
    }

    // Add Listeners When We Get a Notification of a New Form
    async notify(change: IChange<IForm>): Promise<void> {
        // Return early if the change is not an addition or the item is not an HTMLFormElement.
        if (!("item" in change) || change.type !== "add" || !(change.item instanceof HTMLFormElement)) {
            return;
        }

        // Now we are sure that we have an 'add' change and the item is an HTMLFormElement.
        // Setup the event handlers for the form
        this.setupHandlers(change.item);

        // Cleanup any previous resources for the form, even though it's a new addition.
        // This might be required to handle re-adding a form that was removed without proper cleanup.
        await this.cleanupResourcesForForm(change.item);

        // Add the listeners to the form.
        // Note: It might be a good idea to check if the form element has already listeners attached.
        // If listeners exist, you may not need to add them again or you might want to update them.
        const listeners = this.eventListenersMap.get(change.item.formElement);
        if (listeners) {
            await this.addListeners(change.item, listeners);
        }
    }


    setupHandlers(form: IForm): void {
        // Loop over each controls in the form
        const controls = Array.from(form.elements);
        let listeners: Record<string, EventListener>;
        controls.forEach((element) => {
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
                // Add the event handlers for the control
                const inputEventHandler = this.createInputHandler(500);
                const blurEventHandler = this.createBlurHandler();
                const focusEventHandler = this.focusEventHandler;

                listeners = {
                    input: inputEventHandler as EventListener,
                    focus: focusEventHandler as EventListener,
                    blur: blurEventHandler as EventListener
                };
                this.eventListenersMap.set(form.formElement, listeners);
            }
        });
    }

    createInputHandler(debounceTime: number): EventListener {
        return (event: Event) => {
            const control = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            this.makeControlDirty(control);
            this.debouncedValidate(control, debounceTime);
        };
    }

    createBlurHandler(): EventListener {
        return (event: Event) => {
            // Use a type assertion to convince TypeScript that 'event' is a FocusEvent.
            const focusEvent = event as FocusEvent;
            const target = focusEvent.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const relatedTarget = focusEvent.relatedTarget as HTMLElement;

            // Check if the relatedTarget is focusable and warrants validation
            if (relatedTarget && (relatedTarget.tagName === "INPUT" || relatedTarget.tagName === "SELECT" || relatedTarget.tagName === "TEXTAREA" || relatedTarget.isContentEditable)) {
                // Perform actions for blurring towards a focusable element
                this.makeControlDirty(target);
                this._validationService.validateControl(target).catch(error => {
                    this._logger.getLogger().error(error instanceof Error ? error : new Error("Error in blurEventHandler: " + error));
                });
            } else {
                // This blur is to a non-focusable element sont call validateControl
                return;
            }
        };
    }
    // Non-debounced focus event handler ("Useful for adding some CSS stuff.")
    focusEventHandler(event: Event): void  {

    }
    makeControlDirty (input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): void
    {
        this._stateManager.makeControlDirty(input.name);
    }

    debouncedValidate(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, debounceTime: number): void {
        this._debouncerManager.getDebouncerForControl(input.name).debounce(async () => {
            try {
                console.log(`Debouncing ${input.name}`);
                await this._validationService.validateControl(input);
            } catch (error) {
                this._logger.getLogger().error(error instanceof Error ? error : new Error(`Error in debouncedValidate for control ${input.name}: ${error}`));
            }
        }, debounceTime);
    }


    // Add the listeners to the form
    private async addListeners(form:IForm,eventListeners: Record<string, EventListener>): Promise<IForm> {
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
    async removeListeners(formElement:HTMLFormElement): Promise<void> {
        const listeners = this.eventListenersMap.get(formElement);
        if (listeners) {
            for (const [eventType, listener] of Object.entries(listeners)) {
                // Ensure the listener is a function before attempting to remove
                if (typeof listener === "function") {
                    // Correctly map the event type for focus and blur
                    const domEventType = eventType === "focus" ? "focusin" : eventType === "blur" ? "focusout" : eventType;
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
            .map(control => control.name);

        this._stateManager.clearControlsDirtyState(namesToClear);
        this._debouncerManager.clearDebouncersForControls(namesToClear);
    }

}
// TypeGuard for named control elements
function isNamedControlElement(element: Element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
    return "name" in element && (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement);
}
