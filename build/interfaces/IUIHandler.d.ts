import { IValidationResult } from "./IValidationResult";
export interface IUIHandler {
    updateValidationMessage(validationResult: IValidationResult): void;
}
