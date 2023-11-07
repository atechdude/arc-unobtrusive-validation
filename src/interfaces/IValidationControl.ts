import { Result } from "../classes/Result";
import { IValidationResult } from "./IValidationResult";
import { IValidationRule } from "./IValidationRule";
export interface IValidationControl {
    control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    validationRules: IValidationRule[];
    isValid: boolean;
    validate(rules: IValidationRule[]): Promise<Result<IValidationResult>>;
}
