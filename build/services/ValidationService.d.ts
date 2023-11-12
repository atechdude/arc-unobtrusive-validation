import { IDecoratedLogger, IForm, IFormParser, IUIHandler, IValidationControlFactory, IValidationService } from "../interfaces";
/**
 * Service responsible for validating form controls.
 * Utilizes form parser for retrieving validation rules and a control factory for creating validation instances.
 * It injects a UI handler for updating the validation messages on the UI.
 */
export declare class ValidationService implements IValidationService {
    private readonly _logger;
    private readonly _formParser;
    private readonly _validationControlFactory;
    private readonly _uiHandler;
    /**
     * Constructs the ValidationService with required dependencies.
     * @param {IDecoratedLogger} _logger - Logger for logging messages and errors.
     * @param {IFormParser} _formParser - Service to parse form and retrieve validation rules.
     * @param {IValidationControlFactory} _validationControlFactory - Factory to create validation controls.
     * @param {IUIHandler} _uiHandler - Handler for updating the UI with validation messages.
     */
    constructor(_logger: IDecoratedLogger, _formParser: IFormParser, _validationControlFactory: IValidationControlFactory, _uiHandler: IUIHandler);
    /**
     * Validates all controls within a form and updates the UI with validation messages.
     * Skips validation for buttons and hidden inputs.
     * Sets the form's overall validity and dispatches a custom event to indicate the validation result.
     * @param {IForm} form - The form to validate.
     * @returns {Promise<boolean>} The overall validity of the form after validation.
     */
    validateForm1(form: IForm): Promise<boolean>;
    validateForm(form: IForm): Promise<boolean>;
    /**
     * Validates a control and updates the UI with validation messages.
     * Skips validation if the control is a button element.
     * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} control - The control to validate.
     * @returns {Promise<void>}
     */
    validateControl(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): Promise<boolean>;
}
