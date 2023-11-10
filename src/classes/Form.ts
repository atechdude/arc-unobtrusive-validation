import { IForm } from "../interfaces";
/**
 * Represents a form with validation capabilities.
 * Tracks the overall validity of the form and ensures each form control has a unique ID.
 */
export class Form implements IForm {
    name: string = "";
    action: string = "";
    method: string = "";
    formElement: HTMLFormElement;
    attributes: NamedNodeMap;
    elements: HTMLFormControlsCollection;
    element: Element;
    buttons: HTMLButtonElement[];
    /**
     * Indicates whether the form has passed all validation rules.
     * @type {boolean}
     */
    isValid: boolean = false;
    /**
     * Creates an instance of Form.
     * @param {HTMLFormElement} formElement - The HTML form element associated with this instance.
     */
    constructor(formElement: HTMLFormElement) {
        this.formElement = formElement;
        this.attributes = formElement.attributes;
        this.elements = formElement.elements;
        this.element = Array.from(this.elements).find(
            (el) => el instanceof Element
        ) as Element;
        this.buttons = Array.from(this.elements).filter(
            (el) => el instanceof HTMLButtonElement
        ) as HTMLButtonElement[];
        this.name = this.formElement.name;
        this.action = this.formElement.action;
        this.method = this.formElement.method;
        this.init();
    }
    /**
     * Initializes the form by assigning IDs to elements that don't already have them.
     */
    init(): void {
        // Check the attriubes to see if the form is ajax

        Array.from(this.elements).forEach((element) => {
            if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLButtonElement) {
                if (!element.id && element.name) {
                    element.id = this.generateIdFromName(element.name);
                    // If you also need to set up ARIA attributes or other properties, do it here.
                }
            }
        });
    }

    /**
     * Generates a unique ID for a form control based on its name attribute.
     * @param {string} name - The name attribute of the form control.
     * @returns {string} A unique ID string for the form control.
     */
    private generateIdFromName(name: string): string {
        // This method generates a valid ID based on the element's name attribute.
        // You have several options for how you want to generate the ID. For example, a GUID, a hash, etc.
        // For simplicity, we'll just use the name attribute.
        return `form-control-${name}`;
    }
}
