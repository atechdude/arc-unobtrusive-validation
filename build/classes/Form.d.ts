import { IForm, ISubmitHandler } from "../interfaces";
/**
 * Represents a form with validation capabilities.
 * Tracks the overall validity of the form and ensures each form control has a unique ID.
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
     */
    constructor(formElement: HTMLFormElement);
    /**
     * Initializes the form by assigning IDs to elements that don't already have them.
     */
    init(): void;
}
