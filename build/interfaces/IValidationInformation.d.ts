import { IValidationRule } from "./IValidationRule";
export interface IValidationInformation {
    rules: IValidationRule[];
    input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    parentNode: HTMLElement;
}
