import { IDecoratedLogger, IValidationControl, IValidationResult, IValidationRule } from "../interfaces";
import { Result } from "./Result";
/**
 * Represents a control (input, select, textarea) within a form for validation purposes.
 * This class encapsulates the logic for applying validation rules to a control and determining its validity.
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
     * This constructor initializes the validation control with the provided HTML control and logger.
     */
    constructor(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, _logger: IDecoratedLogger);
    /**
     * Validates the control against a set of rules.
     * @param {IValidationRule[]} rules - An array of validation rules to apply to the control.
     * @returns {Promise<Result<IValidationResult>>} The result of the validation, wrapped in a Result object.
     * This method performs validation on the control using the provided rules and returns the validation result.
     */
    validate(rules: IValidationRule[]): Promise<Result<IValidationResult>>;
    /**
     * Applies a validation rule to the current control's value.
     * @param {IValidationRule} rule - The validation rule to apply.
     * @param {string} value - The current value of the control.
     * @returns {Promise<IValidationResult>} The result of applying the validation rule.
     */
    private applyRule;
    /**
     * Validates if a value is not empty.
     * @param {string} value - The value to be validated.
     * @param {string} message - The error message to display if the validation fails.
     * @returns {IValidationResult} - Result of the validation with status and message.
     */
    private validateRequired;
    /**
    // eslint-disable-next-line jsdoc/check-alignment
     * Validates if the value of the given control matches the value of another control.
     * @param {string} value - The value of the control to validate.
     * @param {string} compareToControlName - The name of the control to compare against.
     * @param {string} errorMessage - The error message to display if the validation fails.
     * @returns {IValidationResult} - Result of the validation with status and message.
     */
    private validateEqualTo;
    /**
     * Validates the length of a value against specified minimum and maximum lengths.
     * @param {string} value - The value to validate.
     * @param {number} minLength - The minimum acceptable length.
     * @param {number} maxLength - The maximum acceptable length.
     * @param {string} message - The error message to display if the validation fails.
     * @returns {IValidationResult} - Result of the validation with status and message.
     */
    private validateLength;
    /**
     * Validates if a value matches a specific regular expression pattern.
     * @param {string} value - The value to validate.
     * @param {string} pattern - The regex pattern to test against.
     * @param {string} message - The error message to display if the validation fails.
     * @returns {IValidationResult} - Result of the validation with status and message.
     */
    private validateRegex;
    /**
     * Validates if a numerical value falls within a specified range.
     * @param {string} value - The value to validate.
     * @param {number} min - The minimum acceptable value.
     * @param {number} max - The maximum acceptable value.
     * @param {string} message - The error message to display if the validation fails.
     * @returns {IValidationResult} - Result of the validation with status and message.
     */
    private validateRange;
    /**
     * Validates if a value is a valid credit card number.
     * @param {string} value - The credit card number to validate.
     * @param {string} message - The error message to display if the validation fails.
     * @returns {IValidationResult} - Result of the validation with status and message.
     */
    private validateCreditCard;
    /**
     * Performs remote validation by sending a request to a specified URL.
     * Appends additional fields to the request if provided.
     * Handles different types of errors including network issues and invalid server responses.
     * @param {string} value - The value of the control to be validated.
     * @param {string} url - The URL to which the validation request is sent.
     * @param {string} fields - Additional field names to include in the validation request.
     * @param {string} errorMessage - Default error message to use if the validation fails.
     * @returns {Promise<IValidationResult>} - A promise that resolves to the validation result.
     * @throws {Error} - Throws an error if the server response is not OK or if the response format is invalid.
     */
    private validateRemote;
    /**
     * Validates the file extension of a given input against a list of allowed extensions.
     * @param {string} value - The value of the input, typically the filename including the extension.
     * @param {string} allowedExtensions - A comma-separated string of allowed file extensions.
     * @param {string} message - The error message to display if the validation fails.
     * @returns {IValidationResult} An object representing the outcome of the validation.
     * This method checks whether the file extension of the input value is included in the list
     * of allowed extensions. It returns a validation result object with the validation status
     * and the appropriate error message if validation fails.
     */
    private validateFileExtensions;
    /**
     * Creates a validation result object.
     * @param {boolean} isValid - Indicates whether the control is valid.
     * @param {string | null} errorMessage - The error message to include in the result, if any.
     * @returns {IValidationResult} A validation result object.
     * This method constructs a validation result object based on the validation outcome.
     */
    private createValidationResult;
    /**
     * Checks if the provided credit card number is valid.
     * @param {string} value - The credit card number to validate.
     * @returns {boolean} True if the credit card number is valid, false otherwise.
     * This method uses the Luhn Algorithm to validate the credit card number.
     */
    private isValidCreditCard;
}
