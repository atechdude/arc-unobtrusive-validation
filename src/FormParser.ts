import { injectable } from "inversify";
import { ValidationParams } from "./Types";
import { IFormParser, IValidationInformation, IValidationRule } from "./interfaces";
import { Result } from "./Result";


@injectable()
export class FormParser implements IFormParser {
    private rulePriorities = new Map<string, number>([
        ["required", 1],
        ["regex", 2],
        ["length", 3],
        ["range", 4],
        ["remote-url", 5]
        // ... other rules with their respective priorities
    ]);
    ruleParamAttributes: Record<string, string[]> = {
        length: ["min", "max"],
        range: ["min", "max"],
        regex: ["pattern"]
        // ... other rules can be mapped similarly
    };
    constructor() {

    }


    parse(formElement: HTMLFormElement): Record<string, IValidationRule[]> {
        const validationRules: Record<string, IValidationRule[]> = {};

        const inputs = Array.from(formElement.elements) as HTMLElement[];

        inputs.forEach(input => {
            if ((input instanceof HTMLInputElement || input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement) && input.name) {
                const rules: IValidationRule[] = this.getValidationRules(input);
                // Assuming you have a function to assign priorities based on the rule type

                validationRules[input.name] = rules;
            }
        });

        return validationRules;
    }
    getValidationRules(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): IValidationRule[] {
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
    }
    getValidationInformation(input: HTMLElement): Result<IValidationInformation> {
        const rules: IValidationRule[] = this.getValidationRules(input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement);
        const validationInformation: IValidationInformation = {
            rules: rules,
            input: input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
            parentNode: input.parentNode
        } as IValidationInformation;

        return new Result<IValidationInformation>(validationInformation);
    }




}

// Usage
//const formParser = new FormParser(".form-create-account");
////const validationRules = formParser.parse();
//console.log(validationRules);
