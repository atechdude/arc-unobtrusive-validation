import { IValidationRuleRegistry } from "./interfaces";

export class ValidationRuleRegistry implements IValidationRuleRegistry{
    private ruleParamAttributes: Record<string, string[]> = {};

    public addRule(ruleType: string, paramAttributes: string[]): void {
        this.ruleParamAttributes[ruleType] = paramAttributes;
    }

    public removeRule(ruleType: string): void {
        delete this.ruleParamAttributes[ruleType];
    }

    public getParamsForRule(ruleType: string): string[] | undefined {
        return this.ruleParamAttributes[ruleType];
    }
}

