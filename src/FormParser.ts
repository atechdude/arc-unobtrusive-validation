import { inject, injectable } from "inversify";
import { IFormParser, ILoggerService, IValidationInformation, IValidationRule } from "./interfaces";
import { Result } from "./Result";
import { TYPES } from "./di/container-types";


@injectable()
/**
 * Parses HTML forms to extract validation rules from data attributes.
 * @class
 *
 * The FormParser is responsible for traversing a form's inputs and parsing out
 * the validation rules defined via data attributes. It constructs a structured
 * representation of these rules, including their types, messages, parameters,
 * and priorities, which can then be used to perform client-side validation.
 */
export class FormParser implements IFormParser {
    /**
     * A map of validation rule types to their associated priority levels.
     * Higher priority rules will be processed first during validation.
     */
    private rulePriorities = new Map<string, number>([
        ["required", 1],
        ["regex", 2],
        ["length", 3],
        ["range", 4],
        ["remote-url", 5]
        // ... other rules with their respective priorities
    ]);
    constructor(@inject(TYPES.Logger) private readonly _logger: ILoggerService) {
        _logger.info("FormParser constructor");
    }
    /**
     * Parses the given HTML form element and extracts validation rules for each input.
     * @param {HTMLFormElement} formElement - The form element to parse.
     * @returns {Record<string, IValidationRule[]>} A record object where each key is the
     * name of a form control and each value is an array of validation rules associated
     * with that control. If an error occurs during parsing, it logs the error and
     * returns an empty object.
     */
    parse(formElement: HTMLFormElement): Record<string, IValidationRule[]> {
        try {
            const validationRules: Record<string, IValidationRule[]> = {};
            const inputs = Array.from(formElement.elements) as HTMLElement[];

            inputs.forEach(input => {
                if ((input instanceof HTMLInputElement || input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) && input.name) {
                    const rules: IValidationRule[] = this.getValidationRules(input);
                    validationRules[input.name] = rules;
                }
            });

            return validationRules;
        } catch (error) {
            this._logger.error(`Error parsing form: ${formElement.name}`, error);
            // If parsing fails, return an empty object or consider rethrowing the exception
            // after logging depending on how your application should respond to such situations.
            return {};
        }
    }

    /**
     * Extracts validation rules from an input element's data attributes.
     * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input - The input element to extract rules from.
     * @returns {IValidationRule[]} An array of validation rule objects extracted from the input's data attributes.
     * If an error occurs during the extraction process, it logs the error and returns an empty array.
     */
    getValidationRules(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): IValidationRule[] {
        try {
            const rules: IValidationRule[] = [];
            const rulesWithParams: Record<string, any> = {};

            Array.from(input.attributes).forEach(attr => {
                if (attr.name.startsWith("data-val")) {
                    const match = /data-val-([^\-]+)-?([^\-]+)?/.exec(attr.name);
                    if (match) {
                        const [, ruleType, paramName] = match;
                        if (!rulesWithParams[ruleType]) {
                            rulesWithParams[ruleType] = {
                                type: ruleType,
                                message: "",
                                params: {},
                                priority: this.rulePriorities.get(ruleType) || 99
                            };
                        }
                        // If it's a parameter of the rule, add it to the params object
                        if (paramName) {
                            rulesWithParams[ruleType].params[paramName] = attr.value;
                        } else {
                            // It's the main rule attribute, set the message
                            rulesWithParams[ruleType].message = attr.value;
                        }
                    }
                }
            });

            // Convert the aggregated rule objects back into an array
            Object.values(rulesWithParams).forEach(rule => {
                rules.push(rule);
            });

            // Sort the rules based on their assigned priority
            return rules.sort((a, b) => a.priority - b.priority);
        } catch (error) {
            this._logger.error(`Error getting validation rules for input: ${input.name}`, error);
            // If an error occurs, return an empty array to indicate no rules could be extracted.
            return [];
        }
    }


    /**
     * Retrieves validation-related information from an input element, including
     * its validation rules and any additional details needed for validation.
     * @param {HTMLElement} input - The input element to retrieve information from.
     * @returns {Result<IValidationInformation>} A Result object that either contains the validation information or an error.
     */
    getValidationInformation(input: HTMLElement): Result<IValidationInformation> {
        try {
            // Attempt to get the validation rules for the input element.
            const rules: IValidationRule[] = this.getValidationRules(input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement);
            // Construct the validation information object.
            const parentNode = input.parentNode as HTMLElement;
            const validationInformation: IValidationInformation = {
                rules: rules,
                input: input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
                parentNode:parentNode
            };
            // Return a successful Result with the validation information.
            return new Result<IValidationInformation>(validationInformation);
        } catch (error) {
            // Log the error encountered during rule retrieval.
            this._logger.error(`Error getting validation information for input: ${input}`, error);
            // Return a Result object containing the error.
            return new Result<IValidationInformation>(error instanceof Error ? error : new Error(String(error)));
        }
    }

}


