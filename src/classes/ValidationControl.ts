import {
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
    //rules: ValidationRule[];

    constructor(
        control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    ) {
        this.control = control;
        //this.rules = this.extractRules(control);
    }

    async validate(rules: IValidationRule[]): Promise<Result<IValidationResult>> {
        let errorMessage = "";
        let isValid = true;

        const value = this.control.value.trim();

        for (const rule of rules) {
            console.log(rule);
            switch (rule.type) {
            case "required": {
                if (!value) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            }
            case "length": {
                const { min, max } = rule.params;
                const valueLength = value.length;

                // If min or max are not defined, they won't be checked
                const minLength = min ? parseInt(min, 10) : null;
                const maxLength = max ? parseInt(max, 10) : null;

                // Check against minimum length if specified
                if (minLength !== null && valueLength < minLength) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                // Check against maximum length if specified
                else if (maxLength !== null && valueLength > maxLength) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            }
            case "regex": {
                // Ensure the pattern is provided, if not, skip this rule
                if (!rule.params.pattern) {
                    break;
                }

                // Create a regular expression from the pattern string
                const pattern = new RegExp(rule.params.pattern);

                // Test the current value against the regex pattern
                if (!pattern.test(value)) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            }

            }



            // If already invalid, no need to check further
            if (!isValid) {
                break;
            }
        }

        // Here we're returning a Result object with the validation result
        const validationResult: IValidationResult = {
            isValid: isValid,
            errorMessage: errorMessage,
            control: this.control as HTMLInputElement
        };

        return new Result<IValidationResult>(isValid ? validationResult : new Error(errorMessage));
    }


    /* private extractRules(
        control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    ): ValidationRule[] {
        const rules: ValidationRule[] = [];
        const attributesArray = Array.from(control.attributes);

        // Loop over all attributes
        for (const attr of attributesArray) {
            // Check if attribute starts with 'data-val-'
            if (attr.name.startsWith("data-val-")) {
                // For required rule
                if (attr.name === "data-val-required") {
                    rules.push({
                        type: "required",
                        message: attr.value,
                        priority: 0
                    });
                }

                // For length rule
                else if (attr.name === "data-val-length") {
                    rules.push({
                        type: "length",
                        message: attr.value,
                        maxLength: control.getAttribute("data-val-length-max")
                            ? parseInt(
                                  control.getAttribute("data-val-length-max")!
                            )
                            : undefined,
                        minLength: control.getAttribute("data-val-length-min")
                            ? parseInt(
                                  control.getAttribute("data-val-length-min")!
                            )
                            : undefined,
                        priority: 1
                    });
                }

                // For range rule
                else if (attr.name === "data-val-range") {
                    rules.push({
                        type: "range",
                        message: attr.value,
                        maxRange: control.getAttribute("data-val-range-max")
                            ? parseInt(
                                  control.getAttribute("data-val-range-max")!
                            )
                            : undefined,
                        minRange: control.getAttribute("data-val-range-min")
                            ? parseInt(
                                  control.getAttribute("data-val-range-min")!
                            )
                            : undefined,
                        priority: 2
                    });
                }

                // For regex rule
                else if (attr.name === "data-val-regex") {
                    rules.push({
                        type: "regex",
                        message: attr.value,
                        pattern:
                            control.getAttribute("data-val-regex-pattern") ??
                            undefined,
                        priority: 3
                    });
                } else if (attr.name === "data-val-equalto") {
                    const compareToControlName = control.getAttribute(
                        "data-val-equalto-other"
                    );
                    if (compareToControlName) {
                        const nameToSearch = compareToControlName.replace(
                            "*.",
                            ""
                        ); // Removes "*." if present
                        rules.push({
                            type: "compare",
                            message: attr.value,
                            compareTo: nameToSearch,
                            priority: 4
                        });
                    }
                } else if (attr.name === "data-val-minlength") {
                    rules.push({
                        type: "minlength",
                        message: attr.value,
                        minLength: control.getAttribute(
                            "data-val-minlength-min"
                        )
                            ? parseInt(
                                  control.getAttribute(
                                      "data-val-minlength-min"
                                  )!
                            )
                            : undefined,
                        priority: 5 // Assign appropriate priority
                    });
                } else if (attr.name === "data-val-phone") {
                    rules.push({
                        type: "phone",
                        message: attr.value,
                        priority: 6
                    });
                } else if (attr.name === "data-val-url") {
                    rules.push({
                        type: "url",
                        message: attr.value,
                        priority: 7
                    });
                } else if (attr.name === "data-val-creditcard") {
                    rules.push({
                        type: "creditcard",
                        message: attr.value,
                        priority: 8
                    });
                } else if (attr.name === "data-val-fileextensions") {
                    rules.push({
                        type: "fileextensions",
                        message: attr.value,
                        extensions:
                            control.getAttribute(
                                "data-val-fileextensions-extensions"
                            ) ?? undefined,
                        priority: 9
                    });
                } else if (attr.name === "data-val-remote") {
                    rules.push({
                        type: "remote",
                        message: attr.value,
                        remote:
                            control.getAttribute("data-val-remote-url") ??
                            undefined,
                        additionalFields:
                            control.getAttribute(
                                "data-val-remote-additionalfields"
                            ) ?? undefined,
                        priority: 11
                    });
                } else if (attr.name === "data-val-email") {
                    rules.push({
                        type: "email",
                        message: attr.value,
                        priority: 10
                    });
                }
            }
        }
        // Sort on Priority
        return rules.sort((a, b) => a.priority - b.priority);
    } */


    isValidCreditCard(value: string): boolean {
        // Remove all non-digit characters from the string
        const numericOnly = value.replace(/\D/g, "");

        // Luhn's algorithm begins with the rightmost digit and moves left
        let sum = 0;
        let shouldDouble = false;

        // Loop through values starting from the rightmost side
        for (let i = numericOnly.length - 1; i >= 0; i--) {
            let digit = parseInt(numericOnly.charAt(i), 10);

            if (shouldDouble) {
                // If double of digit is more than 9, add the digits
                // Otherwise, just double the value
                if ((digit *= 2) > 9) digit -= 9;
            }

            sum += digit;
            // Alternate the value of shouldDouble
            shouldDouble = !shouldDouble;
        }

        // If the sum modulo 10 is equal to 0, the number is valid
        return sum % 10 === 0;
    }
}
