import { inject, injectable } from "inversify";
import { IChange, IForm, IObservableCollection, IValidationRule, IValidationRuleRegistry, IValidationService, IValidator } from "../interfaces";
import { TYPES } from "../di/container-types";




@injectable()
export class ValidationService implements IValidationService {
    private validators: IValidator[] = [];

    private controlValidityState: WeakMap<HTMLElement, boolean> = new WeakMap();

    constructor(
        @inject(TYPES.ObservableFormsCollection) private readonly _observableFormsCollection: IObservableCollection<IForm>,
        @inject(TYPES.ValidationRuleRegistry) private readonly _validationRulesRegistry: IValidationRuleRegistry) {
        this._observableFormsCollection.addObserver(this);
    }



    async init(): Promise<void> {
        // Initialize any needed properties or services here
    }

    async notify(change: IChange<IForm>): Promise<void> {
        if ("item" in change && change.type === "add") {
            //console.log(change.item);
            // Get all form controls from the form
            const controls = Array.from(change.item.elements);
            // Iterate over each control to apply validation
            controls.forEach((element) => {
                if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
                    // Use the existing rules from the ValidationRuleRegistry
                    const rules = this._validationRulesRegistry.getRulesForControl(element);
                    // Now process each rule on the element as needed
                    rules.forEach(rule => {
                        // Apply the validation rule to the element
                        // ...
                    });
                }
            });
        }
    }






    public async validateControl(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): Promise<void> {
        // Determine the rule(s) for the input by querying the ValidationRuleRegistry
        const rules = this._validationRulesRegistry.getRulesForControl(input);

        // Iterate over each rule and find a validator that can handle it
        for (const rule of rules) {
            const validator = this.validators.find(v => v.canHandle(rule));
            if (!validator) {
                throw new Error(`No validator can handle the rule of type: ${rule.type}`);
            }
            if (!validator.validate(input.value, rule)) {
                // Handle validation failure, e.g., by displaying an error message
            }
        }
        // Handle successful validation, e.g., by clearing any error messages
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

