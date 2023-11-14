import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import {
    IDecoratedLogger,
    IForm,
    IFormParser,
    IUIHandler,
    IValidationControlFactory,
    IValidationService
} from "../interfaces";
import { Result } from "../classes/Result";
/**
 * Service responsible for performing validation on forms and their controls.
 * It integrates with UI handling and form parsing services to manage the validation process.
 */
@injectable()
export class ValidationService implements IValidationService {
    /**
     * Constructs the ValidationService with required dependencies.
     * @param {IDecoratedLogger} _logger - Logger for logging messages and errors.
     * @param {IFormParser} _formParser - Service to parse form and retrieve validation rules.
     * @param {IValidationControlFactory} _validationControlFactory - Factory to create validation controls.
     * @param {IUIHandler} _uiHandler - Handler for updating the UI with validation messages.
     */
    constructor(
        @inject(TYPES.DebuggingLogger)
        private readonly _logger: IDecoratedLogger,
        @inject(TYPES.FormParser) private readonly _formParser: IFormParser,
        @inject(TYPES.ValidationControlFactory) private readonly _validationControlFactory: IValidationControlFactory,
        @inject(TYPES.UIHandler) private readonly _uiHandler: IUIHandler
    ) { }

    /**
     * Validates all controls within a form and updates the UI with validation messages.
     * Skips validation for buttons and hidden inputs.
     * Sets the form's overall validity and dispatches a custom event to indicate the validation result.
     * @param {IForm} form - The form to validate.
     * @returns {Promise<boolean>} The overall validity of the form after validation.
     */
    async validateForm(form: IForm): Promise<boolean> {
        // Convert the form's elements to an array and filter out non-validatable elements.
        const controls = Array.from(form.elements).filter(
            (el) => (el instanceof HTMLInputElement ||
                el instanceof HTMLSelectElement ||
                el instanceof HTMLTextAreaElement) &&
                el.type !== "button" && el.type !== "submit" && el.type !== "hidden"
        );

        // Map each control to a validation promise, using validateControl.
        const validationPromises = controls.map(control =>
            this.validateControl(control as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)
                .catch(error => {
                    // Handle validation error for the control, e.g., logging or setting a flag.
                    console.error(`Validation failed for control: ${control}`, error);
                    return false; // Treat validation errors as invalid.
                })
        );

        // Wait for all validations to complete.
        const validationResults = await Promise.all(validationPromises);

        // Check if all validations passed.
        const isFormValid = validationResults.every(result => result);

        // Set the form's validity based on the validation results.
        form.isValid = isFormValid;
        form.formElement.setAttribute("data-is-valid", String(isFormValid));

        return isFormValid;
    }
    /**
     * Validates a control and updates the UI with validation messages.
     * Skips validation if the control is a button element.
     * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} control - The control to validate.
     * @returns {Promise<boolean>} True if the control is valid, false otherwise.
     */
    async validateControl(
        control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    ): Promise<boolean> {
        // Check if the control is a button and return early if it is.
        if (control instanceof HTMLButtonElement) {
            this._logger.getLogger().info(`Skipping validation for button with name: ${control.name}`);
            return false;
        }
        // Call the validation control factory to create a validation control
        const validationControl = this._validationControlFactory.create(control);

        // Get the validation information and rules for the control
        const getValidationInformationResults =
            this._formParser.getValidationInformation(control);

        // If we dont have validation information, log the error and return early
        if (!getValidationInformationResults.isSuccess) {
            const error = Result.handleError(getValidationInformationResults);
            this._logger.getLogger().error(error);
            return false;
        }
        // Handle the validation information results
        const getValidationRulesResult = Result.handleSuccess(
            getValidationInformationResults
        );
        if (getValidationRulesResult === undefined) {
            this._logger.getLogger().error("Validation rules are undefined");
            return false;
        }

        // Destructure the getValidationRulesResult
        const { rules } = getValidationRulesResult;

        // Await the validation and get the results
        const validationResults = await validationControl.validate(rules);

        // If we dont have validation results, log the error and return early
        if (!validationResults.isSuccess) {
            const error = Result.handleError(validationResults);
            this._logger.getLogger().error(error);
        }

        // Handle the validation results
        const validationResult = Result.handleSuccess(validationResults);
        if (validationResult === undefined) {
            this._logger.getLogger().error("Validation result is undefined");
            return false;
        }

        // Hand off the validation result to the UI handler
        this._uiHandler.updateValidationMessage(validationResult);
        return validationResult.isValid;
    }
}
