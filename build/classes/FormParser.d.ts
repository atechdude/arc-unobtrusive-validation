import { IFormParser, ILogger, IValidationInformation, IValidationRule } from "../interfaces";
import { Result } from "./Result";
export declare class FormParser implements IFormParser {
    private readonly _logger;
    /**
     * A map of validation rule types to their associated priority levels.
     * Higher priority rules will be processed first during validation.
     */
    private rulePriorities;
    constructor(_logger: ILogger);
    /**
     * Parses the given HTML form element and extracts validation rules for each input.
     * @param {HTMLFormElement} formElement - The form element to parse.
     * @returns {Record<string, IValidationRule[]>} A record object where each key is the
     * name of a form control and each value is an array of validation rules associated
     * with that control. If an error occurs during parsing, it logs the error and
     * returns an empty object.
     */
    parse(formElement: HTMLFormElement): Record<string, IValidationRule[]>;
    /**
     * Extracts validation rules from an input element's data attributes.
     * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input - The input element to extract rules from.
     * @returns {IValidationRule[]} An array of validation rule objects extracted from the input's data attributes.
     * If an error occurs during the extraction process, it logs the error and returns an empty array.
     */
    getValidationRules(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): IValidationRule[];
    /**
     * Retrieves validation-related information from an input element, including
     * its validation rules and any additional details needed for validation.
     * @param {HTMLElement} input - The input element to retrieve information from.
     * @returns {Result<IValidationInformation>} A Result object that either contains the validation information or an error.
     */
    getValidationInformation(input: HTMLElement): Result<IValidationInformation>;
}
