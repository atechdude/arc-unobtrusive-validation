import { IForm, ISubmitHandler } from "../interfaces";
/**
 * Represents a form with its associated properties and behaviors.
 * This class encapsulates the HTML form element and provides additional functionality
 * such as validation and event handling.
 */
export declare class Form implements IForm {
    formElement: HTMLFormElement;
    submitHandler: ISubmitHandler | undefined;
    name: string;
    id: string;
    action: string;
    method: string;
    attributes: NamedNodeMap;
    elements: HTMLFormControlsCollection;
    isValid: boolean;
    /**
      * Creates an instance of Form.
      * @param {HTMLFormElement} formElement - The HTML form element associated with this instance.
      * This constructor initializes the form properties, including name, id, action, method,
      * attributes, and elements from the passed HTMLFormElement.
      */
    constructor(formElement: HTMLFormElement);
    /**
     * Initializes the form by performing any required setup.
     * This method is intended to be extended with custom initialization logic as needed.
     */
    init(): void;
}
