export interface IValidationService {
    validateControl(
        control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    ): Promise<void>;
}
