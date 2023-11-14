import { injectable } from "inversify";
import { IForm, ISubmitHandler } from "../interfaces";
/**
 * Represents a form with its associated properties and behaviors.
 * This class encapsulates the HTML form element and provides additional functionality
 * such as validation and event handling.
 */
@injectable()
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
      * This constructor initializes the form properties, including name, id, action, method,
      * attributes, and elements from the passed HTMLFormElement.
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
     * Initializes the form by performing any required setup.
     * This method is intended to be extended with custom initialization logic as needed.
     */
    init(): void {
        // Nothing Here At The Moment.
    }


}
