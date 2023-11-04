import { IForm } from "./interfaces";

export class Form implements IForm {
    formElement: HTMLFormElement;
    isAjax: boolean = false;
    attributes: NamedNodeMap;
    elements: HTMLFormControlsCollection;
    buttons: HTMLButtonElement[];
    constructor(formElement: HTMLFormElement) {
        this.formElement = formElement;
        this.attributes = formElement.attributes;
        this.elements = formElement.elements;
        this.buttons = Array.from(this.elements).filter(el => el instanceof HTMLButtonElement) as HTMLButtonElement[];
        this.init();
    }



    init(): void {
        // Check the attriubes to see if the form is ajax
        this.isAjax = this.formElement.hasAttribute("data-ajax");
        if (this.isAjax) {
            this.setupAjax();
        }

    }

    setupAjax(): void {
        // Get the update target
        const updateTarget = this.attributes.getNamedItem("data-ajax-update");
        if (updateTarget === undefined) {
            throw new Error("data-ajax-update attribute is undefined");
        }
    }
}
