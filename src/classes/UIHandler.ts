import { inject, injectable } from "inversify";
import { TYPES } from "../di/container-types";
import { IDecoratedLogger, IUIHandler, IValidationResult } from "../interfaces";

@injectable()
export class UIHandler implements IUIHandler {
    constructor(@inject(TYPES.DebuggingLogger) private readonly _logger: IDecoratedLogger) { }

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
    private showValidationMessage(control: HTMLInputElement, message: string): void {
        // Check if the control is contained within a parent element
        const parentElement = control.parentElement;
        if (!parentElement) {
            console.warn("Control is not contained within a parent element");
            return; // Exit the function if there is no parent element
        }

        // Find any element within the parent that has the 'data-valmsg-for' attribute for the control's name
        const validationMessageElement = this.getValidationMessageElement(control);


        if (validationMessageElement) {
            // We found the element for the validation message, regardless of its type (it could be a <span>, <div>, etc.)

            // Update the validation message text
            validationMessageElement.textContent = message;

            // Update the classes to reflect the validation state
            validationMessageElement.classList.remove("field-validation-valid");
            validationMessageElement.classList.add("field-validation-error");

            // Set ARIA attributes
            control.setAttribute("aria-invalid", "true"); // Mark the control as invalid
            control.setAttribute("aria-describedby", validationMessageElement.id); // Ensure the message element has an ID for this to work
        } else {
            // If we couldn't find the element for the validation message, log a warning message
            console.warn(`No validation message element found for control with name: ${control.name}`);
        }
    }

    private hideValidationMessage(control: HTMLInputElement): void {
        // Check if the control is contained within a parent element
        const parentElement = control.parentElement;
        if (!parentElement) {
            console.warn("Control is not contained within a parent element");
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
            console.warn(`No validation message element found for control with name: ${control.name}`);
        }
    }
    private getValidationMessageElement(control: HTMLInputElement): HTMLElement | null {


        let msgElement: HTMLElement | null = null;

        //msgElement = control.parentNode//querySelector(`[data-valmsg-for="${control.name}"]`);
        if (control.parentElement) {
            msgElement = control.parentElement.querySelector(`[data-valmsg-for="${control.name}"]`);

        }

        return msgElement;
    }
}
