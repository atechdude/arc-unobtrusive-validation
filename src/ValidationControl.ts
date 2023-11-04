import { Result } from "./Result";
import { IValidationResult } from "./interfaces";

type ValidationRule = {
    type: "required" | "length" | "range" | "regex" | "compare" | "minlength" | "phone" | "url" | "creditcard" | "fileextensions" | "remote" | "email";
    message: string;
    priority: number;
    maxLength?: number;
    minLength?: number;
    maclength?: number;
    maxRange?: number;
    minRange?: number;
    pattern?: string;
    compareTo?: string;
    phone?: string;
    url?: string;
    creditcard?: string;
    extensions?: string;
    additionalFields?: string;
    remote?: string;
    email?: string;
};

export class ValidationControl {
    control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    isInteracted: boolean = false;
    rules: ValidationRule[];

    constructor(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) {
        this.control = control;
        this.rules = this.extractRules(control);
    }

    private extractRules(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): ValidationRule[] {
        const rules: ValidationRule[] = [];
        const attributesArray = Array.from(control.attributes);

        // Loop over all attributes
        for (const attr of attributesArray) {
            //const t = control.querySelector(`[data-valmsg-for="${control.name}"]`);
            console.log(attr);


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
                        maxLength: control.getAttribute("data-val-length-max") ? parseInt(control.getAttribute("data-val-length-max")!) : undefined,
                        minLength: control.getAttribute("data-val-length-min") ? parseInt(control.getAttribute("data-val-length-min")!) : undefined,
                        priority: 1
                    });
                }

                // For range rule
                else if (attr.name === "data-val-range") {
                    rules.push({
                        type: "range",
                        message: attr.value,
                        maxRange: control.getAttribute("data-val-range-max") ? parseInt(control.getAttribute("data-val-range-max")!) : undefined,
                        minRange: control.getAttribute("data-val-range-min") ? parseInt(control.getAttribute("data-val-range-min")!) : undefined,
                        priority: 2
                    });
                }

                // For regex rule
                else if (attr.name === "data-val-regex") {
                    rules.push({
                        type: "regex",
                        message: attr.value,
                        pattern: control.getAttribute("data-val-regex-pattern") ?? undefined,
                        priority: 3
                    });
                }
                else if (attr.name === "data-val-equalto") {
                    const compareToControlName = control.getAttribute("data-val-equalto-other");
                    if (compareToControlName) {
                        const nameToSearch = compareToControlName.replace("*.", ""); // Removes "*." if present
                        rules.push({
                            type: "compare",
                            message: attr.value,
                            compareTo: nameToSearch,
                            priority: 4
                        });
                    }
                }
                else if (attr.name === "data-val-minlength") {
                    rules.push({
                        type: "minlength",
                        message: attr.value,
                        minLength: control.getAttribute("data-val-minlength-min") ? parseInt(control.getAttribute("data-val-minlength-min")!) : undefined,
                        priority: 5 // Assign appropriate priority
                    });
                }
                else if (attr.name === "data-val-phone") {
                    rules.push({
                        type: "phone",
                        message: attr.value,
                        priority: 6
                    });
                }
                else if (attr.name === "data-val-url") {
                    rules.push({
                        type: "url",
                        message: attr.value,
                        priority: 7
                    });
                }
                else if (attr.name === "data-val-creditcard") {
                    rules.push({
                        type: "creditcard",
                        message: attr.value,
                        priority: 8
                    });
                }
                else if (attr.name === "data-val-fileextensions") {
                    rules.push({
                        type: "fileextensions",
                        message: attr.value,
                        extensions: control.getAttribute("data-val-fileextensions-extensions") ?? undefined,
                        priority: 9
                    });
                }
                else if (attr.name === "data-val-remote") {
                    rules.push({
                        type: "remote",
                        message: attr.value,
                        remote: control.getAttribute("data-val-remote-url") ?? undefined,
                        additionalFields: control.getAttribute("data-val-remote-additionalfields") ?? undefined,
                        priority: 11
                    });
                }
                else if (attr.name === "data-val-email") {
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
    }
    async validate(): Promise<Result<IValidationResult>> {
        let errorMessage = "";
        let isValid: boolean = true;

        // Sort rules based on priority before processing
        const sortedRules = this.rules.sort((a, b) => a.priority - b.priority);

        for (const rule of sortedRules) {
            const value = this.control.value.trim();

            switch (rule.type) {
            case "required":
                if (!value) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            case "length":
                if ((rule.maxLength !== undefined && value.length > rule.maxLength) ||
                        (rule.minLength !== undefined && value.length < rule.minLength)) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            case "range": {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    if ((rule.maxRange !== undefined && numValue > rule.maxRange) ||
                            (rule.minRange !== undefined && numValue < rule.minRange)) {
                        errorMessage = rule.message;
                        isValid = false;
                    }
                }
                break;
            }
            case "regex":
                if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            case "compare": {

                const compareToControlName = rule.compareTo;
                if (compareToControlName) {
                    const compareControl = document.querySelector(`[name='${compareToControlName}']`) as HTMLInputElement;
                    if (compareControl && value !== compareControl.value.trim()) {
                        errorMessage = rule.message;
                        isValid = false;
                    }
                }

                break;
            }
            case "minlength":
                if (rule.minLength !== undefined && value.length < rule.minLength) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            case "phone": {
                const phonePattern = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/; // Simple pattern for US phone numbers
                if (!phonePattern.test(value)) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            }

            case "url": {
                // This pattern checks for a basic valid URL (http, https, ftp)
                const urlPattern = new RegExp(
                    "^(https?:\\/\\/)?" + // Protocol
                        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // Domain name
                        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
                        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // Port and path
                        "(\\?[;&a-z\\d%_.~+=-]*)?" + // Query string
                        "(\\#[-a-z\\d_]*)?$", "i" // Fragment locator
                );

                if (!urlPattern.test(value)) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            }
            case "creditcard":
                if (!this.isValidCreditCard(value)) {
                    errorMessage = rule.message;
                    isValid = false;
                }
                break;
            case "fileextensions": {
                const extensionsError = this.control.getAttribute("data-val-fileextensions");
                const allowedExtensionsAttribute = this.control.getAttribute("data-val-fileextensions-extensions");

                if (extensionsError && allowedExtensionsAttribute) {
                    const allowedExtensions = allowedExtensionsAttribute.split(",").map(ext => ext.trim().toLowerCase());
                    const files = (this.control as HTMLInputElement).files;
                    const fileArray = files ? Array.from(files) : [];
                    const invalidFiles = fileArray.filter(file => {
                        const fileExtension = file.name.split(".").pop()?.toLowerCase();
                        return !fileExtension || !allowedExtensions.includes(fileExtension);
                    });

                    if (invalidFiles.length > 0) {
                        const invalidFileNames = invalidFiles.map(file => file.name).join(", ");
                        errorMessage = `${extensionsError}. The following files have invalid extensions: ${invalidFileNames}`;
                        isValid = false;
                    }
                }
                break;
            }
            case "remote": {

                const url = rule.remote;
                if (url && this.control && this.control.value) {

                    //const paramName = this.control.value;
                    const encodedURI = encodeURIComponent(this.control.value);
                    const validationUrl = `${url}?${this.control.name}=${encodedURI}`;

                    try {
                        console.log("Remote validation started with url: ", validationUrl);
                        const response = await fetch(validationUrl, {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json"
                            }
                        });

                        if (response.ok) {
                            const responseData = await response.json();
                            isValid = responseData.isValid;
                            errorMessage = rule.message;
                        } else {
                            throw new Error("Failed to validate remotely");
                        }
                    } catch (error) {
                        console.error("Remote validation error:", error);
                        isValid = false;
                        errorMessage = "Error during remote validation.";
                    }
                }
                break;
            }
            case "email": {
                // A common regex pattern for validating an email address
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                // Perform regex email validation
                if (!emailPattern.test(this.control.value)) {
                    errorMessage = rule.message || "Invalid email address.";
                    isValid = false;
                }
                break;
            }
            }




            if (!isValid) break;
        }

        return new Result<IValidationResult>({
            isValid: isValid,
            errorMessage: errorMessage,
            control: this.control as any
        });
    }

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
