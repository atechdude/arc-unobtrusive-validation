import { injectable } from "inversify";
import { ValidationParams } from "./Types";
import { IFormParser, IValidationInformation, IValidationRule } from "./interfaces";
import { Result } from "./Result";


@injectable()
export class FormParser implements IFormParser{

    ruleParamAttributes: Record<string, string[]> = {
        length: ["min", "max"],
        range: ["min", "max"],
        regex: ["pattern"]
        // ... other rules can be mapped similarly
    };
    constructor() {

    }

    parse(formElement:HTMLFormElement): Record<string, IValidationRule[]> {
        const validationRules: Record<string, IValidationRule[]> = {};

        const inputs = Array.from(formElement.elements) as HTMLElement[];

        inputs.forEach(input => {
            if (input instanceof HTMLInputElement && input.name) {
                const rules = this.getValidationRules(input);
                if (rules.length) {
                    validationRules[input.name] = rules;
                }
            }
        });

        return validationRules;
    }
    getValidationInformation(input:HTMLElement):Result<IValidationInformation>
    {
        const rules: IValidationRule[] = this.getValidationRules(input);
        console.log(rules);
        const validationInformation:IValidationInformation = {
            rules:rules,
            input:input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
            parentNode:input.parentNode
        } as IValidationInformation;

        return new Result<IValidationInformation>(validationInformation);
    }
    getValidationRules(input: HTMLElement): IValidationRule[] {
        const rules: IValidationRule[] = [];

        Array.from(input.attributes).forEach(attr => {
            if (attr.name.startsWith("data-val")) {
                const ruleType = attr.name.replace("data-val-", "");
                const message = input.getAttribute(`data-val-${ruleType}`) || "";
                const params: ValidationParams = this.extractParams(input, ruleType);

                rules.push({ type: ruleType, message, params });
            }
        });

        return rules;
    }

    private extractParams(input: HTMLElement, ruleType: string): ValidationParams {
        const params: ValidationParams = {};
        const paramAttributes = this.ruleParamAttributes[ruleType];

        if (paramAttributes) {
            paramAttributes.forEach(param => {
                const value = input.getAttribute(`data-val-${ruleType}-${param}`);
                if (value !== null) {
                    params[param] = value;
                }
            });
        }

        return params;
    }
}

// Usage
//const formParser = new FormParser(".form-create-account");
////const validationRules = formParser.parse();
//console.log(validationRules);
