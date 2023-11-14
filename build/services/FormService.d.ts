import { IDecoratedLogger, IEventEmitter, IForm, IFormFactory, IFormService, IObservableCollection, ISubmitHandler } from "../interfaces";
/**
 * Service for managing forms within an application.
 * It handles adding forms to a collection, managing submit handlers, and checking forms.
 */
export declare class FormService implements IFormService {
    private readonly _formsCollection;
    private readonly _formFactory;
    private readonly _eventEmitter;
    private readonly _logger;
    private submitHandlers;
    /**
     * Initializes a new instance of the FormService.
     * @param _formsCollection - The collection of observable forms.
     * @param _formFactory - Factory for creating form objects.
     * @param _eventEmitter - Emitter for dispatching events.
     * @param _logger - Logger for logging information and errors.
     */
    constructor(_formsCollection: IObservableCollection<IForm>, _formFactory: IFormFactory, _eventEmitter: IEventEmitter<any>, _logger: IDecoratedLogger);
    /**
     * Adds a form element to the forms collection and applies any associated submit handlers.
     * Dispatches a 'formAdded' event upon successful addition.
     * @param formElement - The HTML form element to add.
     * @returns The form object if successfully added, or undefined if an error occurs.
     */
    addForm(formElement: HTMLFormElement): IForm | undefined;
    /**
     * Validates and creates a form object from a given HTMLFormElement.
     * @param formElement - The HTMLFormElement to validate and create a form object from.
     * @returns A form object if successfully created, or undefined if an error occurs.
     */
    checkForm(formElement: HTMLFormElement): IForm | undefined;
    /**
     * Sets a submit handler for a form identified by its name. If the form is already present, the handler is applied immediately.
     * Otherwise, the handler is stored and will be applied when the form is added.
     * @param formName - The name of the form to set the submit handler for.
     * @param handler - The function to handle form submission.
     */
    setSubmitHandler(formName: string, handler: ISubmitHandler): void;
    /**
     * Retrieves a form from the forms collection by its name.
     * @param formName - The name of the form to retrieve.
     * @returns The form object if found, or undefined if not found.
     */
    getFormByName(formName: string): IForm | undefined;
}
