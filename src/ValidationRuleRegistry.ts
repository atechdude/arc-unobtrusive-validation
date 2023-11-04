import { injectable } from "inversify";
import { IValidationRule, IValidationRuleRegistry } from "./interfaces";
@injectable()
export class ValidationRuleRegistry implements IValidationRuleRegistry{
    private rules: IValidationRule[] = [];

    public addRule(rule: IValidationRule): void {
        this.rules.push(rule);
    }

    public getRules(): IValidationRule[] {
        return this.rules;
    }
}
