import { inject, injectable } from "inversify";
import { IDebouncerFactory, IDecoratedLogger, IForm, IFormFactory, IFormManager, IObservableCollection, IValidationResult, IValidationService } from "./interfaces";
import { TYPES } from "./di/container-types";
import { Result } from "./Result";
import { Debouncer } from "./util/Debouncer";


@injectable()
export class FormManager implements IFormManager {
    eventListenersMap: WeakMap<Element, Record<string, EventListener>> = new WeakMap();
    dirtyMap: { [key: string]: boolean } = {};
    debouncers: { [key: string]: Debouncer } = {};
    private mutationObserver: MutationObserver | null = null;

    constructor(
        @inject(TYPES.FormFactory) private readonly _formFactory: IFormFactory,
        @inject(TYPES.DebouncerFactory) private readonly _debounceFactory: IDebouncerFactory,
        @inject(TYPES.EventService) private readonly _eventService: IEventService,
        @inject(TYPES.ObservableFormsCollection) private readonly _formsCollection: IObservableCollection<IForm>,
        @inject(TYPES.ValidationService) private readonly _validationService: IValidationService,
        @inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger) {

        // Create a new Map for the event listeners
        this.eventListenersMap = new WeakMap();
    }

    async init(): Promise<void> {
        this.createForms();
        this.observeDOMForForms();
        const forms = this._formsCollection.getItems();
        await this.setupForms(forms).catch(error => {
            this._logger.getLogger().error(error instanceof Error ? error.message : "Error in setupForms: " + error);
        });
    }

    observeDOMForForms(): void {
        // If the observer already exists, disconnect it
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }

