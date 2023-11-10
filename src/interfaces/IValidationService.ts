import { IForm } from "./IForm";

export interface IValidationService {
    validateForm(form: IForm): Promise<boolean>;
    validateControl(
        control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    ): Promise<boolean>;
}
