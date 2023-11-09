import { IForm } from "../interfaces";

export class Form implements IForm {
    formElement: HTMLFormElement;
    isAjax: boolean = false;
    attributes: NamedNodeMap;
    elements: HTMLFormControlsCollection;
    element: Element;
    buttons: HTMLButtonElement[];
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
        this.init();
    }

    init(): void {
        // Check the attriubes to see if the form is ajax
        this.isAjax = this.formElement.hasAttribute("data-ajax");
        if (this.isAjax) {
            this.setupAjax();
        }
        Array.from(this.elements).forEach((element) => {
            if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLButtonElement) {
                if (!element.id && element.name) {
                    element.id = this.generateIdFromName(element.name);
                    // If you also need to set up ARIA attributes or other properties, do it here.
                }
            }
        });
    }

    setupAjax(): void {
        // Get the update target
        const updateTarget = this.attributes.getNamedItem("data-ajax-update");
        if (updateTarget === undefined) {
            throw new Error("data-ajax-update attribute is undefined");
        }
    }
    private generateIdFromName(name: string): string {
        // This method generates a valid ID based on the element's name attribute.
        // You have several options for how you want to generate the ID. For example, a GUID, a hash, etc.
        // For simplicity, we'll just use the name attribute.
        return `form-control-${name}`;
    }
}
