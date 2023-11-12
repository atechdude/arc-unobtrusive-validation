import { IDecoratedLogger, IValidationControl, IValidationResult, IValidationRule } from "../interfaces";
import { Result } from "./Result";
/**
 * Represents a control element with validation logic.
 */
export declare class ValidationControl implements IValidationControl {
    private readonly _logger;
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    isInteracted: boolean;
    validationRules: IValidationRule[];
    isValid: boolean;
    isInteractedWith: boolean;
    /**
     * Creates an instance of the ValidationControl class.
     * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} control - The control to be validated.
     * @param {IDecoratedLogger} _logger - Logger for debugging and error messages.
     */
    constructor(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, _logger: IDecoratedLogger);
    /**
     * Validates the control against a set of rules.
     * @param {IValidationRule[]} rules - An array of validation rules to apply to the control.
     * @returns {Promise<Result<IValidationResult>>} The result of the validation, wrapped in a Result object.
     */
    validate(rules: IValidationRule[]): Promise<Result<IValidationResult>>;
    /**
     * Applies a validation rule to the current control's value.
     * @param {IValidationRule} rule - The validation rule to apply.
     * @param {string} value - The current value of the control.
     * @returns {Promise<IValidationResult>} The result of applying the validation rule.
     */
    private applyRule;
    private validateRequired;
    private validateEqualTo;
    private validateLength;
    private validateRegex;
    private validateRange;
    private validateCreditCard;
    private validateRemote;
    private validateFileExtensions;
    private createValidationResult;
    private isValidCreditCard;
}
