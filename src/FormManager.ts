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
     * Creates a new instance of FormManager.
     * @constructor
     * @param {IObservableCollection<IForm>} _formsCollection - The observable collection of forms.
     * @param {IFormFactory} _formFactory - The factory for creating form objects.
     * @param {IEventEmitter<any>} _eventEmitter - The event emitter for emitting form events.
     * @param {IDecoratedLogger} _logger - The logger for logging form events.
     */
    constructor(
        @inject(TYPES.ObservableFormsCollection) private readonly _formsCollection: IObservableCollection<IForm>,
        @inject(TYPES.FormFactory) private readonly _formFactory: IFormFactory,
        @inject(TYPES.EventEmitter) private readonly _eventEmitter: IEventEmitter<any>,
        @inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger){
        console.log("FormManager: constructor" );
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
        const formResults = this._formFactory.create(formElement);
        if(!formResults.isSuccess){
            const error = Result.handleError(formResults);

            this._logger.getLogger().error(`FormManager: addform: ${error}`);
            return;
        }
        const formResult = Result.handleSuccess(formResults) as IForm;
        if(formResult === undefined){
            this._logger.getLogger().error("FormManager: addform: formResult is undefined");


        }
        this._formsCollection.addItem(formResult);
        console.log(this._formsCollection);
    }
    /**
     * Creates form instances from all existing 'form' elements in the document
     * when the FormManager is initialized.
     */
    createForms(): void {
        const forms = document.querySelectorAll("form");
        // Convert the NodeList to an array
        const formsArray = Array.from(forms);
        // For Loop for formsArray
        for (const formElement of formsArray) {
            this.addform(formElement as HTMLFormElement);
        }
    }
}

