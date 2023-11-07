export interface IForm {
    formElement: HTMLFormElement;
    isAjax: boolean;
    attributes: NamedNodeMap;
    elements: HTMLFormControlsCollection;
    element: Element;
    buttons: HTMLButtonElement[];
    init(): void;
}
