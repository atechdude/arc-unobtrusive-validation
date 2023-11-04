import { injectable } from "inversify";
import { IForm, IValidationResult, IValidationService } from "../interfaces";

import { Result } from "../Result";

@injectable()
export class ValidationService implements IValidationService {


    private controlValidityState: WeakMap<HTMLElement, boolean> = new WeakMap();

    constructor() {

    }



    async init(): Promise<void> {
        // Initialize any needed properties or services here
    }


    //TODO: Needs to return a Result<IValidationResult>
    async validateControl(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): Promise<void> {


        const validate = (): void => {


            console.log("Simulated control validate method");
        };





        // This is for testing purposes only this will actually be set when we get a return value from the validation method
        this.controlValidityState.set(input, true);



        // For later use: Checks the control's validity state. We don't run validation on controls that are already valid
        const isControlValid = this.controlValidityState.get(input);
        console.log(isControlValid ? "Control is valid" : "Control is invalid");

        if(isControlValid){
            return;
        }
        validate();


    }

    // TODO: Refactor put inside a UI Handler
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
        } else {
            // If we couldn't find the element for the validation message, log a warning message
            console.warn(`No validation message element found for control with name: ${control.name}`);
        }
    }

    validateForm(form: IForm): void {
        throw new Error("Method not implemented.");
    }

    // TODO: Refactor put inside a UI Handler
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
        } else {
            // If we couldn't find the element for the validation message, log a warning message
            console.warn(`No validation message element found for control with name: ${control.name}`);
        }
    }

    // TODO: Refactor put inside a UI Handler
    private getValidationMessageElement(control: HTMLInputElement): HTMLElement | null {


        let msgElement: HTMLElement | null = null;

        //msgElement = control.parentNode//querySelector(`[data-valmsg-for="${control.name}"]`);
        if (control.parentElement) {
            msgElement = control.parentElement.querySelector(`[data-valmsg-for="${control.name}"]`);

        }

        return msgElement;
    }

}

