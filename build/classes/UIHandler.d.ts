import { IDecoratedLogger, IUIHandler, IValidationResult } from "../interfaces";
export declare class UIHandler implements IUIHandler {
    private readonly _logger;
    /**
     * Creates an instance of UIHandler.
     * @param {IDecoratedLogger} _logger - Logger for logging information and errors.
     */
    constructor(_logger: IDecoratedLogger);
    /**
     * Updates the UI to show or hide the validation message based on the validation result.
     * @param {IValidationResult} validationResult - The result of the validation check.
     */
    updateValidationMessage(validationResult: IValidationResult): void;
    /**
     * Shows the validation error message next to the form control.
     * @param {HTMLInputElement} control - The form control related to the validation message.
     * @param {string} message - The validation error message to display.
     * @private
     */
    private showValidationMessage;
    /**
     * Hides the validation message for the form control.
     * @param {HTMLInputElement} control - The form control related to the validation message.
     * @private
     */
    private hideValidationMessage;
    /**
     * Retrieves the corresponding validation message element for a given form control.
     * @param {HTMLInputElement} control - The form control to find the validation message element for.
     * @returns {HTMLElement | null} - The element that displays the validation message, if found; otherwise, null.
     * @private
     */
    private getValidationMessageElement;
}
