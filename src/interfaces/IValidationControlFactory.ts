import { IValidationControl } from "./IValidationControl";

export interface IValidationControlFactory {
    create(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): IValidationControl
}
