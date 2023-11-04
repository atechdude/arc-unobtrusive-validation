import { injectable } from "inversify";
import { IValidationRule, IValidationRuleRegistry } from "./interfaces";
@injectable()
export class ValidationRuleRegistry implements IValidationRuleRegistry
{
    private rules: IValidationRule[] = [];
    public validationAttribute: string = "data-val";

    public setValidationAttribute(attribute: string): void {
        this.validationAttribute = attribute;
    }
    public addRule(rule: IValidationRule): void {
        this.rules.push(rule);
    }
    public getRulesForControl(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): IValidationRule[] {
        const validationTypeAttribute = input.getAttribute(this.validationAttribute);
        if (!validationTypeAttribute) return [];

        // Split the validation types into an array, allowing for a single type or a comma-separated list
        const validationTypes = validationTypeAttribute.split(",").map(type => type.trim());

        // Filter and return rules that match any of the types in the list
        return this.rules.filter(rule => validationTypes.includes(rule.type));
    }

}
