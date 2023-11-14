import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IDecoratedLogger, IUIHandler, IValidationResult } from "../interfaces";

@injectable()
/**
 * Handles the display and hiding of validation messages in the UI.
 */
export class UIHandler implements IUIHandler {
    /**
     * Creates an instance of UIHandler.
     * @param {IDecoratedLogger} _logger - Logger for logging information and errors.
     */
    constructor(@inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger) { }
    /**
     * Updates the UI to show or hide the validation message based on the validation result.
     * @param {IValidationResult} validationResult - The result of the validation check.
     */
    updateValidationMessage(validationResult: IValidationResult): void {
        if (validationResult === undefined) {
            return;
        }
        const { control, errorMessages, isValid } = validationResult;
        if (!isValid) {
            // Get the first error message
            const errorMessage = errorMessages.find(m => m.length > 0);
            if (errorMessage === undefined) {
                return;
            }
            this.showValidationMessage(control as HTMLInputElement, errorMessage);
        }
        else {
            this.hideValidationMessage(control as HTMLInputElement);
        }
    }
    /**
     * Shows the validation error message next to the form control.
     * @param {HTMLInputElement} control - The form control related to the validation message.
     * @param {string} message - The validation error message to display.
     * @private
     */
    private showValidationMessage(control: HTMLInputElement, message: string): void {
        // Check if the control is contained within a parent element
        const parentElement = control.parentElement;
        if (!parentElement) {
            this._logger.getLogger().error("Control is not contained within a parent element");
            return; // Exit the function if there is no parent element
        }

        // Find any element within the parent that has the 'data-valmsg-for' attribute for the control's name
        const validationMessageElement = this.getValidationMessageElement(control);

        if (validationMessageElement === null || validationMessageElement === undefined) {
            this._logger.getLogger().warn(`No validation message element found for control with name: ${control.name}. Please make sure you are using a <span>`);
            return;
        }
        // Update the validation message text
        validationMessageElement.textContent = message;

        // Update the classes to reflect the validation state
        validationMessageElement.classList.remove("field-validation-valid");
        validationMessageElement.classList.add("field-validation-error");

        // Set ARIA attributes
        control.setAttribute("aria-invalid", "true"); // Mark the control as invalid
        control.setAttribute("aria-describedby", validationMessageElement.id); // Ensure the message element has an ID for this to work
    }
    /**
     * Hides the validation message for the form control.
     * @param {HTMLInputElement} control - The form control related to the validation message.
     * @private
     */
    private hideValidationMessage(control: HTMLInputElement): void {
        // Check if the control is contained within a parent element
        const parentElement = control.parentElement;
        if (!parentElement) {
            this._logger.getLogger().error("Control is not contained within a parent element");
            return; // Exit the function if there is no parent element
        }

        // Find any element within the parent that has the 'data-valmsg-for' attribute for the control's name
        const validationMessageElement = this.getValidationMessageElement(control);

        if (validationMessageElement) {
            // We found the element for the validation message, regardless of its type (it could be a <span>, <div>, etc.)

            // Clear the validation message text
            validationMessageElement.textContent = "";

            // Update the classes to reflect the validation state
            validationMessageElement.classList.remove("field-validation-error");
            validationMessageElement.classList.add("field-validation-valid");

            // Update ARIA attributes
            control.removeAttribute("aria-invalid"); // Remove the invalid attribute
            control.removeAttribute("aria-describedby"); // Remove the describedby attribute
        } else {
            // If we couldn't find the element for the validation message, log a warning message
            this._logger.getLogger().warn(`No validation message element found for control with name: ${control.name}`);
        }
    }
    /**
     * Retrieves the corresponding validation message element for a given form control.
     * @param {HTMLInputElement} control - The form control to find the validation message element for.
     * @returns {HTMLElement | null} - The element that displays the validation message, if found; otherwise, null.
     * @private
     */
    private getValidationMessageElement(control: HTMLInputElement): HTMLElement | null {
        // Check if the form element is contained within a form
        const form = control.form;
        if (!form) {
            this._logger.getLogger().error(`Form not found for control with name: ${control.name} and id: ${control.id}`);
            return null;
        }

        // Attempt to find the validation message element within the entire form
        const msgElement = form.querySelector(`[data-valmsg-for="${control.name}"]`);
        return msgElement as HTMLElement; // Will be null if not found, or the HTMLElement if found
    }
}
