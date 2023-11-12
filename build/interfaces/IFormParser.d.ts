import { Result } from "../classes/Result";
import { IValidationInformation } from "./IValidationInformation";
import { IValidationRule } from "./IValidationRule";
export interface IFormParser {
    parse(formElement: HTMLFormElement): Record<string, IValidationRule[]>;
    getValidationRules(input: HTMLElement): IValidationRule[];
    getValidationInformation(input: HTMLElement): Result<IValidationInformation>;
}
