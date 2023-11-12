export interface IValidationResult {
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    isValid: boolean;
    errorMessages: string[];
    errorMessage: string;
}
