import {
    IDecoratedLogger,
    IValidationControl,
    IValidationResult,
    IValidationRule
} from "../interfaces";
import { Result } from "./Result";


export class ValidationControl implements IValidationControl {
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    isInteracted: boolean = false;
    validationRules: IValidationRule[] = [];
    isValid: boolean = false;
    isInteractedWith: boolean = false;
    constructor(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, private readonly _logger: IDecoratedLogger

    ) {
        this.control = control;
    }


    async validate(rules: IValidationRule[]): Promise<Result<IValidationResult>> {
        try {
            const value = this.control.value.trim();

            const validationResult: IValidationResult = {
                control: this.control,
                isValid: true,
                errorMessage: "",
                errorMessages: []
            };


            for (const rule of rules) {
                if (this.isInteracted) {
                    continue;
                }
                const ruleResult = await this.applyRule(rule, value);
                if (!ruleResult.isValid) {
                    validationResult.isValid = false;
                    validationResult.errorMessages.push(ruleResult.errorMessage);
                    // Optionally, break here if you want to stop at the first failure
                    break;
                }

            }
            // If there were validation errors, mark the field as interacted.
            if (validationResult.errorMessages.length > 0) {
                this.isInteracted = true;
            }
            return new Result<IValidationResult>(validationResult);
        }
        catch (error) {
            return new Result<IValidationResult>(error instanceof Error ? error : new Error(String(error)));
        }


    }
    private async applyRule(rule: IValidationRule, value: string): Promise<IValidationResult> {

        switch (rule.type) {
        case "required":
            return this.validateRequired(value, rule.message);
        case "length": {
            const minLength = rule.params.min ? parseInt(rule.params.min, 10) : 0; // Default to 0 if not specified
            const maxLength = rule.params.max ? parseInt(rule.params.max, 10) : Infinity; // Default to Infinity if not specified
            return this.validateLength(value, minLength, maxLength, rule.message);
        }
        case "maxlength": {
            const maxLength = rule.params.max ? parseInt(rule.params.max, 10) : Infinity; // Default to Infinity if not specified
            return this.validateLength(value, 0, maxLength, rule.message);
        }
        // minlength
        case "minlength": {
            const minLength = rule.params.min ? parseInt(rule.params.min, 10) : 0; // Default to 0 if not specified
            return this.validateLength(value, minLength, Infinity, rule.message);
        }
        case "equalto": {
            const compareToControlName = rule.params.other.replace(/^\*\./, ""); // Stripping out any leading '*.'
            return this.validateEqualTo(value, compareToControlName, rule.message);
        }
        case "regex":
            return rule.params.pattern
                ? this.validateRegex(value, rule.params.pattern, rule.message)
                : this.createValidationResult(true, "");
        case "range": {
            const min = rule.params.min !== undefined ? parseInt(rule.params.min, 10) : -Infinity;
            const max = rule.params.max !== undefined ? parseInt(rule.params.max, 10) : Infinity;
            return this.validateRange(value, min, max, rule.message);
        }
        case "email": {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return this.validateRegex(value, emailPattern.source, rule.message || "Invalid email address.");
        }
        case "phone": {
            const phonePattern = /^(?:\+1)?\s*(?:\([2-9]\d{2}\)\s*|\d{3}[\s.-]?)\d{3}[\s.-]?\d{4}$/;
            return this.validateRegex(value, phonePattern.source, rule.message || "Invalid phone number format.");
        }
        case "url": {
            const urlPattern = /^(http(s)?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
            return this.validateRegex(value, urlPattern.source, rule.message || "Invalid URL format.");
        }
        case "creditcard":
            return this.validateCreditCard(value, rule.message || "The credit card number is not valid.");
        case "remote": {
            const { url, additionalfields } = rule.params;
            return await this.validateRemote(value, url, additionalfields,rule.message);
        }
        default:
            break;
        }
        this.isValid = true;
        return this.createValidationResult(true, "");
    }


    private validateRequired(value: string, message: string): IValidationResult {
        if (!value) {
            return this.createValidationResult(false, message);
        }
        return this.createValidationResult(true, "");
    }
    private validateEqualTo(value: string, compareToControlName: string, errorMessage: string): IValidationResult {
        const compareControl = document.querySelector(`[name='${compareToControlName}']`) as HTMLInputElement;
        const isValid = compareControl && value === compareControl.value.trim();
        return this.createValidationResult(isValid, isValid ? "" : errorMessage || "The values do not match.");
    }
    private validateLength(value: string, minLength: number, maxLength: number, message: string): IValidationResult {
        if (value.length < minLength || value.length > maxLength) {
            return this.createValidationResult(false, message);
        }
        return this.createValidationResult(true, "");
    }

    private validateRegex(value: string, pattern: string, message: string): IValidationResult {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
            return this.createValidationResult(false, message);
        }
        return this.createValidationResult(true, "");
    }
    private validateRange(value: string, min: number, max: number, message: string): IValidationResult {
        const numericValue = parseFloat(value);
        const isValid = numericValue >= min && numericValue <= max;
        return this.createValidationResult(isValid, isValid ? "" : message);
    }
    private validateCreditCard(value: string, message: string): IValidationResult {
        const isValid = this.isValidCreditCard(value);
        return this.createValidationResult(isValid, isValid ? "" : message);
    }
    private async validateRemote(value: string, url: string, fields: string,errorMessage:string): Promise<IValidationResult> {
        let validationUrl = `${url}?${encodeURIComponent(this.control.name)}=${encodeURIComponent(value)}`;

        // Append additional fields to the URL if they exist
        if (fields) {
            const fieldsArray = fields.split(",").map(field => field.trim().replace(/^\*\./, ""));
            for (const fieldName of fieldsArray) {
                if (fieldName !== this.control.name) {
                    // Now 'fieldName' won't have the '*.' prefix.
                    const additionalFieldElement = this.control.form?.querySelector(`[name="${fieldName}"]`) as HTMLInputElement | null;

                    if (additionalFieldElement) {
                        validationUrl += `&${encodeURIComponent(fieldName)}=${encodeURIComponent(additionalFieldElement.value)}`;
                    } else {
                        // Log for debugging purposes
                        console.log(`Field with name ${fieldName} not found.`);
                    }
                }
            }
        }

        try {
            const response = await fetch(validationUrl);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const validationResult = await response.json();

            // The JSON response should contains at least a boolean `isValid` and may contain an optional string `errorMessage`
            if (typeof validationResult.isValid !== "boolean") {
                // The JSON does not have the expected shape.
                throw new Error("Invalid response format from server.");
            }
            return this.createValidationResult(validationResult.isValid, errorMessage);
        } catch (error) {
            this._logger.getLogger().error(error);
            let errorMessage = "Remote validation failed due to an unknown error. Please try again.";
            if (error instanceof TypeError) {
                // This usually indicates a network error.
                errorMessage = "Network error: Unable to reach the validation server. Please check your connection.";
            } else if (error instanceof Error) {
                // Generic error, possibly from the fetch operation itself (e.g., server responded with a status code).
                errorMessage = error.message;
            }
            return this.createValidationResult(false, errorMessage);
        }
    }

    private createValidationResult(isValid: boolean, errorMessage?: string | null): IValidationResult {
        return {
            control: this.control,
            isValid: isValid,
            errorMessage: errorMessage || "", // If errorMessage is null/undefined, default to an empty string
            errorMessages: errorMessage ? [errorMessage] : [] // Only include errorMessage in the array if it's truthy
        };
    }


    isValidCreditCard(value: string): boolean {
        // First, check if the input has only digits (after removing spaces)
        if (!/^\d+$/.test(value.replace(/\s+/g, ""))) {
            return false; // Contains non-numeric characters
        }

        // Remove all non-digit characters from the string
        const numericOnly = value.replace(/\D/g, "");

        // Implement Luhn Algorithm
        let sum = 0;
        let shouldDouble = false;

        // Loop through values starting from the rightmost side
        for (let i = numericOnly.length - 1; i >= 0; i--) {
            let digit = parseInt(numericOnly.charAt(i), 10);

            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }

            sum += digit;
            shouldDouble = !shouldDouble;
        }

        // If the sum modulo 10 is equal to 0, the number is valid
        return sum % 10 === 0;
    }

}
