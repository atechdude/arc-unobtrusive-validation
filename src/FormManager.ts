import { inject, injectable } from "inversify";
import { IDecoratedLogger, IEventEmitter, IEventService, IForm, IFormFactory, IFormManager, IObservableCollection } from "./interfaces";
import { TYPES } from "./di/container-types";
import { Result } from "./Result";

@injectable()
/**
 * Manages form instances within the application, including the creation
 * of form objects and the observation of DOM mutations for dynamically
 * added forms.
 * @class
 * @implements {IFormManager}
 */
export class FormManager implements IFormManager {
    private mutationObserver: MutationObserver | null = null;
    /**
     * Initializes a new instance of the FormManager class.
     * @constructor
     * @param {IObservableCollection<IForm>} _formsCollection - The collection to store observable forms.
     * @param {IFormFactory} _formFactory - Factory for creating form instances.
     * @param {IEventService} _eventService - Service for handling events.
     * @param {IDecoratedLogger} _logger - Logger for logging messages.
     */
    constructor(@inject(TYPES.ObservableFormsCollection) private readonly _formsCollection: IObservableCollection<IForm>,
        @inject(TYPES.FormFactory) private readonly _formFactory: IFormFactory,
        @inject(TYPES.EventEmitter) private readonly _eventEmitter: IEventEmitter<any>,
        @inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger){
    }
    /**
     * Initializes form management by creating form instances from existing DOM
     * and setting up a mutation observer for new forms added to the DOM.
     */
    async init(): Promise<void> {
        this.createForms();
        this.observeDOMForForms();
    }
    /**
     * Sets up a mutation observer to detect when form elements are added to the DOM
     * and adds those forms to the forms collection.
     */
    observeDOMForForms(): void {
        // If the observer already exists, disconnect it
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        this.mutationObserver = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === "childList") {
                    // Process direct forms
                    const directForms = Array.from(mutation.addedNodes)
                        .filter((node): node is HTMLFormElement => node instanceof HTMLFormElement);
                    for (const form of directForms) {
                        this.addform(form);
                    }

                    // Process nested forms
                    const nestedForms = Array.from(mutation.addedNodes)
                        .filter((node): node is HTMLElement => node instanceof HTMLElement)
                        .flatMap(node => Array.from(node.querySelectorAll("form")));
                    for (const form of nestedForms) {
                        this.addform(form);
                    }
                }
            }
        });
        // Only one observer instance should be running
        this.mutationObserver.observe(document.body, { childList: true, subtree: true });
    }
    /**
    * Adds a form to the observable collection and emits an event if the form is successfully added.
    * It attempts to create a form object using the form factory, handles the case where the form creation
    * is unsuccessful, and refreshes the collection if the form already exists.
    *
    * @param {HTMLFormElement} formElement - The HTML form element to be added to the collection.
    * @fires EventService#formAdded - This event is emitted when a form is successfully added.
    */
    addform(formElement: HTMLFormElement): void {
        try {
            // Attempt to create the form using the form factory
            const formResults = this._formFactory.create(formElement);
            if (!formResults.isSuccess) {
                // Handle the failure case
                const error = Result.handleError(formResults);
                this._logger.getLogger().error(new Error(error?.message || "Unknown error creating form"));
                return; // Skip this form and continue with the next one
            }

            // Get the form from the result
            const form = Result.handleSuccess(formResults);

            if (form) {
                // Check if the form is already in the collection
                const existingForm = this._formsCollection.findItem(f => f.formElement === form.formElement);
                if (existingForm) {
                    // If the form exists, remove it to refresh the collection
                    this._formsCollection.removeItem(existingForm);
                    this._logger.getLogger().info(`Form with id/name: ${formElement.id || formElement.name} has been refreshed in the collection.`);
                }
                // Add the new form to the observable collection
                this._formsCollection.addItem(form);
                // Emit an event to notify about the form addition
                this._eventEmitter.emit("formAdded", form);
            } else {
                // Log an error if the form is null
                this._logger.getLogger().error(new Error("Form creation returned a null result"));
            }
        } catch (error) {
            // Log any unexpected errors
            this._logger.getLogger().error(error instanceof Error ? error : new Error("An unexpected error occurred in addForm"));
        }
    }
    /**
     * Creates form instances from all existing 'form' elements in the document
     * when the FormManager is initialized.
     */
    createForms(): void {
        const forms = document.querySelectorAll("form");

        for (let i = 0; i < forms.length; i++) {
            try {
                this.addform(forms[i] as HTMLFormElement);
            } catch (error) {
            // Catch any other unexpected errors
                this._logger.getLogger().error(error instanceof Error ? error : new Error("An unexpected error occurred"));
            }
        }
    }
}