        this.mutationObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "childList") {
                    // Immediately-invoked async function expression (IIFE)
                    (async () => {
                        // Process direct forms
                        const directForms = Array.from(mutation.addedNodes)
                            .filter((node): node is HTMLFormElement => node instanceof HTMLFormElement);
                        for (const form of directForms) {
                            await this.addDynamicForm(form);
                        }

                        // Process nested forms
                        const nestedForms = Array.from(mutation.addedNodes)
                            .filter((node): node is HTMLElement => node instanceof HTMLElement)
                            .flatMap(node => Array.from(node.querySelectorAll("form")));
                        for (const form of nestedForms) {
                            await this.addDynamicForm(form);
                        }
                    })();
                }
            }
        });

        // Only one observer instance should be running
        this.mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    async addDynamicForm (node: HTMLFormElement): Promise<void>{
        const formName = node.name;
        try {
            // Check if the form is already in the collection
            const existingForm = this._formsCollection.findItem(
                form => form.formElement.id === node.id || form.formElement.name === node.name
            );


            if (existingForm) {
                this._formsCollection.removeItem(existingForm);
                this._logger.getLogger().info(`Updated form '${formName}' will replace the existing one.`);
            }

            // Proceed with form creation
            const formResults = this._formFactory.create(node);
            if (!formResults.isSuccess) {
                const error = Result.handleError(formResults);
                this._logger.getLogger().error(error?.message || "Unknown error creating form");
                return;
            }
            const form = Result.handleSuccess(formResults);

            if (form == undefined) {
                this._logger.getLogger().error("Form creation returned a null result");
                return;
            }
            // Add the new form to the collection
            this._formsCollection.addItem(form);

            // Setup the form
            await this.setupForms([form]).catch(error => {
                this._logger.getLogger().error(error instanceof Error ? error.message : "Error in setupForms: " + error);
            });

        } catch (error: any) {
            this._logger.getLogger().error(`Error while adding dynamic form '${formName}': ${error.message}`);
        }
    }


    // Sets up all of the forms, add them to the collection, and sets up listeners
    async setupForms(forms: IForm[]): Promise<void> {
        if (!forms) {
            this._logger.getLogger().error(new Error("No forms provided to setupForms."));
            return;
        }

        // This needs to be changed to read from the observable collection
        for (const form of forms) {
            try {
                // Remove any existing listeners for the form. ("This only applies to forms loaded dynamically since a page reload nerfs all state")
                await this.removeListeners(form.formElement);
                this.cleanupResourcesForForm(form.formElement);
                // Setup Listeners
                // Ensure this promise is awaited so that listeners are set up before proceeding
                await this.configureListeners(form);


            } catch (error) {
                // Log any errors
                this._logger.getLogger().error(error instanceof Error ? error : new Error("Error in setupForms: " + error));
            }
        }
    }

    async configureListeners(form: IForm): Promise<void> {
        // Validate the control using the validation service
        const validateControl = async (input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): Promise<void> => {
            await this._validationService.validateControl(input);
        };

        // Marks the control as dirty, which means it has been interacted with basically
        const makeControlDirty = (input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): void => {
            this.dirtyMap[input.name] = true;
        };

        const debouncedValidate = (input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, debounceTime: number): void => {
            if (!this.debouncers[input.name]) {
                this.debouncers[input.name] = this._debounceFactory.create(); // Create a new debouncer for the input
            }
            // Get the debouncer for the input
            const debouncer = this.debouncers[input.name];
            debouncer.debounce(async () => {
                console.log(`Debouncing ${input.name}`);
                await validateControl(input);
            }, debounceTime);
        };

        // Debounced input event handler
        const inputEventHandler = (event: Event): void => {
            const control = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            makeControlDirty(control);
            debouncedValidate(control, 500); // Using 500ms for input debounce time
        };


        // Non-debounced focus event handler ("Useful for adding some CSS stuff. Other than pretty worthless")
        const focusEventHandler = (event: Event): void => {
            // For Future Use
        };

        // Blur event handler
        const blurEventHandler: EventListener = (event: Event) => {
            // Use a type assertion to convince TypeScript that 'event' is a FocusEvent.
            const focusEvent = event as FocusEvent;
            const target = focusEvent.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            const relatedTarget = focusEvent.relatedTarget as HTMLElement;

            // Check if the relatedTarget is focusable and warrants validation
            if (relatedTarget && (relatedTarget.tagName === "INPUT" || relatedTarget.tagName === "SELECT" || relatedTarget.tagName === "TEXTAREA" || relatedTarget.isContentEditable)) {
                // Perform actions for blurring towards a focusable element
                makeControlDirty(target);
                this._validationService.validateControl(target).catch(error => {
                    this._logger.getLogger().error(error instanceof Error ? error : new Error("Error in blurEventHandler: " + error));
                });
            } else {
                // This blur is to a non-focusable element sont call validateControl
                return;
            }
        };

        // Keep track of event listeners to be able to remove them later
        const listeners: Record<string, EventListener> = {
            input: inputEventHandler as EventListener,
            focus: focusEventHandler as EventListener,
            blur: blurEventHandler as EventListener
        };
        // Set the listeners for the form so we can cleanup later. Usefull for dynamically loaded forms
        this.eventListenersMap.set(form.formElement, listeners);
        this.addListeners(form.formElement,listeners);
    }

    // Remove the listeners from the form
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

    // Get all of the form elements and create the Form objects. This only works for static forms. Please see observeDOMForForms for dynamic forms
    createForms(): void {
        const forms = document.querySelectorAll("form");

        for (let i = 0; i < forms.length; i++) {
            try {
                const formResults = this._formFactory.create(forms[i]);
                if (!formResults.isSuccess) {
                // Handle the failure case
                    const error = Result.handleError(formResults);
                    this._logger.getLogger().error(new Error(error?.message || "Unknown error creating form"));
                    continue; // Skip this form and continue with the next one
                }
                // Get the form from the result
                const form = Result.handleSuccess(formResults);

                if (form) {
                    // Check if the form is already in the collection
                    const existingForm = this._formsCollection.findItem(f => f.formElement === form.formElement);
                    if (existingForm) {
                        this._formsCollection.removeItem(existingForm);
                        this._logger.getLogger().info(`Form with id/name: ${forms[i].id || forms[i].name} will be refreshed in the collection.`);
                    }
                    // Add the form to the observable collection
                    this._formsCollection.addItem(form);
                } else {
                    this._logger.getLogger().error(new Error("Form creation returned a null result"));
                }
            } catch (error) {
            // Catch any other unexpected errors
                this._logger.getLogger().error(error instanceof Error ? error : new Error("An unexpected error occurred"));
            }
        }
    }

    // Add the listeners to the form
    private addListeners(formElement:HTMLFormElement,eventListeners: Record<string, EventListener>): void {
        // Add event listeners and store them in the map
        for (const [eventType, listener] of Object.entries(eventListeners)) {
            if (eventType === "focus") {
                // For focus, you might want to listen to focusin event instead
                formElement.addEventListener("focusin", listener);

            } else if (eventType === "blur") {
                // For blur, you might want to listen to focusout event instead
                formElement.addEventListener("focusout", listener);

            } else {
                // For other events, add them normally
                formElement.addEventListener(eventType, listener);

            }
        }
    }

    clearDebouncersForElement(elementName: string): void {
        const debouncer = this.debouncers[elementName];
        if (debouncer) {
            debouncer.cancel(); // Assuming your debouncer has a cancel method to clear timeouts
            delete this.debouncers[elementName];
        }
    }

    cleanupResourcesForForm(formElement: HTMLFormElement): void {
        const controls = formElement.elements;
        for (let i = 0; i < controls.length; i++) {
            const control = controls[i];

            if (isNamedControlElement(control)) {
                // TypeScript is now aware that control is one of the specific elements with a 'name' property
                const name = control.name;
                // Now we can safely delete from dirtyMap and clean up debouncers
                delete this.dirtyMap[name];
                this.clearDebouncersForElement(name);
            }
        }
    }
}
// TypeGuard for named control elements
function isNamedControlElement(element: Element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
    return "name" in element && (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement);
}
