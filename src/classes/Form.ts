import { IForm, ISubmitHandler } from "../interfaces";
/**
 * Represents a form with validation capabilities.
 * Tracks the overall validity of the form and ensures each form control has a unique ID.
 */
export class Form implements IForm {
    formElement: HTMLFormElement;
    submitHandler: ISubmitHandler | undefined;
    name: string = "";
    id = "";
    action: string = "";
    method: string = "";
    attributes: NamedNodeMap;
    elements: HTMLFormControlsCollection;
    isValid: boolean = false;

    /**
     * Creates an instance of Form.
     * @param {HTMLFormElement} formElement - The HTML form element associated with this instance.
     */
    constructor(formElement: HTMLFormElement) {
        this.formElement = formElement;
        this.name = this.formElement.name;
        this.id = this.formElement.id;
        this.action = this.formElement.action;
        this.method = this.formElement.method;
        this.attributes = formElement.attributes;
        this.elements = formElement.elements;
        this.init();
    }
    /**
     * Initializes the form by assigning IDs to elements that don't already have them.
     */
    init(): void {

        // Not much here yet. Maybe another time :)
    }
}
