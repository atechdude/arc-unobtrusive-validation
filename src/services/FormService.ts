import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { Result } from "../classes/Result";
import { IDecoratedLogger, IEventEmitter,IForm, IFormFactory, IFormService, IObservableCollection, ISubmitHandler } from "../interfaces";
/**
 * Service for managing forms within an application. 
 * It handles adding forms to a collection, managing submit handlers, and checking forms.
 */
@injectable()
export class FormService implements IFormService {
    private submitHandlers: Record<string, ISubmitHandler> = {};
    /**
     * Initializes a new instance of the FormService.
     * @param _formsCollection - The collection of observable forms.
     * @param _formFactory - Factory for creating form objects.
     * @param _eventEmitter - Emitter for dispatching events.
     * @param _logger - Logger for logging information and errors.
     */
    constructor(
        @inject(TYPES.ObservableFormsCollection) private readonly _formsCollection: IObservableCollection<IForm>,
        @inject(TYPES.FormFactory) private readonly _formFactory: IFormFactory,
        @inject(TYPES.EventEmitter) private readonly _eventEmitter: IEventEmitter<any>,
        @inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger
    ) {
    }
    /**
     * Adds a form element to the forms collection and applies any associated submit handlers.
     * Dispatches a 'formAdded' event upon successful addition.
     * @param formElement - The HTML form element to add.
     * @returns The form object if successfully added, or undefined if an error occurs.
     */
    addForm(formElement: HTMLFormElement): IForm | undefined {
        if (!formElement) {
            this._logger.getLogger().error("FormElement is undefined or null.");
            return;
        }

        this._logger.getLogger().info(`FormService is adding form: ${formElement.name || "unnamed form"}`);

        try {
            const form = this.checkForm(formElement);
            if (!form) {
                this._logger.getLogger().error(`Failed to create form object for: ${formElement.name || "unnamed form"}`);
                return;
            }

            this._formsCollection.addItem(form);

            // Check if a submit handler exists for this form
            const handler = this.submitHandlers[form.name];
            if (handler) {
                form.submitHandler = handler;
                delete this.submitHandlers[form.name]; // Remove the handler after applying
                this._logger.getLogger().info(`Submit handler applied for form: ${form.name}`);
            }

            // Dispatch a standard DOM event indicating that a new form has been added
            const event = new CustomEvent("formAdded", { detail: form });
            document.dispatchEvent(event);

            return form;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error during form addition.";
            this._logger.getLogger().error(`Error in addForm: ${errorMessage}`);
        }
    }
    /**
     * Validates and creates a form object from a given HTMLFormElement.
     * @param formElement - The HTMLFormElement to validate and create a form object from.
     * @returns A form object if successfully created, or undefined if an error occurs.
     */
    checkForm(formElement: HTMLFormElement): IForm | undefined {
        const createFormResults = this._formFactory.create(formElement);

        if (!createFormResults.isSuccess) {
            const error = Result.handleError(createFormResults);
            this._logger.getLogger().error(`FormManager: addForm: Error when creating form: ${error}`);
        }
        const resultValue = Result.handleSuccess(createFormResults);
        if (resultValue === undefined) {
            return undefined;
        }
        return resultValue;
    }
    /**
     * Sets a submit handler for a form identified by its name. If the form is already present, the handler is applied immediately.
     * Otherwise, the handler is stored and will be applied when the form is added.
     * @param formName - The name of the form to set the submit handler for.
     * @param handler - The function to handle form submission.
     */
    setSubmitHandler(formName: string, handler: ISubmitHandler): void {
        const form = this.getFormByName(formName);
        if (form) {
            form.submitHandler = handler;
        } else {
            this.submitHandlers[formName] = handler; // Store the handler for later use
        }
    }
    /**
     * Retrieves a form from the forms collection by its name.
     * @param formName - The name of the form to retrieve.
     * @returns The form object if found, or undefined if not found.
     */
    getFormByName(formName: string): IForm | undefined {
        return this._formsCollection.getItems().find(form => form.name === formName);
    }

}
