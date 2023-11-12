import { ISubmitHandler } from "./ISubmitHandler";

export interface IForm {
    name: string;
    id: string;
    isValid: boolean;
    formElement: HTMLFormElement;
    submitHandler: ISubmitHandler | undefined;
    attributes: NamedNodeMap;
    elements: HTMLFormControlsCollection;
    init(): void;
}
