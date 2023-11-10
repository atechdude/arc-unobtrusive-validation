export interface IForm {
    isValid: boolean;
    formElement: HTMLFormElement;
    attributes: NamedNodeMap;
    elements: HTMLFormControlsCollection;
    element: Element;
    buttons: HTMLButtonElement[];
    init(): void;
}
